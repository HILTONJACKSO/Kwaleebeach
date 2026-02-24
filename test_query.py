import os, django, sys
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from django.utils import timezone
from inventory.models import Order, OrderItem
from django.db.models import Sum

now = timezone.now()
today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

print(f"Now: {now}")
print(f"Today Start: {today_start}")

orders = Order.objects.all()
for o in orders:
    print(f"Order #{o.id} created_at: {o.created_at}")

qs = Order.objects.filter(created_at__gte=today_start, items__menu_item__preparation_station='KITCHEN').distinct()
print(f"KITCHEN ORDERS TODAY: {qs.count()}")

rev = Order.objects.filter(created_at__gte=today_start, status='SERVED').aggregate(sum=Sum('total_amount'))['sum'] or 0.00
print(f"TOTAL REVENUE TODAY: {rev}")
