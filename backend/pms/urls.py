from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, BookingViewSet, GlobalSearchView

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'bookings', BookingViewSet)

urlpatterns = [
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]
