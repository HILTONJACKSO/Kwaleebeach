from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Invoice, Payment, Account, Transaction, Voucher, EmployeeSalary
from .serializers import (
    InvoiceSerializer, PaymentSerializer, AccountSerializer, 
    TransactionSerializer, VoucherSerializer, EmployeeSalarySerializer
)

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all().order_by('code')
    serializer_class = AccountSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all().order_by('-date')
    serializer_class = TransactionSerializer

class VoucherViewSet(viewsets.ModelViewSet):
    queryset = Voucher.objects.all().order_by('-date')
    serializer_class = VoucherSerializer

class EmployeeSalaryViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSalary.objects.all().order_by('-year', '-month')
    serializer_class = EmployeeSalarySerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by('-date_issued')
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'], url_path='pay')
    def process_payment(self, request, pk=None):
        invoice = self.get_object()
        # Expect 'mode' or 'payment_method' from frontend
        mode = request.data.get('mode') or request.data.get('payment_method')
        # Default to full amount if not provided
        amount = request.data.get('amount', invoice.total_ft)
        ref = request.data.get('transaction_ref', '')

        if not mode:
            return Response({'error': 'Payment mode is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Create Payment
        Payment.objects.create(
            invoice=invoice,
            amount=amount,
            mode=mode,
            transaction_ref=ref
        )

        # check if fully paid
        total_paid = sum(p.amount for p in invoice.payments.all())
        if total_paid >= invoice.total_ft:
            invoice.is_paid = True
            invoice.save()

        return Response({'status': 'Payment processed', 'is_paid': invoice.is_paid})

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-date_paid')
    serializer_class = PaymentSerializer
