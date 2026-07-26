from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.timetable.views import TimetablePeriodViewSet

router = DefaultRouter()
router.register('periods', TimetablePeriodViewSet, basename='timetable-period')

urlpatterns = [
    path('', include(router.urls)),
]
