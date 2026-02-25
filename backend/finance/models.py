from django.db import models
from pms.models import Booking

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
    VOUCHER_TYPES = [
        ('CASH_PAYMENT', 'Cash Payment'),
        ('CASH_RECEIPT', 'Cash Receipt'),
        ('JOURNAL', 'Journal Voucher'),
    ]
    voucher_number = models.CharField(max_length=50, unique=True)
    date = models.DateField(auto_now_add=True)
    voucher_type = models.CharField(max_length=20, choices=VOUCHER_TYPES)
    payee = models.CharField(max_length=255)
    description = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Voucher {self.voucher_number}"

class Invoice(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    reference_location = models.CharField(max_length=100, blank=True, null=True, help_text="Direct room/table reference if no booking (e.g. Table T5)")
    invoice_number = models.CharField(max_length=50, unique=True)
    date_issued = models.DateField(auto_now_add=True)
    
    # Financials
    total_ht = models.DecimalField(max_digits=12, decimal_places=2, help_text="Total Hors Taxe (Excl Tax)")
    total_ft = models.DecimalField(max_digits=12, decimal_places=2, help_text="Total Final Tax (Incl Tax)")
    balance_ptd = models.DecimalField(max_digits=12, decimal_places=2, help_text="Balance Period To Date")
    
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice {self.invoice_number}"

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
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
        ('MOMO', 'Mobile Money'),
        ('VISA', 'Visa'),
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
