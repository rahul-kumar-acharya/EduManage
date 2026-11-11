import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from '../components/ui/PageLoader';

// Static Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';
import SuperAdminRoute from './SuperAdminRoute';

// Lazy-loaded Public Pages
const Home = lazy(() => import('../pages/public/Home'));
const Features = lazy(() => import('../pages/public/Features'));
const Pricing = lazy(() => import('../pages/public/Pricing'));
const About = lazy(() => import('../pages/public/About'));
const Faq = lazy(() => import('../pages/public/Faq'));
const Contact = lazy(() => import('../pages/public/Contact'));
const PrivacyPolicy = lazy(() => import('../pages/public/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/public/TermsOfService'));
const NotFound = lazy(() => import('../pages/public/NotFound'));

// Lazy-loaded Auth Pages
const Login = lazy(() => import('../pages/auth/Login'));
const RegisterSchool = lazy(() => import('../pages/auth/RegisterSchool'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const SuperAdminLogin = lazy(() => import('../pages/auth/SuperAdminLogin'));

// Lazy-loaded Dashboards
const SchoolAdminDashboard = lazy(() => import('../pages/dashboard/SchoolAdminDashboard'));
const TeacherDashboard = lazy(() => import('../pages/dashboard/TeacherDashboard'));
const StudentDashboard = lazy(() => import('../pages/dashboard/StudentDashboard'));
const ParentDashboard = lazy(() => import('../pages/dashboard/ParentDashboard'));
const AccountantDashboard = lazy(() => import('../pages/dashboard/AccountantDashboard'));
const ProfileSettings = lazy(() => import('../pages/dashboard/ProfileSettings'));

// Lazy-loaded Super Admin Suite
const SuperAdminDashboard = lazy(() => import('../pages/dashboard/SuperAdminDashboard'));
const SuperAdminPlans = lazy(() => import('../pages/dashboard/SuperAdminPlans'));
const SuperAdminUsers = lazy(() => import('../pages/dashboard/SuperAdminUsers'));
const SuperAdminAnalytics = lazy(() => import('../pages/dashboard/SuperAdminAnalytics'));
const SuperAdminInquiries = lazy(() => import('../pages/dashboard/SuperAdminInquiries'));
const SuperAdminSettings = lazy(() => import('../pages/dashboard/SuperAdminSettings'));

// Lazy-loaded Academic & Operational Modules
const Sessions = lazy(() => import('../pages/academics/Sessions'));
const ClassesSections = lazy(() => import('../pages/academics/ClassesSections'));
const Subjects = lazy(() => import('../pages/academics/Subjects'));
const TeacherList = lazy(() => import('../pages/teachers/TeacherList'));
const StudentList = lazy(() => import('../pages/students/StudentList'));
const AccountantList = lazy(() => import('../pages/accountants/AccountantList'));
const AttendanceSheet = lazy(() => import('../pages/attendance/AttendanceSheet'));
const HomeworkList = lazy(() => import('../pages/homework/HomeworkList'));
const TimetableSchedule = lazy(() => import('../pages/timetable/TimetableSchedule'));
const NoticeBoard = lazy(() => import('../pages/notices/NoticeBoard'));
const ExamList = lazy(() => import('../pages/exams/ExamList'));
const MarksEntry = lazy(() => import('../pages/exams/MarksEntry'));
const ReportCardView = lazy(() => import('../pages/exams/ReportCardView'));
const FeeStructures = lazy(() => import('../pages/fees/FeeStructures'));
const FeeCollection = lazy(() => import('../pages/fees/FeeCollection'));
const DueFeesList = lazy(() => import('../pages/fees/DueFeesList'));
const ReportsDashboard = lazy(() => import('../pages/reports/ReportsDashboard'));
const SubscriptionPanel = lazy(() => import('../pages/subscription/SubscriptionPanel'));

const DashboardRouter = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <Navigate to="/super-admin" replace />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    case 'SCHOOL_ADMIN':
    default:
      return <SchoolAdminDashboard />;
  }
};

const AppRoutes = () => {
  const { subdomain } = useSchool();
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
        </Route>

        {/* Dedicated Super Admin Login Page */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        {/* Dedicated Protected Super Admin Layout */}
        <Route element={<SuperAdminRoute />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="plans" element={<SuperAdminPlans />} />
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="inquiries" element={<SuperAdminInquiries />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>
        </Route>

        {/* Tenant Dashboard Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRouter />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
              <Route path="academics/sessions" element={<Sessions />} />
              <Route path="academics/classes" element={<ClassesSections />} />
            </Route>
            <Route path="academics/subjects" element={<Subjects />} />
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
              <Route path="accountants" element={<AccountantList />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']} />}>
              <Route path="teachers" element={<TeacherList />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'TEACHER', 'ACCOUNTANT', 'SUPER_ADMIN']} />}>
              <Route path="students" element={<StudentList />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']} />}>
              <Route path="attendance" element={<AttendanceSheet />} />
            </Route>
            <Route path="notices" element={<NoticeBoard />} />
            <Route element={<RoleRoute allowedRoles={['TEACHER', 'STUDENT', 'PARENT', 'SUPER_ADMIN']} />}>
              <Route path="homework" element={<HomeworkList />} />
              <Route path="timetable" element={<TimetableSchedule />} />
              <Route path="exams" element={<ExamList />} />
              <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
                <Route path="exams/marks-entry" element={<MarksEntry />} />
              </Route>
              <Route path="exams/report-card" element={<ReportCardView />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['ACCOUNTANT', 'SUPER_ADMIN']} />}>
              <Route path="fees" element={<FeeStructures />} />
              <Route path="fees/structure" element={<FeeStructures />} />
              <Route path="fees/collection" element={<FeeCollection />} />
              <Route path="fees/dues" element={<DueFeesList />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN']} />}>
              <Route path="reports" element={<ReportsDashboard />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
              <Route path="subscription" element={<SubscriptionPanel />} />
            </Route>
          </Route>
        </Route>

        {/* Main Marketing Domain Public Routes */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              subdomain ? (
                isAuthenticated ? (
                  user?.role === 'SUPER_ADMIN' ? <Navigate to="/super-admin" replace /> : <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              ) : (
                <Home />
              )
            }
          />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
