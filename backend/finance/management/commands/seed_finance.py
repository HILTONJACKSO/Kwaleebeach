from django.core.management.base import BaseCommand
from finance.models import Account

class Command(BaseCommand):
    help = 'Seed default Chart of Accounts'

    def handle(self, *args, **options):
        accounts = [
            # Assets
            {'code': '1000', 'name': 'Cash on Hand', 'account_type': 'ASSET'},
            {'code': '1100', 'name': 'Accounts Receivable', 'account_type': 'ASSET'},
            {'code': '1200', 'name': 'Inventory (Food)', 'account_type': 'ASSET'},
            {'code': '1210', 'name': 'Inventory (Beverage)', 'account_type': 'ASSET'},
            
            # Liabilities
            {'code': '2000', 'name': 'Accounts Payable', 'account_type': 'LIABILITY'},
            {'code': '2100', 'name': 'Sales Tax Payable', 'account_type': 'LIABILITY'},
            
            # Revenue
            {'code': '4000', 'name': 'Room Revenue', 'account_type': 'REVENUE'},
            {'code': '4100', 'name': 'Dining Revenue', 'account_type': 'REVENUE'},
            {'code': '4200', 'name': 'Bar Revenue', 'account_type': 'REVENUE'},
            {'code': '4300', 'name': 'Recreation Revenue', 'account_type': 'REVENUE'},
            {'code': '4400', 'name': 'Other Revenue', 'account_type': 'REVENUE'},
            
            # Expenses
            {'code': '5000', 'name': 'Cost of Goods Sold (Food)', 'account_type': 'EXPENSE'},
            {'code': '5010', 'name': 'Cost of Goods Sold (Bev)', 'account_type': 'EXPENSE'},
            {'code': '5100', 'name': 'Salary & Wages', 'account_type': 'EXPENSE'},
            {'code': '5200', 'name': 'Utility Expense', 'account_type': 'EXPENSE'},
            {'code': '5300', 'name': 'Maintenance Expense', 'account_type': 'EXPENSE'},
        ]

        for acc_data in accounts:
            account, created = Account.objects.get_or_create(
                code=acc_data['code'],
                defaults={'name': acc_data['name'], 'account_type': acc_data['account_type']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created account: {account.name}"))
            else:
                self.stdout.write(f"Account already exists: {account.name}")
