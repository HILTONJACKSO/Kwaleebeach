import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from finance.models import Account

def seed_accounts():
    accounts = [
        {'code': '1000', 'name': 'Cash on Hand', 'account_type': 'ASSET'},
        {'code': '1100', 'name': 'Accounts Receivable', 'account_type': 'ASSET'},
        {'code': '2000', 'name': 'Accounts Payable', 'account_type': 'LIABILITY'},
        {'code': '3000', 'name': 'Retained Earnings', 'account_type': 'EQUITY'},
        {'code': '4000', 'name': 'Sales Revenue', 'account_type': 'REVENUE'},
        {'code': '5000', 'name': 'Staff Salary Expense', 'account_type': 'EXPENSE'},
        {'code': '5100', 'name': 'Utility Expense', 'account_type': 'EXPENSE'},
        {'code': '5200', 'name': 'Supplies Expense', 'account_type': 'EXPENSE'},
    ]

    for acc_data in accounts:
        acc, created = Account.objects.get_or_create(code=acc_data['code'], defaults=acc_data)
        if created:
            print(f"Created account: {acc.name}")
        else:
            print(f"Account already exists: {acc.name}")

if __name__ == "__main__":
    seed_accounts()
