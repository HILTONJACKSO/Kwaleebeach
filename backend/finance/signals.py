from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Invoice, Payment, Account, Transaction
from decimal import Decimal

@receiver(post_save, sender=Invoice)
def create_invoice_ledger_entry(sender, instance, created, **kwargs):
    if created:
        try:
            # Determine Revenue Account based on description or location
            # Default to Sales Revenue (4000)
            revenue_account = Account.objects.get(code='4000')
            ar_account = Account.objects.get(code='1100')
            
            # Check if it's Dining or Bar revenue based on first item description
            first_item = instance.items.first()
            if first_item:
                if 'Order' in first_item.description:
                    # Could refine this if we had station info on InvoiceItem
                    # For now, let's use a general Dining Revenue (4100) if it exists
                    try:
                        revenue_account = Account.objects.get(code='4100')
                    except Account.DoesNotExist:
                        pass
                elif 'Pass' in first_item.description or 'Pool' in first_item.description or 'Beach' in first_item.description:
                    try:
                        revenue_account = Account.objects.get(code='4300')
                    except Account.DoesNotExist:
                        pass

            Transaction.objects.create(
                description=f"Revenue Recognition: {instance.invoice_number} ({instance.reference_location or 'General'})",
                debit_account=ar_account,
                credit_account=revenue_account,
                amount=instance.total_ft
            )
        except Account.DoesNotExist as e:
            print(f"Error creating ledger entry: {e}")
        except Exception as e:
            print(f"Unexpected error in invoice signal: {e}")

@receiver(post_save, sender=Payment)
def create_payment_ledger_entry(sender, instance, created, **kwargs):
    if created:
        try:
            cash_account = Account.objects.get(code='1000')
            ar_account = Account.objects.get(code='1100')
            
            Transaction.objects.create(
                description=f"Payment Received: {instance.invoice.invoice_number} via {instance.mode}",
                debit_account=cash_account,
                credit_account=ar_account,
                amount=instance.amount
            )
        except Account.DoesNotExist as e:
            print(f"Error creating payment ledger entry: {e}")
        except Exception as e:
            print(f"Unexpected error in payment signal: {e}")
