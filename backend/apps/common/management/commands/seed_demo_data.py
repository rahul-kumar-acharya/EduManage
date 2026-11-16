from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.common.constants import UserRole
from apps.schools.models import School
from apps.subscriptions.models import SubscriptionPlan, SchoolSubscription
from apps.academics.models import AcademicSession, ClassLevel, Section, Subject
from apps.teachers.models import TeacherProfile
from apps.students.models import StudentProfile
from apps.accountants.models import AccountantProfile
from apps.attendance.models import StudentAttendance
from apps.fees.models import FeeStructure, StudentFeePayment
from apps.exams.models import Exam, ExamMark
from apps.timetable.models import TimetablePeriod
from apps.notices.models import Notice
from apps.homework.models import HomeworkAssignment

User = get_user_model()

DEFAULT_PASSWORD = "DemoPassword123!"

class Command(BaseCommand):
    help = "Seeds initial demo school, academic structures, students, teachers, exams, and accounts for all roles."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting AcharyaCampus Demo Data Seeder..."))

        # ----------------------------------------------------------------------
        # 1. SUBSCRIPTION PLANS
        # ----------------------------------------------------------------------
        plans_data = [
            {'name': 'Starter Plan', 'code': 'starter', 'price': 0.00, 'max_students': 100, 'max_teachers': 10},
            {'name': 'Growth Plan', 'code': 'growth', 'price': 49.00, 'max_students': 500, 'max_teachers': 50},
            {'name': 'Enterprise Plan', 'code': 'enterprise', 'price': 149.00, 'max_students': 5000, 'max_teachers': 500},
        ]
        created_plans = {}
        for p in plans_data:
            plan, _ = SubscriptionPlan.objects.get_or_create(code=p['code'], defaults=p)
            created_plans[p['code']] = plan

        self.stdout.write(self.style.SUCCESS("✓ Subscription plans initialized."))

        # ----------------------------------------------------------------------
        # 2. SUPER ADMIN ACCOUNT
        # ----------------------------------------------------------------------
        super_admin_email = "support.acharyacampus@gmail.com"
        super_admin, sa_created = User.objects.get_or_create(
            email=super_admin_email,
            defaults={
                'username': super_admin_email,
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': UserRole.SUPER_ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        super_admin.role = UserRole.SUPER_ADMIN
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.set_password(DEFAULT_PASSWORD)
        super_admin.save()
        self.stdout.write(self.style.SUCCESS(f"✓ Super Admin configured: {super_admin.email}"))

        # ----------------------------------------------------------------------
        # 3. DEMO SCHOOL (TENANT: 'demo')
        # ----------------------------------------------------------------------
        school, s_created = School.objects.get_or_create(
            subdomain="demo",
            defaults={
                'name': "Acharya Model Public School",
                'email': "info@demoschool.com",
                'phone': "+91 98765 43210",
                'address': "Sector 12, Institutional Area",
                'city': "New Delhi",
                'state': "Delhi",
                'pincode': "110001",
                'is_active': True,
            }
        )
        if not s_created:
            school.name = "Acharya Model Public School"
            school.is_active = True
            school.save()

        # School Subscription
        SchoolSubscription.objects.update_or_create(
            school=school,
            defaults={
                'plan': created_plans['enterprise'],
                'status': 'ACTIVE',
                'end_date': date.today() + timedelta(days=365),
            }
        )
        self.stdout.write(self.style.SUCCESS(f"✓ Demo School initialized: {school.name} (Subdomain: '{school.subdomain}')"))

        # ----------------------------------------------------------------------
        # 4. ACADEMIC SESSION (2026 - 2027)
        # ----------------------------------------------------------------------
        session, _ = AcademicSession.objects.get_or_create(
            school=school,
            name="2026 - 2027",
            defaults={
                'start_date': date(2026, 4, 1),
                'end_date': date(2027, 3, 31),
                'is_current': True,
            }
        )
        session.is_current = True
        session.save()

        # ----------------------------------------------------------------------
        # 5. CLASSES & SECTIONS
        # ----------------------------------------------------------------------
        # Classes: Grade 10, Grade 9, Grade 8
        grade_10, _ = ClassLevel.objects.get_or_create(
            school=school,
            name="Grade 10",
            defaults={'academic_session': session}
        )
        grade_9, _ = ClassLevel.objects.get_or_create(
            school=school,
            name="Grade 9",
            defaults={'academic_session': session}
        )
        grade_8, _ = ClassLevel.objects.get_or_create(
            school=school,
            name="Grade 8",
            defaults={'academic_session': session}
        )

        # Sections for Grade 10
        sec_10_a, _ = Section.objects.get_or_create(
            school=school,
            class_level=grade_10,
            name="A"
        )
        sec_10_b, _ = Section.objects.get_or_create(
            school=school,
            class_level=grade_10,
            name="B"
        )

        # ----------------------------------------------------------------------
        # 6. TEACHERS (FACULTY)
        # ----------------------------------------------------------------------
        # Teacher 1: Vikram Sharma (Class Teacher for Grade 10-A)
        teacher_1_email = "teacher@demoschool.com"
        teacher_1_user, _ = User.objects.get_or_create(
            email=teacher_1_email,
            defaults={
                'username': teacher_1_email,
                'first_name': 'Vikram',
                'last_name': 'Sharma',
                'role': UserRole.TEACHER,
                'school': school,
                'phone': '+91 98765 11101',
            }
        )
        teacher_1_user.set_password(DEFAULT_PASSWORD)
        teacher_1_user.save()

        teacher_1_profile, _ = TeacherProfile.objects.get_or_create(
            school=school,
            user=teacher_1_user,
            defaults={
                'employee_id': 'EMP-T-101',
                'department': 'Mathematics',
                'qualification': 'M.Sc. Mathematics, B.Ed.',
            }
        )

        # Assign Vikram Sharma as Class Teacher of Grade 10-A
        sec_10_a.class_teacher = teacher_1_profile
        sec_10_a.save()

        # Teacher 2: Priya Patel (Science)
        teacher_2_email = "priya.teacher@demoschool.com"
        teacher_2_user, _ = User.objects.get_or_create(
            email=teacher_2_email,
            defaults={
                'username': teacher_2_email,
                'first_name': 'Priya',
                'last_name': 'Patel',
                'role': UserRole.TEACHER,
                'school': school,
                'phone': '+91 98765 11102',
            }
        )
        teacher_2_user.set_password(DEFAULT_PASSWORD)
        teacher_2_user.save()

        teacher_2_profile, _ = TeacherProfile.objects.get_or_create(
            school=school,
            user=teacher_2_user,
            defaults={
                'employee_id': 'EMP-T-102',
                'department': 'Physical Sciences',
                'qualification': 'M.Sc. Physics',
            }
        )

        # ----------------------------------------------------------------------
        # 7. SUBJECTS FOR GRADE 10 SECTION A
        # ----------------------------------------------------------------------
        subjects_data = [
            {'name': 'Mathematics', 'code': 'MATH-10'},
            {'name': 'Science & Physics', 'code': 'SCI-10'},
            {'name': 'English Language', 'code': 'ENG-10'},
            {'name': 'Social Studies', 'code': 'SST-10'},
            {'name': 'Computer Science', 'code': 'CS-10'},
        ]
        created_subjects = {}
        for s in subjects_data:
            sub, _ = Subject.objects.get_or_create(
                school=school,
                class_level=grade_10,
                section=sec_10_a,
                name=s['name'],
                defaults={'code': s['code']}
            )
            created_subjects[s['name']] = sub

        # ----------------------------------------------------------------------
        # 8. SCHOOL ADMIN ACCOUNT
        # ----------------------------------------------------------------------
        school_admin_email = "admin@demo.campus.acharyarahul.in"
        school_admin, _ = User.objects.get_or_create(
            email=school_admin_email,
            defaults={
                'username': school_admin_email,
                'first_name': 'Rajeev',
                'last_name': 'Kapoor',
                'role': UserRole.SCHOOL_ADMIN,
                'school': school,
                'phone': '+91 98765 00000',
            }
        )
        school_admin.set_password(DEFAULT_PASSWORD)
        school_admin.save()
        self.stdout.write(self.style.SUCCESS(f"✓ School Admin created: {school_admin.email}"))

        # ----------------------------------------------------------------------
        # 9. ACCOUNTANT ACCOUNT
        # ----------------------------------------------------------------------
        accountant_email = "accountant@demoschool.com"
        accountant_user, _ = User.objects.get_or_create(
            email=accountant_email,
            defaults={
                'username': accountant_email,
                'first_name': 'Rajesh',
                'last_name': 'Verma',
                'role': UserRole.ACCOUNTANT,
                'school': school,
                'phone': '+91 98765 22201',
            }
        )
        accountant_user.set_password(DEFAULT_PASSWORD)
        accountant_user.save()

        AccountantProfile.objects.get_or_create(
            school=school,
            user=accountant_user,
            defaults={'employee_id': 'EMP-ACC-201'}
        )
        self.stdout.write(self.style.SUCCESS(f"✓ Accountant created: {accountant_user.email}"))

        # ----------------------------------------------------------------------
        # 10. STUDENTS & PARENTS
        # ----------------------------------------------------------------------
        students_info = [
            {
                'email': 'student@demoschool.com',
                'first_name': 'Aarav',
                'last_name': 'Kumar',
                'admission_number': 'ADM-2026-001',
                'roll_number': '1',
                'guardian_name': 'Sanjay Kumar',
                'guardian_email': 'parent@demoschool.com',
                'guardian_phone': '+91 98765 33301',
            },
            {
                'email': 'ananya@demoschool.com',
                'first_name': 'Ananya',
                'last_name': 'Singh',
                'admission_number': 'ADM-2026-002',
                'roll_number': '2',
                'guardian_name': 'Ramesh Singh',
                'guardian_email': 'ramesh.singh@gmail.com',
                'guardian_phone': '+91 98765 33302',
            },
            {
                'email': 'rohan@demoschool.com',
                'first_name': 'Rohan',
                'last_name': 'Gupta',
                'admission_number': 'ADM-2026-003',
                'roll_number': '3',
                'guardian_name': 'Manoj Gupta',
                'guardian_email': 'manoj.gupta@gmail.com',
                'guardian_phone': '+91 98765 33303',
            },
            {
                'email': 'isha@demoschool.com',
                'first_name': 'Isha',
                'last_name': 'Sharma',
                'admission_number': 'ADM-2026-004',
                'roll_number': '4',
                'guardian_name': 'Sunil Sharma',
                'guardian_email': 'sunil.sharma@gmail.com',
                'guardian_phone': '+91 98765 33304',
            },
            {
                'email': 'kabir@demoschool.com',
                'first_name': 'Kabir',
                'last_name': 'Mehta',
                'admission_number': 'ADM-2026-005',
                'roll_number': '5',
                'guardian_name': 'Deepak Mehta',
                'guardian_email': 'deepak.mehta@gmail.com',
                'guardian_phone': '+91 98765 33305',
            },
        ]

        created_student_profiles = []
        for s in students_info:
            stu_user, _ = User.objects.get_or_create(
                email=s['email'],
                defaults={
                    'username': s['email'],
                    'first_name': s['first_name'],
                    'last_name': s['last_name'],
                    'role': UserRole.STUDENT,
                    'school': school,
                }
            )
            stu_user.set_password(DEFAULT_PASSWORD)
            stu_user.save()

            st_prof, _ = StudentProfile.objects.update_or_create(
                school=school,
                user=stu_user,
                defaults={
                    'admission_number': s['admission_number'],
                    'roll_number': s['roll_number'],
                    'section': sec_10_a,
                    'guardian_name': s['guardian_name'],
                    'guardian_email': s['guardian_email'],
                    'guardian_phone': s['guardian_phone'],
                }
            )
            created_student_profiles.append(st_prof)

        # Parent Account for Aarav Kumar
        parent_email = "parent@demoschool.com"
        parent_user, _ = User.objects.get_or_create(
            email=parent_email,
            defaults={
                'username': parent_email,
                'first_name': 'Sanjay',
                'last_name': 'Kumar',
                'role': UserRole.PARENT,
                'school': school,
                'phone': '+91 98765 33301',
            }
        )
        parent_user.set_password(DEFAULT_PASSWORD)
        parent_user.save()
        self.stdout.write(self.style.SUCCESS(f"✓ Students and Parent accounts initialized."))

        # ----------------------------------------------------------------------
        # 11. TIMETABLE SCHEDULE (Grade 10 - Section A)
        # ----------------------------------------------------------------------
        schedule_slots = [
            {'num': 1, 'start': time(8, 0), 'end': time(8, 45), 'sub': 'Mathematics', 'teach': teacher_1_profile, 'room': 'Room 101'},
            {'num': 2, 'start': time(8, 45), 'end': time(9, 30), 'sub': 'Science & Physics', 'teach': teacher_2_profile, 'room': 'Lab 2'},
            {'num': 3, 'start': time(9, 30), 'end': time(10, 15), 'sub': 'English Language', 'teach': teacher_1_profile, 'room': 'Room 101'},
            {'num': 4, 'start': time(10, 15), 'end': time(11, 0), 'sub': 'Social Studies', 'teach': teacher_2_profile, 'room': 'Room 101'},
            {'num': 5, 'start': time(11, 30), 'end': time(12, 15), 'sub': 'Computer Science', 'teach': teacher_1_profile, 'room': 'Computer Lab'},
        ]
        days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
        for d in days:
            for slot in schedule_slots:
                sub_obj = created_subjects.get(slot['sub'])
                if sub_obj:
                    TimetablePeriod.objects.update_or_create(
                        school=school,
                        section=sec_10_a,
                        day_of_week=d,
                        start_time=slot['start'],
                        defaults={
                            'end_time': slot['end'],
                            'subject': sub_obj,
                            'teacher': slot['teach'],
                            'room_number': slot['room'],
                        }
                    )
        self.stdout.write(self.style.SUCCESS("✓ Weekly Timetable Matrix generated."))

        # ----------------------------------------------------------------------
        # 12. ATTENDANCE RECORDS (Past 14 School Days)
        # ----------------------------------------------------------------------
        today = date.today()
        for i in range(1, 15):
            att_date = today - timedelta(days=i)
            # Skip weekends
            if att_date.weekday() >= 5:
                continue

            for idx, st in enumerate(created_student_profiles):
                # Realistic pattern: student 1 has 95% attendance, student 3 misses 1 day
                status = 'ABSENT' if (idx == 2 and i == 4) or (idx == 4 and i == 8) else 'PRESENT'
                StudentAttendance.objects.update_or_create(
                    school=school,
                    student=st,
                    date=att_date,
                    defaults={'status': status}
                )
        self.stdout.write(self.style.SUCCESS("✓ 14 days of realistic student attendance populated."))

        # ----------------------------------------------------------------------
        # 13. FEE STRUCTURE & PAYMENTS
        # ----------------------------------------------------------------------
        fee_tuition, _ = FeeStructure.objects.update_or_create(
            school=school,
            name="Quarterly Tuition Fee (Term 1)",
            defaults={'amount': 12500.00, 'due_date': date(2026, 12, 31)}
        )
        fee_lab, _ = FeeStructure.objects.update_or_create(
            school=school,
            name="Annual Computer & STEM Lab Fee",
            defaults={'amount': 3500.00, 'due_date': date(2026, 12, 31)}
        )
        fee_exam, _ = FeeStructure.objects.update_or_create(
            school=school,
            name="Midterm Examination Fee",
            defaults={'amount': 1500.00, 'due_date': date(2026, 11, 30)}
        )

        # Payment for Aarav Kumar (Tuition Paid)
        StudentFeePayment.objects.update_or_create(
            school=school,
            receipt_number="REC-2026-001",
            defaults={
                'fee_structure': fee_tuition,
                'student': created_student_profiles[0],
                'amount_paid': 12500.00,
                'status': 'PAID',
            }
        )
        # Payment for Ananya Singh (Lab Fee Paid)
        StudentFeePayment.objects.update_or_create(
            school=school,
            receipt_number="REC-2026-002",
            defaults={
                'fee_structure': fee_lab,
                'student': created_student_profiles[1],
                'amount_paid': 3500.00,
                'status': 'PAID',
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Fee structures and payments ledger created."))

        # ----------------------------------------------------------------------
        # 14. EXAMS & REPORT CARDS
        # ----------------------------------------------------------------------
        midterm_exam, _ = Exam.objects.update_or_create(
            school=school,
            name="Mid-Term Examination 2026",
            defaults={'start_date': date(2026, 9, 15), 'end_date': date(2026, 9, 25)}
        )

        aarav_student = created_student_profiles[0]
        aarav_scores = {
            'Mathematics': 94.0,
            'Science & Physics': 88.5,
            'English Language': 91.0,
            'Social Studies': 85.0,
            'Computer Science': 98.0,
        }
        for sub_name, marks in aarav_scores.items():
            sub_obj = created_subjects.get(sub_name)
            if sub_obj:
                ExamMark.objects.update_or_create(
                    school=school,
                    exam=midterm_exam,
                    student=aarav_student,
                    subject=sub_obj,
                    defaults={'marks_obtained': marks, 'max_marks': 100.00}
                )
        self.stdout.write(self.style.SUCCESS("✓ Midterm Examination and report card marks seeded."))

        # ----------------------------------------------------------------------
        # 15. NOTICES & HOMEWORK
        # ----------------------------------------------------------------------
        Notice.objects.update_or_create(
            school=school,
            title="Annual Sports Meet 2026 Schedule & Guidelines",
            defaults={
                'content': "The Annual Athletic Sports Meet is scheduled for next month. All students must register for track and field events with their respective house captains.",
                'is_public': True,
            }
        )
        Notice.objects.update_or_create(
            school=school,
            title="Parent-Teacher Conference (PTC) Announced for November",
            defaults={
                'content': "Parent-Teacher interactions will take place this Saturday between 09:00 AM and 01:00 PM. Report cards for the Midterm examination will be shared.",
                'is_public': True,
            }
        )

        sub_math = created_subjects.get('Mathematics')
        if sub_math:
            HomeworkAssignment.objects.update_or_create(
                school=school,
                section=sec_10_a,
                subject=sub_math,
                title="Quadratic Equations & Polynomials Exercise 4.2",
                defaults={
                    'description': "Complete problems 1 through 15 on page 84. Ensure step-by-step graphical derivations are shown in your assignment notebook.",
                    'due_date': today + timedelta(days=5),
                    'assigned_by': teacher_1_user,
                }
            )

        self.stdout.write(self.style.SUCCESS("✓ School Circular Notices & Homework assignments created."))

        # ----------------------------------------------------------------------
        # SUMMARY
        # ----------------------------------------------------------------------
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS("ACHARYACAMPUS SEEDING COMPLETED SUCCESSFULLY!"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"Universal Demo Password: {DEFAULT_PASSWORD}\n")
        self.stdout.write("Login Accounts:")
        self.stdout.write(f"  1. Super Admin   : {super_admin.email}")
        self.stdout.write(f"  2. School Admin  : {school_admin.email} (Tenant: 'demo')")
        self.stdout.write(f"  3. Teacher       : {teacher_1_user.email} (Tenant: 'demo')")
        self.stdout.write(f"  4. Accountant    : {accountant_user.email} (Tenant: 'demo')")
        self.stdout.write(f"  5. Student       : {students_info[0]['email']} (Tenant: 'demo')")
        self.stdout.write(f"  6. Parent        : {parent_user.email} (Tenant: 'demo')")
        self.stdout.write("=" * 70 + "\n")
