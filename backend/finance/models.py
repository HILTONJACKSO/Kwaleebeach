from django.db import models
from pms.models import Booking
from django.apps import apps

class Account(models.Model):
    ACCOUNT_TYPES = [
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('REVENUE', 'Revenue'),
        ('EXPENSE', 'Expense'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Transaction(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255)
    debit_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='debit_transactions')
    credit_account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='credit_transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def save(self, *args, **kwargs):
        # Basic double-entry logic: update account balances
        # In a real system, we'd use signals or a more robust ledger approach
        if not self.pk:
            self.debit_account.balance += self.amount
            self.debit_account.save()
            self.credit_account.balance -= self.amount
            self.credit_account.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"TX: {self.description} (${self.amount})"

class Voucher(models.Model):
    MAIN_ACCOUNT_CHOICES = [
        ('OTHER_REVENUE', 'Other Income Revenue'),
        ('PURCHASES', 'Purchases'),
        ('EXPENSE', 'Expense'),
        ('ASSETS', 'Assets'),
        ('LIABILITY', 'Liability'),
    ]

    VOUCHER_TYPE_CHOICES = [
        # Other Revenue
        ('OTHER_REV_RECEPTION', 'Other revenue reception'),
        ('OTHER_REV_FOOD', 'Other revenue food'),
        ('OTHER_REV_DRINK', 'Other revenue drink'),
        ('OTHER_REV_ROOM', 'Other revenue room'),
        ('OTHER_REV_BOUTIQUE', 'Other revenue boutique'),
        ('OTHER_REV_PACKAGE', 'Other revenue package/event'),
        
        # Purchases
        ('PURCHASE_FOOD', 'Local purchases food'),
        ('PURCHASE_DRINKS', 'Local purchases drinks'),
        ('PURCHASE_BOUTIQUE', 'Local purchases boutique'),
        ('PURCHASE_OTHER', 'Local purchases Other'),
        
        # Expenses
        ('MARKETING', 'Marketing'),
        ('SELLING_EXPENSES', 'Selling expenses'),
        ('COMMISSION', 'Commission'),
        ('EMPLOYEE_BENEFITS', 'Employee benefits programs/nasscor'),
        ('FREIGHT', 'Freight'),
        ('INSURANCE', 'Insurance'),
        ('LAUNDRY_CLEANING', 'Laundry and cleaning service'),
        ('LEGAL_PROFESSIONAL', 'Legal and professional services'),
        ('POSTAGE', 'Postage'),
        ('REPAIRS', 'Repairs'),
        ('SUPPLIES_KITCHEN', 'Supplies kitchen'),
        ('SUPPLIES_FUEL', 'Supplies fuel generator'),
        ('SUPPLIES_OFFICE', 'Supply office'),
        ('SUPPLIES_GAS', 'Supplies gas'),
        ('SUPPLIES_STAFF_FOOD', 'Supplies staff food'),
        ('SUPPLIES_RESTAURANTS', 'Supplies restaurants'),
        ('SUPPLIES_ROOM', 'Supplies room'),
        ('SUPPLIES_OTHER', 'Supplies other'),
        ('TAX_WITHHOLDING', 'Taxes withholding Tax'),
        ('TAX_DUTY', 'Taxes duty'),
        ('TAX_OTHER', 'Taxes other'),
        ('TAX_WITHHOLDING_RENT', 'Taxes withholding on rent'),
        ('TAX_PAID_2_PERCENT', 'Taxes paid 2% tax'),
        ('TAX_WITHHELD_2_PERCENT', 'Taxes withheld 2% tax'),
        ('TAX_GST', 'Taxes GST'),
        ('TELEPHONE_INTERNET', 'Telephone / Internet'),
        ('TRAVEL_ENT', 'Travel & Entertainment'),
        ('UTILITIES', 'Utilities'),
        ('WAGES_DAILY', 'Wages - Daily hire'),
        ('WAGES_BONUS', 'Wages - bonus'),
        ('LOCAL_TRANS', 'Local transportation'),
        ('EXPENSE_MISC', 'Expenses general misc. Expense'),
        
        # Assets
        ('CONSTRUCTION', 'Construction'),
        ('RENOVATION', 'Renovation'),
        
        # Liability
        ('ACCOUNTS_PAYABLE', 'Accounts payable'),
        ('SALES_TAX_PAYABLE', 'Sales Tax Payable'),
        
        # Legacy
        ('CASH_PAYMENT', 'Cash Payment'),
        ('CASH_RECEIPT', 'Cash Receipt'),
        ('JOURNAL', 'Journal Voucher'),
    ]

    voucher_number = models.CharField(max_length=50, unique=True)
    date = models.DateField(auto_now_add=True)
    main_account = models.CharField(max_length=50, choices=MAIN_ACCOUNT_CHOICES, default='EXPENSE')
    voucher_type = models.CharField(max_length=50, choices=VOUCHER_TYPE_CHOICES)
    payee = models.CharField(max_length=255)
    description = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Voucher {self.voucher_number}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = False
        if not is_new:
            old_instance = Voucher.objects.get(pk=self.pk)
            old_status = old_instance.is_approved

        super().save(*args, **kwargs)

        # Trigger transaction creation on approval
        if self.is_approved and not old_status:
            self.create_ledger_transaction()

    def create_ledger_transaction(self):
        """
        Creates a Transaction record based on voucher type.
        """
        try:
            cash_account = Account.objects.get(code='1000') # Default Cash
            
            # Mapping logic
            debit_acc = None
            credit_acc = None
            
            if self.main_account == 'OTHER_REVENUE':
                # Debit Cash (+), Credit Revenue (+)
                debit_acc = cash_account
                credit_acc = Account.objects.get(code='4200') # Other Revenue
            elif self.main_account == 'PURCHASES':
                # Debit Purchase/Inventory (+), Credit Cash (-)
                # Mapping specific purchases could be more granular
                debit_acc = Account.objects.get(code='5100') # Supplies/Inventory Default
                credit_acc = cash_account
            elif self.main_account == 'EXPENSE':
                # Debit Expense (+), Credit Cash (-)
                debit_acc = Account.objects.get(code='5900') # Misc Expense Default
                # Try to find a more specific expense account if possible
                if 'UTILITIES' in self.voucher_type: debit_acc = Account.objects.get(code='5200')
                elif 'MARKETING' in self.voucher_type: debit_acc = Account.objects.get(code='5300')
                credit_acc = cash_account
            elif self.main_account == 'ASSETS':
                # Debit Asset (+), Credit Cash (-)
                debit_acc = Account.objects.get(code='1000') # Should be an asset account
                credit_acc = cash_account
            elif self.main_account == 'LIABILITY':
                # Debit Cash (+), Credit Liability (+)
                debit_acc = cash_account
                credit_acc = Account.objects.get(code='2000')

            if debit_acc and credit_acc:
                Transaction.objects.create(
                    description=f"Voucher {self.voucher_number} - {self.payee}",
                    debit_account=debit_acc,
                    credit_account=credit_acc,
                    amount=self.total_amount
                )
        except Account.DoesNotExist:
            import logging
            logging.error(f"Failed to create transaction for Voucher {self.voucher_number}: Default accounts missing.")

class Invoice(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    reference_location = models.CharField(max_length=100, blank=True, null=True, help_text="Direct room/table reference if no booking (e.g. Table T5)")
    invoice_number = models.CharField(max_length=50, unique=True)
    date_issued = models.DateField(auto_now_add=True)
    
    # Financials
    total_ht = models.DecimalField(max_digits=12, decimal_places=2, help_text="Total Hors Taxe (Excl Tax)")
    total_ft = models.DecimalField(max_digits=12, decimal_places=2, help_text="Total Final Tax (Incl Tax)")
    balance_ptd = models.DecimalField(max_digits=12, decimal_places=2, help_text="Balance Period To Date")
    
    # Discounts
    DISCOUNT_TYPE_CHOICES = [
        ('FIXED', 'Fixed Amount ($)'),
        ('PERCENT', 'Percentage (%)'),
    ]
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE_CHOICES, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_reason = models.TextField(blank=True, null=True)

    is_paid = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Calculate HT from items total if not set, or just ensure HT/FT consistency
        # For simplicity, if discount is applied, update total_ft
        if self.discount_amount > 0:
            if self.discount_type == 'PERCENT':
                discount_val = (self.total_ht * self.discount_amount) / 100
                self.total_ft = self.total_ht - discount_val
            elif self.discount_type == 'FIXED':
                self.total_ft = self.total_ht - self.discount_amount
        else:
            self.total_ft = self.total_ht
            
        # Balance is usually what's left to pay
        # If paid, balance_ptd should be 0, but usually it tracks total due in this context
        self.balance_ptd = self.total_ft
        
        super().save(*args, **kwargs)

    @property
    def is_service_ready(self):
        """
        Checks if all items in this invoice that are linked to Restaurant Orders 
        have been marked as SERVED.
        """
        for item in self.items.all():
            if item.related_order and item.related_order.status != 'SERVED':
                return False
        return True

    def __str__(self):
        return f"Invoice {self.invoice_number}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    related_order = models.ForeignKey('inventory.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice_items')
    description = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_line = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.total_line = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class Payment(models.Model):
    MODE_CHOICES = [
        ('CASH', 'Cash'),
        ('MOMO_LONESTAR', 'Momo Lonestar'),
        ('MOMO_ORANGE', 'Momo Orange'),
        ('VISA', 'Visa'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('OTHER', 'Other'),
    ]

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    date_paid = models.DateTimeField(auto_now_add=True)
    transaction_ref = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Payment {self.amount} ({self.mode}) for {self.invoice.invoice_number}"

from django.conf import settings

class EmployeeSalary(models.Model):
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='salaries')
    month = models.IntegerField()
    year = models.IntegerField()
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.net_pay = self.basic_salary + self.allowances - self.deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Salary {self.employee.username} - {self.month}/{self.year}"
