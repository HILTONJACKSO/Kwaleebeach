from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccessPassViewSet, PassTypeViewSet, PassReturnViewSet,
    ActivityViewSet, PackageViewSet, CSRProjectViewSet,
    EventViewSet
)

router = DefaultRouter()
router.register(r'passes', AccessPassViewSet)
router.register(r'types', PassTypeViewSet)
router.register(r'returns', PassReturnViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'packages', PackageViewSet)
router.register(r'csr', CSRProjectViewSet)
router.register(r'events', EventViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
