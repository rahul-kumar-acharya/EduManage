from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.accountants.views import AccountantProfileViewSet

router = DefaultRouter()
router.register('profiles', AccountantProfileViewSet, basename='accountant-profile')

urlpatterns = [
    path('', include(router.urls)),
]
