from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.payments.views import PaymentTransactionViewSet

router = DefaultRouter()
router.register('transactions', PaymentTransactionViewSet, basename='payment-transaction')

urlpatterns = [
    path('', include(router.urls)),
]
