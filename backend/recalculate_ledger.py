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
        # Literal logic: Debit adds (+), Credit deducts (-)
        tx.debit_account.balance += tx.amount
        tx.debit_account.save()
        
        tx.credit_account.balance -= tx.amount
        tx.credit_account.save()
        
        print(f"Processed TX: {tx.description} - Amount: {tx.amount}")

    print("Ledger re-calculation complete.")

if __name__ == "__main__":
    recalculate()
