from rest_framework.permissions import BasePermission
from apps.common.constants import UserRole

def get_user_permissions(user):
    # Default permissions (extensible dictionary)
    perms = {
        "manage_students": False,
        "manage_attendance": False,
        "manage_subjects": False,
        "manage_timetable": False,
        "manage_homework": False,
        "manage_fees": False,
    }

    if not user or not user.is_authenticated:
        return perms

    if user.role in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]:
        perms.update({
            "manage_students": True,
            "manage_attendance": True,
            "manage_subjects": True,
            "manage_timetable": True,
            "manage_homework": True,
            "manage_fees": True,
        })
    elif user.role == UserRole.TEACHER:
        teacher_profile = getattr(user, 'teacher_profile', None)
        is_class_teacher = bool(teacher_profile and teacher_profile.assigned_sections.exists())
        perms.update({
            "manage_students": is_class_teacher,
            "manage_attendance": is_class_teacher,
            "manage_subjects": is_class_teacher,
            "manage_timetable": is_class_teacher,
            "manage_homework": True,  # All teachers can assign homework
        })
    elif user.role == UserRole.ACCOUNTANT:
        perms.update({
            "manage_fees": True,
        })

    return perms

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.SUPER_ADMIN)

class IsSchoolAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN])

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.TEACHER])

class IsAccountant(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT])

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.STUDENT)

class IsParent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.PARENT)

class IsSchoolAdminOrTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER])

class IsTeacherOrStudentParent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT])

class IsSchoolAdminOrTeacherOrStudentParent(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT])

class HasTenantAccess(BasePermission):
    """
    Ensures user belongs to the active tenant in request.school (or is SuperAdmin).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        if request.school and request.user.school_id == request.school.id:
            return True
        return False

# Reusable Permission-Based Access Classes
class CanManageStudents(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = getattr(request.user, 'permissions', None) or get_user_permissions(request.user)
        return perms.get('manage_students', False)

class CanManageAttendance(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = getattr(request.user, 'permissions', None) or get_user_permissions(request.user)
        return perms.get('manage_attendance', False)

class CanManageSubjects(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = getattr(request.user, 'permissions', None) or get_user_permissions(request.user)
        return perms.get('manage_subjects', False)

class CanManageTimetable(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = getattr(request.user, 'permissions', None) or get_user_permissions(request.user)
        return perms.get('manage_timetable', False)

class CanManageHomework(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        perms = getattr(request.user, 'permissions', None) or get_user_permissions(request.user)
        return perms.get('manage_homework', False)
