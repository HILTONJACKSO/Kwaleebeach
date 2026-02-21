import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from core.models import User

def seed_users():
    users = [
        {
            'username': 'admin',
            'email': 'admin@yarvo.com',
            'password': 'Password@pos1',
            'role': 'ADMIN',
            'first_name': 'System',
            'last_name': 'Administrator'
        },
        {
            'username': 'frontdesk',
            'email': 'frontdesk@yarvo.com',
            'password': 'Password@pos1',
            'role': 'FRONT_DESK',
            'first_name': 'Front',
            'last_name': 'Desk'
        },
        {
            'username': 'waiter',
            'email': 'waiter@yarvo.com',
            'password': 'Password@pos1',
            'role': 'WAITER',
            'first_name': 'John',
            'last_name': 'Waiter'
        },
        {
            'username': 'kitchen',
            'email': 'kitchen@yarvo.com',
            'password': 'Password@pos1',
            'role': 'KITCHEN',
            'first_name': 'Head',
            'last_name': 'Chef'
        },
        {
            'username': 'bar',
            'email': 'bar@yarvo.com',
            'password': 'Password@pos1',
            'role': 'BAR',
            'first_name': 'Mixologist',
            'last_name': 'Pro'
        },
        {
            'username': 'cashier',
            'email': 'cashier@yarvo.com',
            'password': 'Password@pos1',
            'role': 'CASHIER',
            'first_name': 'Account',
            'last_name': 'Receivable'
        },
        {
            'username': 'recreation',
            'email': 'recreation@yarvo.com',
            'password': 'Password@pos1',
            'role': 'RECREATION',
            'first_name': 'Pool',
            'last_name': 'Manager'
        },
    ]

    for user_data in users:
        password = user_data.pop('password')
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password(password)
            user.save()
            print(f"Created user: {user.username} ({user.role})")
        else:
            print(f"User {user.username} already exists.")

    # Special case: ensure admin is superuser
    admin = User.objects.get(username='admin')
    if not admin.is_superuser:
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()
        print("Updated admin to superuser.")

if __name__ == "__main__":
    seed_users()
