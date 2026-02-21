from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SiteConfigViewSet

router = DefaultRouter()
router.register(r'config', SiteConfigViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
