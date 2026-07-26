class UserRole:
    SUPER_ADMIN = 'SUPER_ADMIN'
    SCHOOL_ADMIN = 'SCHOOL_ADMIN'
    TEACHER = 'TEACHER'
    ACCOUNTANT = 'ACCOUNTANT'
    STUDENT = 'STUDENT'
    PARENT = 'PARENT'
    STAFF = 'STAFF'

    CHOICES = [
        (SUPER_ADMIN, 'Super Admin'),
        (SCHOOL_ADMIN, 'School Admin'),
        (TEACHER, 'Teacher'),
        (ACCOUNTANT, 'Accountant'),
        (STUDENT, 'Student'),
        (PARENT, 'Parent'),
        (STAFF, 'Staff'),
    ]
