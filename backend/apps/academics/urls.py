from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academics.views import AcademicSessionViewSet, ClassLevelViewSet, SectionViewSet, SubjectViewSet

router = DefaultRouter()
router.register('sessions', AcademicSessionViewSet, basename='academic-session')
router.register('classes', ClassLevelViewSet, basename='class-level')
router.register('sections', SectionViewSet, basename='section')
router.register('subjects', SubjectViewSet, basename='subject')

urlpatterns = [
    path('', include(router.urls)),
]
