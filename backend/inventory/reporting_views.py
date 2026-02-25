from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F, ExpressionWrapper, DurationField, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem, MenuItem
from pms.models import Room, Booking
from finance.models import Invoice, Payment

class ReportingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Helper for time ranges
        timeframes = {
            'today': today_start,
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            'year': now - timedelta(days=365)
        }
        
        # Revenue Stats
        revenue_data = {}
        for label, start_date in timeframes.items():
            # Total Revenue
            total = Order.objects.filter(created_at__gte=start_date, status='SERVED') \
                .aggregate(sum=Sum('total_amount'))['sum'] or 0.00
                
            # Kitchen Revenue (Food Items)
            kitchen_sales = OrderItem.objects.filter(
                order__created_at__gte=start_date, 
                order__status='SERVED',
                menu_item__preparation_station='KITCHEN'
            ).annotate(item_total=F('price_at_time') * F('quantity')).aggregate(sum=Sum('item_total'))['sum'] or 0.00
            
            # Bar Revenue (Drink Items)
            bar_sales = OrderItem.objects.filter(
                order__created_at__gte=start_date, 
                order__status='SERVED',
                menu_item__preparation_station='BAR'
            ).annotate(item_total=F('price_at_time') * F('quantity')).aggregate(sum=Sum('item_total'))['sum'] or 0.00

            # Waiter Revenue
            waiter_sales = total 

            revenue_data[label] = {
                'total': float(total),
                'kitchen': float(kitchen_sales),
                'bar': float(bar_sales),
                'waiter': float(waiter_sales)
            }

        # Kitchen Specific Stats (Today)
        kitchen_today_orders = Order.objects.filter(
            created_at__gte=today_start,
            items__menu_item__preparation_station='KITCHEN'
        ).distinct()
        
        kitchen_processed = kitchen_today_orders.count()
        kitchen_served = kitchen_today_orders.filter(status='SERVED').count()
        
        # Avg Prep Time (Created to Ready)
        kitchen_avg_prep = Order.objects.filter(
            created_at__gte=today_start,
            status__in=['READY', 'SERVED'],
            items__menu_item__preparation_station='KITCHEN'
        ).distinct().annotate(
            duration=ExpressionWrapper(F('updated_at') - F('created_at'), output_field=DurationField())
        ).aggregate(avg_prep=Avg('duration'))['avg_prep']
        
        kitchen_avg_mins = int(kitchen_avg_prep.total_seconds() / 60) if kitchen_avg_prep else 0

        # Waiter Specific Stats (Today)
        waiter_processed = Order.objects.filter(created_at__gte=today_start).count()
        waiter_served = Order.objects.filter(created_at__gte=today_start, status='SERVED').count()
        
        # Avg Service Time (Created to Served)
        waiter_avg_service = Order.objects.filter(
            created_at__gte=today_start,
            status='SERVED'
        ).annotate(
            duration=ExpressionWrapper(F('updated_at') - F('created_at'), output_field=DurationField())
        ).aggregate(avg_svc=Avg('duration'))['avg_svc']
        
        waiter_avg_mins = int(waiter_avg_service.total_seconds() / 60) if waiter_avg_service else 0

        # Finance Stats
        today_collection = Payment.objects.filter(date_paid__gte=today_start).aggregate(sum=Sum('amount'))['sum'] or 0.00
        pending_invoices = Invoice.objects.filter(is_paid=False).aggregate(sum=Sum('total_ft'))['sum'] or 0.00

        # Top Selling Items (Month)
        top_items = OrderItem.objects.filter(order__created_at__gte=timeframes['month'], order__status='SERVED') \
            .values('menu_item__name', 'menu_item__preparation_station') \
            .annotate(count=Sum('quantity'), total_rev=Sum(F('price_at_time') * F('quantity'))) \
            .order_by('-count')[:5]
        
        # Latest Top Kitchen Item
        top_kitchen_item = OrderItem.objects.filter(
            order__created_at__gte=timeframes['month'], 
            order__status='SERVED',
            menu_item__preparation_station='KITCHEN'
        ).values('menu_item__name').annotate(count=Sum('quantity')).order_by('-count').first()

        # Recent Activity (Latest Orders)
        recent_orders = Order.objects.all().order_by('-created_at')[:20]
        recent_log = []
        for order in recent_orders:
            recent_log.append({
                'id': order.id,
                'room': f"Room {order.room}" if order.room else "Counter/Table",
                'status': order.status,
                'total_amount': str(order.total_amount),
                'created_at': order.created_at.isoformat()
            })
        
        # Room & Guest Stats
        room_stats = {
            'available': Room.objects.filter(status='AVAILABLE').count(),
            'total': Room.objects.count()
        }
        
        active_guests = Booking.objects.filter(
            status='CONFIRMED', 
            check_in__lte=now.date(), 
            check_out__gte=now.date()
        ).count()
        
        return Response({
            'revenue': revenue_data,
            'kitchen_stats': {
                'revenue_today': float(revenue_data['today']['kitchen']),
                'processed': kitchen_processed,
                'served': kitchen_served,
                'avg_time': kitchen_avg_mins,
                'top_item': top_kitchen_item['menu_item__name'] if top_kitchen_item else "N/A",
                'top_item_sold': top_kitchen_item['count'] if top_kitchen_item else 0
            },
            'waiter_stats': {
                'revenue_today': float(total_today := Order.objects.filter(created_at__gte=today_start, status='SERVED').aggregate(sum=Sum('total_amount'))['sum'] or 0.00),
                'processed': waiter_processed,
                'served': waiter_served,
                'avg_time': waiter_avg_mins
            },
            'finance_stats': {
                'today_collection': float(today_collection),
                'pending_invoices': float(pending_invoices)
            },
            'top_items': top_items,
            'recent_log': recent_log,
            'rooms': room_stats,
            'active_guests': active_guests
        })
