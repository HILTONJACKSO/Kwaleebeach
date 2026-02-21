from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MenuCategoryViewSet, MenuItemViewSet, 
    InventoryItemViewSet, InventoryStockViewSet, StockTransferViewSet,
    OrderViewSet, OrderReturnViewSet
)
from .reporting_views import ReportingViewSet

router = DefaultRouter()
router.register(r'items', InventoryItemViewSet, basename='inventory-item')
router.register(r'stocks', InventoryStockViewSet, basename='inventory-stock')
router.register(r'transfers', StockTransferViewSet, basename='stock-transfer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'returns', OrderReturnViewSet, basename='order-return')
router.register(r'menu/categories', MenuCategoryViewSet, basename='menu-category')
router.register(r'menu/items', MenuItemViewSet, basename='menu-item')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/', ReportingViewSet.as_view({'get': 'stats'}), name='inventory-reports'),
]
