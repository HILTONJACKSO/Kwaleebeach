from rest_framework import generics, status, viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import MenuCategory, MenuItem, Order, InventoryItem, InventoryStock, StockTransfer, Department, OrderReturn, RestaurantTable, OrderReturnItem
from .serializers import (
    MenuCategorySerializer, MenuItemSerializer, OrderSerializer,
    InventoryItemSerializer, InventoryStockSerializer, StockTransferSerializer, OrderReturnSerializer,
    RestaurantTableSerializer
)
from django.db import transaction
from decimal import Decimal
from django.utils import timezone

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('name')
    serializer_class = InventoryItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'sku']

    @action(detail=True, methods=['post'], url_path='add-stock')
    @transaction.atomic
    def add_stock(self, request, pk=None):
        item = self.get_object()
        department = request.data.get('department', 'MAIN')
        quantity = Decimal(str(request.data.get('quantity', 0)))
        
        # Get or create stock record for this department
        stock, created = InventoryStock.objects.get_or_create(
            item=item, 
            department=department,
            defaults={'quantity': 0}
        )
        
        # Add the new quantity to existing
        stock.quantity = Decimal(str(stock.quantity)) + quantity
        stock.save()
        
        return Response({
            'status': 'success', 
            'new_quantity': float(stock.quantity),
            'department': department,
            'item_name': item.name
        })

    @action(detail=True, methods=['post'], url_path='stock-out')
    @transaction.atomic
    def stock_out(self, request, pk=None):
        item = self.get_object()
        # Check if user is admin
        if not request.user.is_authenticated or request.user.role != 'ADMIN':
            return Response({'error': 'Only Admins can perform stock-out.'}, status=status.HTTP_403_FORBIDDEN)
            
        department = request.data.get('department', 'MAIN')
        quantity = Decimal(str(request.data.get('quantity', 0)))
        reason = request.data.get('reason')
        
        if not reason:
            return Response({'error': 'Reason is required for stock-out (e.g. Expired, Damaged).'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock = InventoryStock.objects.get(item=item, department=department)
            if stock.quantity < quantity:
                return Response({'error': f'Insufficient stock in {department}. Available: {stock.quantity}'}, status=status.HTTP_400_BAD_REQUEST)
                
            stock.quantity = Decimal(str(stock.quantity)) - quantity
            stock.save()
            
            # Log this somewhere if needed, but for now just update stock
            print(f"ADMIN STOCK-OUT: {quantity} {item.name} from {department}. Reason: {reason}")
            
            return Response({
                'status': 'success',
                'item': item.name,
                'department': department,
                'removed': float(quantity),
                'new_quantity': float(stock.quantity)
            })
        except InventoryStock.DoesNotExist:
            return Response({'error': f'No stock record found for {item.name} in {department}.'}, status=status.HTTP_404_NOT_FOUND)

class InventoryStockViewSet(viewsets.ModelViewSet):
    queryset = InventoryStock.objects.all()
    serializer_class = InventoryStockSerializer
    filterset_fields = ['item', 'department']

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all().order_by('-timestamp')
    serializer_class = StockTransferSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        item_id = request.data.get('item')
        from_dept = request.data.get('from_dept')
        to_dept = request.data.get('to_dept')
        quantity = Decimal(str(request.data.get('quantity', 0)))

        if from_dept == to_dept:
            return Response({'error': 'Source and destination departments must be different.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create stock records
        item = InventoryItem.objects.get(id=item_id)
        source_stock, _ = InventoryStock.objects.get_or_create(item=item, department=from_dept)
        dest_stock, _ = InventoryStock.objects.get_or_create(item=item, department=to_dept)

        # Ensure we have Decimal types for calculation
        source_qty = Decimal(str(source_stock.quantity))
        dest_qty = Decimal(str(dest_stock.quantity))

        # Check if enough stock in source
        if source_qty < quantity:
            return Response({'error': f'Insufficient stock in {from_dept}. Available: {source_qty}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update stock levels
        source_stock.quantity = source_qty - quantity
        dest_stock.quantity = dest_qty + quantity
        source_stock.save()
        dest_stock.save()

        # Create transfer record
        transfer = StockTransfer.objects.create(
            item=item,
            from_dept=from_dept,
            to_dept=to_dept,
            quantity=quantity,
            performed_by=request.data.get('performed_by', 'Staff')
        )

        return Response(StockTransferSerializer(transfer).data, status=status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Check if user is authenticated and is admin
        if not request.user.is_authenticated or request.user.role != 'ADMIN':
            return Response({'error': 'Only Admins can delete orders.'}, status=status.HTTP_403_FORBIDDEN)
        
        # If served, maybe we shouldn't delete but Admin has full power here as requested
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def active(self, request):
        queryset = self.get_queryset().exclude(status__in=['SERVED', 'RETURNED', 'CANCELLED'])
        room = request.query_params.get('room')
        if room:
            queryset = queryset.filter(room=room)
        serializer = self.get_serializer(queryset, many=True)
        print(f"DEBUG: Active Orders JSON: {serializer.data}")
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='update-status')
    @transaction.atomic
    def update_status(self, request, pk=None):
        order = self.get_object()
        old_status = order.status
        new_status = request.data.get('status')
        
        if new_status in ['PENDING', 'PREPARING', 'READY', 'SERVED']:
            order.status = new_status
            order.save()
            
            # Automatically deduct stock when served
            if old_status != 'SERVED' and new_status == 'SERVED':
                for item in order.items.all():
                    menu_item = item.menu_item
                    if menu_item.inventory_item:
                        # Map order location & station to inventory department
                        if menu_item.preparation_station == 'KITCHEN':
                            dept = 'KITCHEN'
                        elif menu_item.preparation_station == 'BAR':
                            if order.location_type == 'POOL':
                                dept = 'POOL'
                            elif order.location_type == 'BEACH':
                                dept = 'BEACH_BAR'
                            else:
                                dept = 'BAR'
                        else:
                            dept = 'MAIN'
                            
                        # Deduct from relevant stock
                        stock, _ = InventoryStock.objects.get_or_create(
                            item=menu_item.inventory_item,
                            department=dept
                        )
                        current_qty = Decimal(str(stock.quantity))
                        stock.quantity = current_qty - Decimal(str(item.quantity))
                        stock.save()
                        print(f"DEBUG: Deducting {item.quantity} {menu_item.inventory_item.name} from {dept}")

            return Response({'status': 'success', 'new_status': order.status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='request-return')
    def request_return(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get('reason')
        items_data = request.data.get('items', []) # List of {order_item_id, quantity}
        
        if not reason:
            return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            ret = OrderReturn.objects.create(
                order=order,
                reason=reason,
                status='REQUESTED'
            )
            
            for item in items_data:
                OrderReturnItem.objects.create(
                    order_return=ret,
                    order_item_id=item['order_item_id'],
                    quantity=item['quantity']
                )
                
        return Response({'status': 'Return requested', 'return_id': ret.id})

    @action(detail=False, methods=['get'], url_path='bill-summary')
    def bill_summary(self, request):
        """
        Returns a summary of active bills grouped by table/room.
        Includes count of active orders and total unpaid amount.
        """
        from django.db.models.functions import Upper
        from django.db.models import F
        
        # We consider 'PENDING', 'PREPARING', 'READY', 'SERVED' as active
        # 'RETURNED' is excluded.
        active_orders = Order.objects.exclude(status='RETURNED')
        
        summary = active_orders.annotate(
            room_normalized=Upper('room')
        ).values('room_normalized', 'location_type').annotate(
            total_bill=Sum('total_amount'),
            order_count=Count('id')
        ).order_by('room_normalized')

        # Map to 'room' key for frontend compatibility
        formatted_summary = [
            {
                'room': item['room_normalized'],
                'location_type': item['location_type'],
                'total_bill': item['total_bill'],
                'order_count': item['order_count']
            } for item in summary
        ]
        
        return Response(formatted_summary)

class OrderReturnViewSet(viewsets.ModelViewSet):
    queryset = OrderReturn.objects.all().order_by('-requested_at')
    serializer_class = OrderReturnSerializer

    @action(detail=True, methods=['post'])
    def approve_station(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'APPROVED_STATION'
        ret.save()
        return Response({'status': 'Station approved'})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def approve_admin(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'APPROVED_ADMIN'
        ret.approved_at = timezone.now()
        ret.approved_by = request.user.username if request.user.is_authenticated else "Admin"
        ret.approver_name = request.data.get('approver_name', '')
        ret.approver_department = request.data.get('approver_department', '')
        ret.save()
        
        order = ret.order
        from finance.models import Invoice, InvoiceItem
        
        # Find associated invoice
        invoice = Invoice.objects.filter(items__related_order=order).distinct().first()
        
        if invoice:
            for return_item in ret.return_items.all():
                # Update OrderItem (The source)
                oi = return_item.order_item
                if oi.quantity > return_item.quantity:
                    oi.quantity -= return_item.quantity
                    oi.save()
                else:
                    # If whole quantity returned, we could delete it, but better to set to 0 
                    # for history, or just delete if that's the system pattern.
                    # Current pattern seems to be deletion or decrement.
                    oi.delete()

                # Update InvoiceItem (The billing)
                inv_items = invoice.items.filter(related_order=order, description__contains=return_item.order_item.menu_item.name)
                for inv_item in inv_items:
                    if inv_item.quantity > return_item.quantity:
                        inv_item.quantity -= return_item.quantity
                        inv_item.total_line = inv_item.quantity * inv_item.unit_price
                        inv_item.save()
                    else:
                        inv_item.delete()
            
            # Recalculate Order Total
            order.total_amount = sum(item.quantity * item.price_at_time for item in order.items.all())
            order.save()

            # Recalculate invoice totals
            new_total = sum(item.total_line for item in invoice.items.all())
            invoice.total_ht = new_total
            invoice.total_ft = new_total
            invoice.balance_ptd = new_total
            invoice.save()

        # Update order status if all items returned
        remaining_items_count = order.items.count()
        remaining_qty = sum(i.quantity for i in order.items.all())
        
        if remaining_items_count == 0 or remaining_qty == 0:
            order.status = 'RETURNED'
            order.save()
        
        return Response({'status': 'Final approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'REJECTED'
        ret.save()
        return Response({'status': 'Rejected'})

    @action(detail=False, methods=['get'])
    def history(self, request):
        days = request.query_params.get('days', None)
        queryset = self.get_queryset().exclude(status='REQUESTED').exclude(status='APPROVED_STATION')
        
        if days:
            from django.utils import timezone
            from datetime import timedelta
            start_date = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(requested_at__gte=start_date)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class MenuCategoryViewSet(viewsets.ModelViewSet):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['category']

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        return queryset

class RestaurantTableViewSet(viewsets.ModelViewSet):
    queryset = RestaurantTable.objects.all()
    serializer_class = RestaurantTableSerializer
    permission_classes = [permissions.AllowAny]
