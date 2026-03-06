from django.core.management.base import BaseCommand
from recreation.models import PassType

class Command(BaseCommand):
    help = 'Update beach and pool pass prices'

    def handle(self, *args, **options):
        # Update or Create Beach Adult
        pt_ba, _ = PassType.objects.update_or_create(
            name='Beach Access Pass (Adult)',
            location='BEACH',
            defaults={'price': 5.00}
        )
        self.stdout.write(f"Updated: {pt_ba}")

        # Update or Create Beach Kids
        pt_bk, _ = PassType.objects.update_or_create(
            name='Beach Access Pass (Kids)',
            location='BEACH',
            defaults={'price': 3.00}
        )
        self.stdout.write(f"Updated: {pt_bk}")

        # Update or Create Pool Adult
        pt_pa, _ = PassType.objects.update_or_create(
            name='Pool Day Pass (Adult)',
            location='POOL',
            defaults={'price': 5.00}
        )
        self.stdout.write(f"Updated: {pt_pa}")

        # Update or Create Pool Kids
        pt_pk, _ = PassType.objects.update_or_create(
            name='Pool Day Pass (Kids)',
            location='POOL',
            defaults={'price': 3.00}
        )
        self.stdout.write(f"Updated: {pt_pk}")
