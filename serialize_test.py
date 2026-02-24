import os, django, sys, json
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import Order
from inventory.serializers import OrderSerializer

print("--- SERIALIZING ACTIVE ORDERS ---")
orders = Order.objects.exclude(status='SERVED')
if not orders.exists():
    print("No active orders found in DB.")
else:
    data = OrderSerializer(orders, many=True).data
    print(json.dumps(data, indent=2))

print("\n--- SERIALIZING ALL ORDERS ---")
all_orders = Order.objects.all()
data = OrderSerializer(all_orders, many=True).data
print(json.dumps(data, indent=2))
