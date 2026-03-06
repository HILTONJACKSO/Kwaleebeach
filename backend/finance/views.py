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

    def get_permissions(self):
        if self.action in ['destroy', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Only Admin can delete
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only Admins can delete invoices.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Only allow deleting unpaid invoices to prevent financial gaps
        if instance.is_paid:
            return Response({'error': 'Cannot delete a paid invoice.'}, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role != 'ADMIN' and instance.is_paid:
            return Response({'error': 'Only Admins can edit paid invoices.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

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

        if not invoice.is_service_ready:
            return Response(
                {'error': 'Cannot process payment: Some food/drink items in this invoice have not been served yet.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

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
