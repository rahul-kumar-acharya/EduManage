from django.contrib import admin
from apps.academics.models import AcademicSession, ClassLevel, Section, Subject

@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'start_date', 'end_date', 'is_current', 'school')
    list_filter = ('is_current', 'school')
    search_fields = ('name',)

@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'academic_session', 'school')
    list_filter = ('academic_session', 'school')
    search_fields = ('name',)

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'class_level', 'class_teacher', 'school')
    list_filter = ('class_level__academic_session', 'school')
    search_fields = ('name', 'class_level__name')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'school')
    list_filter = ('school',)
    search_fields = ('name', 'code')
