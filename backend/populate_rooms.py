import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from pms.models import Room

def populate_rooms():
    rooms = [
        ('101', 'Hornbill', '150.00'),
        ('102', 'Hornbill', '150.00'),
        ('201', 'Eagle', '250.00'),
        ('202', 'Eagle', '250.00'),
        ('301', 'Turaco', '120.00'),
    ]
    
    for num, rtype, price in rooms:
        Room.objects.get_or_create(
            room_number=num,
            defaults={
                'room_type': rtype,
                'price_per_night': price,
                'status': 'AVAILABLE'
            }
        )
    print("Rooms populated!")

if __name__ == '__main__':
    populate_rooms()
