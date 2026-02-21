import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()
from inventory.models import MenuItem

# New URL (Dark beverage/Energy drink style)
new_url = "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80"

items = MenuItem.objects.filter(name__icontains="Malta")
for item in items:
    item.image_url = new_url
    item.save()
    print(f"Updated Malta image to: {new_url}")
