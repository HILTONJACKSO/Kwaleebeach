from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet, PaymentViewSet, AccountViewSet, 
    TransactionViewSet, VoucherViewSet, EmployeeSalaryViewSet
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'vouchers', VoucherViewSet)
router.register(r'salaries', EmployeeSalaryViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
