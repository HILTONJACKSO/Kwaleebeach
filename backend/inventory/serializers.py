from rest_framework import serializers
from .models import MenuCategory, MenuItem, Order, OrderItem, InventoryItem, InventoryStock, StockTransfer, OrderReturn
from finance.models import Invoice, InvoiceItem
from pms.models import Booking
import uuid
from decimal import Decimal


class InventoryStockSerializer(serializers.ModelSerializer):
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    class Meta:
        model = InventoryStock
        fields = ['id', 'item', 'department', 'department_display', 'quantity']

class InventoryItemSerializer(serializers.ModelSerializer):
    stocks = InventoryStockSerializer(many=True, read_only=True)
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'sku', 'unit', 'cost_price', 'selling_price', 'stocks', 'total_stock']

    def get_total_stock(self, obj):
        return sum(s.quantity for s in obj.stocks.all())

class StockTransferSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    from_dept_display = serializers.CharField(source='get_from_dept_display', read_only=True)
    to_dept_display = serializers.CharField(source='get_to_dept_display', read_only=True)

    class Meta:
        model = StockTransfer
        fields = ['id', 'item', 'item_name', 'from_dept', 'from_dept_display', 'to_dept', 'to_dept_display', 'quantity', 'timestamp', 'performed_by']

class MenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'slug']

class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = ['id', 'category', 'category_name', 'name', 'description', 'price', 'image', 'is_available']

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    preparation_station = serializers.CharField(source='menu_item.preparation_station', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'preparation_station', 'quantity', 'price_at_time']
        read_only_fields = ['price_at_time']

class OrderReturnSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderReturn
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    returns = OrderReturnSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'room', 'location_type', 'status', 'total_amount', 'created_at', 'items', 'returns']
        read_only_fields = ['status', 'total_amount', 'created_at']

    def create(self, validated_data):
        try:
            items_data = validated_data.pop('items')
            order = Order.objects.create(**validated_data)
            print(f"DEBUG: Created Order #{order.id} for room {order.room}")
            
            total = Decimal('0.00')
            for item_data in items_data:
                menu_item = item_data['menu_item']
                quantity = int(item_data['quantity'])
                price = Decimal(str(menu_item.price))
                
                OrderItem.objects.create(
                    order=order, 
                    menu_item=menu_item, 
                    quantity=quantity, 
                    price_at_time=price
                )
                total += price * quantity
                print(f"DEBUG: Added {quantity}x {menu_item.name} to Order #{order.id}")
            
            order.total_amount = total
            order.save()
            print(f"DEBUG: Order #{order.id} total updated to {total}")

            # Create Invoice in Finance App (Non-Critical)
            try:
                active_booking = Booking.objects.filter(room__room_number=order.room, is_checked_in=True).last()
                
                invoice = Invoice.objects.create(
                    booking=active_booking,
                    invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}",
                    total_ht=total,
                    total_ft=total,
                    balance_ptd=total,
                    is_paid=False
                )
                
                for item in order.items.all():
                    InvoiceItem.objects.create(
                        invoice=invoice,
                        description=f"{item.menu_item.name} (Order #{order.id})",
                        quantity=item.quantity,
                        unit_price=item.price_at_time,
                        total_line=item.quantity * item.price_at_time
                    )
                print(f"DEBUG: Invoice created for Order #{order.id}")
            except Exception as inv_e:
                print(f"DEBUG: Non-critical invoice creation failed for Order #{order.id}: {inv_e}")

            return order

        except Exception as e:
            print(f"DEBUG: Critical failure in OrderSerializer.create: {e}")
            raise serializers.ValidationError(f"Internal Order Error: {e}")
