from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.fees.views import FeeStructureViewSet, StudentFeePaymentViewSet

router = DefaultRouter()
router.register('structures', FeeStructureViewSet, basename='fee-structure')
router.register('payments', StudentFeePaymentViewSet, basename='fee-payment')

urlpatterns = [
    path('', include(router.urls)),
]
