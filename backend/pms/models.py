from django.db import models

class Room(models.Model):
    CATEGORY_CHOICES = [
        ('ROOM', 'Standard Room'),
        ('TENT', 'Luxury Tent'),
        ('VILLA', 'Private Villa'),
        ('COTTAGE', 'Cottage'),
    ]

    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('DIRTY', 'Dirty'),
        ('MAINTENANCE', 'Maintenance'),
    ]

    room_number = models.CharField(max_length=10, unique=True)
    room_type = models.CharField(max_length=50) # e.g. 'Hornbill', 'Eagle'
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='ROOM')
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    capacity_adults = models.IntegerField(default=2)
    capacity_children = models.IntegerField(default=0)
    amenities = models.TextField(blank=True, null=True, help_text="Comma separated amenities")
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='rooms/', blank=True, null=True)

    def __str__(self):
        return f"{self.room_number} - {self.room_type} ({self.status})"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    guest_name = models.CharField(max_length=100)
    guest_email = models.EmailField(blank=True, null=True)
    guest_phone = models.CharField(max_length=20, blank=True, null=True)
    check_in = models.DateField()
    check_out = models.DateField()
    adults = models.IntegerField(default=2)
    children = models.IntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_requests = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    is_checked_in = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.guest_name} ({self.room.room_number})"
