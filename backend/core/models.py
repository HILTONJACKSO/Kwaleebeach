from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('FRONT_DESK', 'Front Desk'),
        ('WAITER', 'Waiter'),
        ('KITCHEN', 'Kitchen'),
        ('BAR', 'Bar'),
        ('CASHIER', 'Cashier'),
        ('RECREATION', 'Recreation'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='WAITER')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
