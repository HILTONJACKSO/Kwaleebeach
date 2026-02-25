from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from .models import MenuCategory, MenuItem, Order, InventoryItem, InventoryStock, StockTransfer, Department, OrderReturn, RestaurantTable
from .serializers import (
    MenuCategorySerializer, MenuItemSerializer, OrderSerializer,
    InventoryItemSerializer, InventoryStockSerializer, StockTransferSerializer, OrderReturnSerializer,
    RestaurantTableSerializer
)
from django.db import transaction

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('name')
    serializer_class = InventoryItemSerializer

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
        quantity = float(request.data.get('quantity', 0))

        if from_dept == to_dept:
            return Response({'error': 'Source and destination departments must be different.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create stock records
        item = InventoryItem.objects.get(id=item_id)
        source_stock, _ = InventoryStock.objects.get_or_create(item=item, department=from_dept)
        dest_stock, _ = InventoryStock.objects.get_or_create(item=item, department=to_dept)

        # Check if enough stock in source
        if source_stock.quantity < quantity:
            return Response({'error': f'Insufficient stock in {from_dept}. Available: {source_stock.quantity}'}, status=status.HTTP_400_BAD_REQUEST)

        # Update stock levels
        source_stock.quantity -= quantity
        dest_stock.quantity += quantity
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

    @action(detail=False, methods=['get'])
    def active(self, request):
        queryset = self.get_queryset().exclude(status='SERVED')
        room = request.query_params.get('room')
        if room:
            queryset = queryset.filter(room=room)
        serializer = self.get_serializer(queryset, many=True)
        print(f"DEBUG: Active Orders JSON: {serializer.data}")
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['PENDING', 'PREPARING', 'READY', 'SERVED']:
            order.status = new_status
            order.save()
            return Response({'status': 'success', 'new_status': order.status})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='request-return')
    def request_return(self, request, pk=None):
        order = self.get_object()
        reason = request.data.get('reason')
        if not reason:
            return Response({'error': 'Reason is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        OrderReturn.objects.create(
            order=order,
            reason=reason,
            status='REQUESTED'
        )
        return Response({'status': 'Return requested'})

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
    def approve_admin(self, request, pk=None):
        ret = self.get_object()
        ret.status = 'APPROVED_ADMIN'
        ret.save()
        
        # Mark order as returned if final approved
        ret.order.status = 'RETURNED'
        ret.order.save()
        
        return Response({'status': 'Final approved'})

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
