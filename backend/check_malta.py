import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()
from inventory.models import MenuItem

items = MenuItem.objects.filter(name__icontains="Malta")
for item in items:
    print(f"Name: {item.name}, URL: {item.image_url}")
