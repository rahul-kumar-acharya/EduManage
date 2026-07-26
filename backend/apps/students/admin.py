from django.contrib import admin
from apps.students.models import StudentProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'admission_number', 'roll_number', 'section', 'school')
    list_filter = ('section__class_level', 'school')
    search_fields = ('admission_number', 'user__first_name', 'user__last_name', 'user__email')
