from django.core.management.base import BaseCommand
from finance.models import Invoice, Payment, Account, Transaction

class Command(BaseCommand):
    help = 'Backfill ledger transactions for existing invoices and payments'

    def handle(self, *args, **options):
        # Reset account balances to zero for a fresh calc
        Account.objects.all().update(balance=0)
        Transaction.objects.all().delete()
        self.stdout.write("Cleared existing transactions and reset balances.")

        # 1. Backfill Invoices (Revenue Recognition)
        invoices = Invoice.objects.all().order_by('date_issued')
        ar_account = Account.objects.get(code='1100')
        default_rev = Account.objects.get(code='4000')
        
        for inv in invoices:
            revenue_account = default_rev
            first_item = inv.items.first()
            if first_item:
                if 'Order' in first_item.description:
                    try: revenue_account = Account.objects.get(code='4100')
                    except Account.DoesNotExist: pass
                elif any(x in first_item.description for x in ['Pass', 'Pool', 'Beach']):
                    try: revenue_account = Account.objects.get(code='4300')
                    except Account.DoesNotExist: pass

            Transaction.objects.create(
                description=f"Revenue Recognition: {inv.invoice_number} ({inv.reference_location or 'General'})",
                debit_account=ar_account,
                credit_account=revenue_account,
                amount=inv.total_ft
            )
            self.stdout.write(f"Processed Invoice {inv.invoice_number}")

        # 2. Backfill Payments (Cash Collection)
        payments = Payment.objects.all().order_by('date_paid')
        cash_account = Account.objects.get(code='1000')
        
        for pay in payments:
            Transaction.objects.create(
                description=f"Payment Received: {pay.invoice.invoice_number} via {pay.mode}",
                debit_account=cash_account,
                credit_account=ar_account,
                amount=pay.amount
            )
            self.stdout.write(f"Processed Payment for {pay.invoice.invoice_number}")

        self.stdout.write(self.style.SUCCESS("Backfill completed successfully!"))
