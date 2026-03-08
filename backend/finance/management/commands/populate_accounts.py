from django.core.management.base import BaseCommand
from finance.models import Account

class Command(BaseCommand):
    help = 'Initialize Chart of Accounts with standard categories'

    def handle(self, *args, **kwargs):
        accounts = [
            # Assets
            {'code': '1000', 'name': 'Cash on Hand', 'account_type': 'ASSET'},
            {'code': '1100', 'name': 'Bank Account', 'account_type': 'ASSET'},
            {'code': '1200', 'name': 'Accounts Receivable', 'account_type': 'ASSET'},
            {'code': '1500', 'name': 'Fixed Assets', 'account_type': 'ASSET'},
            
            # Liabilities
            {'code': '2000', 'name': 'Accounts Payable', 'account_type': 'LIABILITY'},
            {'code': '2100', 'name': 'Taxes Payable', 'account_type': 'LIABILITY'},
            
            # Equity
            {'code': '3000', 'name': 'Owners Equity', 'account_type': 'EQUITY'},
            
            # Revenue
            {'code': '4000', 'name': 'Room Revenue', 'account_type': 'REVENUE'},
            {'code': '4100', 'name': 'Food & Beverage Revenue', 'account_type': 'REVENUE'},
            {'code': '4200', 'name': 'Other Income Revenue', 'account_type': 'REVENUE'},
            
            # Expenses
            {'code': '5000', 'name': 'Staff Salaries', 'account_type': 'EXPENSE'},
            {'code': '5100', 'name': 'Supplies Expense', 'account_type': 'EXPENSE'},
            {'code': '5200', 'name': 'Utilities Expense', 'account_type': 'EXPENSE'},
            {'code': '5300', 'name': 'Marketing Expense', 'account_type': 'EXPENSE'},
            {'code': '5900', 'name': 'Miscellaneous Expense', 'account_type': 'EXPENSE'},
        ]

        for acc_data in accounts:
            account, created = Account.objects.get_or_create(
                code=acc_data['code'],
                defaults={'name': acc_data['name'], 'account_type': acc_data['account_type']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created account: {account.name}'))
            else:
                self.stdout.write(f'Account already exists: {account.name}')
