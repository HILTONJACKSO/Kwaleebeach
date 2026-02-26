from django.db import models

class MenuCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class RestaurantTable(models.Model):
    number = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.number}"

class MenuItem(models.Model):
    STATION_CHOICES = [
        ('KITCHEN', 'Kitchen'),
        ('BAR', 'Bar'),
    ]
    
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    preparation_station = models.CharField(max_length=20, choices=STATION_CHOICES, default='KITCHEN')
    inventory_item = models.ForeignKey('InventoryItem', on_delete=models.SET_NULL, blank=True, null=True, related_name='menu_items')
    
    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, unique=True)
    unit = models.CharField(max_length=20) # e.g. bottle, kg
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return self.name

class Department(models.TextChoices):
    MAIN = 'MAIN', 'Main Stock'
    POOL = 'POOL', 'Pool'
    BAR = 'BAR', 'Bar'
    BEACH_BAR = 'BEACH_BAR', 'Beach Bar'
    KITCHEN = 'KITCHEN', 'Kitchen'
    LAUNDRY = 'LAUNDRY', 'Laundry'
    OFFICE = 'OFFICE', 'Office'

class InventoryStock(models.Model):
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='stocks')
    department = models.CharField(max_length=20, choices=Department.choices, default=Department.MAIN)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ('item', 'department')

    def __str__(self):
        return f"{self.item.name} - {self.department}: {self.quantity}"

class StockTransfer(models.Model):
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    from_dept = models.CharField(max_length=20, choices=Department.choices)
    to_dept = models.CharField(max_length=20, choices=Department.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    performed_by = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Transfer {self.quantity} {self.item.name} from {self.from_dept} to {self.to_dept}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready'),
        ('SERVED', 'Served'),
        ('RETURNED', 'Returned'),
    ]
    
    LOCATION_TYPE_CHOICES = [
        ('ROOM', 'Room'),
        ('TABLE', 'Table'),
        ('BEACH', 'Beach Side'),
        ('POOL', 'Pool Side'),
        ('WALK_IN', 'Walk-in'),
    ]
    
    room = models.CharField(max_length=50, blank=True, null=True, help_text="Number/ID (Room #, Table #, etc.)")
    location_type = models.CharField(max_length=20, choices=LOCATION_TYPE_CHOICES, default='ROOM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.room} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.price_at_time:
            self.price_at_time = self.menu_item.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"

class OrderReturn(models.Model):
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('APPROVED_STATION', 'Station Approved'), # approved by kitchen/bar
        ('APPROVED_ADMIN', 'Final Approved'), # approved by admin/manager
        ('REJECTED', 'Rejected'),
    ]
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Return for Order #{self.order.id} ({self.status})"
