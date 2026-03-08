import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yarvo_backend.settings')
django.setup()

from finance.models import Account, Transaction

def recalculate():
    print("Starting ledger re-calculation...")
    
    # 1. Reset all balances to 0
    Account.objects.all().update(balance=0)
    print("Reset all account balances to 0.")

    # 2. Re-apply transactions in chronological order
    txs = Transaction.objects.all().order_by('id')
    for tx in txs:
        # Debit Account
        if tx.debit_account.account_type in ['ASSET', 'EXPENSE']:
            tx.debit_account.balance += tx.amount
        else: # REVENUE, LIABILITY, EQUITY
            tx.debit_account.balance -= tx.amount
        tx.debit_account.save()
        
        # Credit Account
        if tx.credit_account.account_type in ['REVENUE', 'LIABILITY', 'EQUITY']:
            tx.credit_account.balance += tx.amount
        else: # ASSET, EXPENSE
            tx.credit_account.balance -= tx.amount
        tx.credit_account.save()
        
        print(f"Processed TX: {tx.description} - Amount: {tx.amount}")

    print("Ledger re-calculation complete.")

if __name__ == "__main__":
    recalculate()
