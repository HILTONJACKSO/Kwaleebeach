import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from core.models import User

def create_admin():
    username = 'yarvo_admin'
    password = 'YarvoAdminPassword2026!'
    email = 'admin@yarvo.com'
    
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_superuser(
            username=username,
            password=password,
            email=email,
            first_name='System',
            last_name='Admin',
            role='ADMIN'
        )
        print(f"Successfully created admin user: {username}")
    else:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.role = 'ADMIN'
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Updated existing user to admin: {username}")

    print(f"Username: {username}")
    print(f"Password: {password}")

if __name__ == '__main__':
    create_admin()
