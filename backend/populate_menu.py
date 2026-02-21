import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from inventory.models import MenuCategory, MenuItem

def populate():
    # Categories
    starters, _ = MenuCategory.objects.get_or_create(name='Starters', slug='starters')
    mains, _ = MenuCategory.objects.get_or_create(name='Mains', slug='mains')
    drinks, _ = MenuCategory.objects.get_or_create(name='Drinks', slug='drinks')

    # Items
    MenuItem.objects.get_or_create(
        category=mains,
        name='Chicken Dinner',
        defaults={'description': 'Delicious chicken with spices', 'price': 15.00}
    )
    MenuItem.objects.get_or_create(
        category=drinks,
        name='Coke',
        defaults={'description': 'Chilled Coca Cola', 'price': 2.50}
    )
    MenuItem.objects.get_or_create(
        category=drinks,
        name='Malta',
        defaults={'description': 'Malt beverage', 'price': 3.00}
    )

    print("Menu populated!")

if __name__ == '__main__':
    populate()
