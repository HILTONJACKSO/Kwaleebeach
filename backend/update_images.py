import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import MenuItem

updates = {
    "Chicken Dinner": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    "Coke": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    "Malta": "https://images.unsplash.com/photo-1625740822008-e45a337feceb?auto=format&fit=crop&w=800&q=80" # Dark beer/drink as proxy
}

for name, url in updates.items():
    try:
        items = MenuItem.objects.filter(name__icontains=name)
        for item in items:
            item.image_url = url
            item.save()
            print(f"Updated image for: {item.name}")
    except Exception as e:
        print(f"Error updating {name}: {e}")

print("Update complete.")
