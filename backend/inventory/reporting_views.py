from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.utils import timezone
from datetime import timedelta
from .models import Order, OrderItem
from pms.models import Room, Booking

class ReportingViewSet(viewsets.ViewSet):
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        now = timezone.now()
        
        # Helper for time ranges
        timeframes = {
            'today': now.replace(hour=0, minute=0, second=0, microsecond=0),
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

            # Waiter Revenue (Assuming all served orders are credited to waiters)
            # This logic basically mirrors total revenue for now, as waiters serve everything.
            waiter_sales = total 

            revenue_data[label] = {
                'total': total,
                'kitchen': kitchen_sales,
                'bar': bar_sales,
                'waiter': waiter_sales
            }

        # Top Selling Items (Month)
        top_items = OrderItem.objects.filter(order__created_at__gte=timeframes['month'], order__status='SERVED') \
            .values('menu_item__name', 'menu_item__preparation_station') \
            .annotate(count=Sum('quantity'), total_rev=Sum(F('price_at_time') * F('quantity'))) \
            .order_by('-count')[:10]
        
        # Recent Activity (Latest Orders)
        recent_orders = Order.objects.all().order_by('-created_at')[:20]
        recent_log = []
        for order in recent_orders:
            recent_log.append({
                'id': order.id,
                'room': f"Room {order.room.room_number}" if order.room else "Counter/Table",
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
            'top_items': top_items,
            'recent_log': recent_log,
            'rooms': room_stats,
            'active_guests': active_guests
        })
