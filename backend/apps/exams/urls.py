from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.exams.views import ExamViewSet, ExamMarkViewSet

router = DefaultRouter()
router.register('exams', ExamViewSet, basename='exam')
router.register('marks', ExamMarkViewSet, basename='exam-mark')

urlpatterns = [
    path('', include(router.urls)),
]
