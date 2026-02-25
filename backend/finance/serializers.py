from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment, Account, Transaction, Voucher, EmployeeSalary

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class TransactionSerializer(serializers.ModelSerializer):
    debit_account_name = serializers.CharField(source='debit_account.name', read_only=True)
    credit_account_name = serializers.CharField(source='credit_account.name', read_only=True)
    class Meta:
        model = Transaction
        fields = '__all__'

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = '__all__'

class EmployeeSalarySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    class Meta:
        model = EmployeeSalary
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    guest_name = serializers.CharField(source='booking.guest_name', read_only=True, default="Walk-in")
    room_number = serializers.CharField(source='booking.room.room_number', read_only=True, default="N/A")

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'date_issued', 'total_ht', 'total_ft', 
            'balance_ptd', 'is_paid', 'items', 'payments', 'guest_name', 'room_number',
            'reference_location'
        ]
