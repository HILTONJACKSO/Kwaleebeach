import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from core.models import User

users = User.objects.all()
print(f"{'Username':<15} | {'Role':<15} | {'Is Authenticated':<15} | {'Is Staff':<10} | {'Is Superuser':<12}")
print("-" * 75)
for u in users:
    print(f"{u.username:<15} | {u.role:<15} | {'N/A':<16} | {str(u.is_staff):<10} | {str(u.is_superuser):<12}")
