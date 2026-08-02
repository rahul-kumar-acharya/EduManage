import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';

import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

import Home from '../pages/public/Home';
import Features from '../pages/public/Features';
import Pricing from '../pages/public/Pricing';
import About from '../pages/public/About';
import Faq from '../pages/public/Faq';
import Contact from '../pages/public/Contact';
import PrivacyPolicy from '../pages/public/PrivacyPolicy';
import TermsOfService from '../pages/public/TermsOfService';

import Login from '../pages/auth/Login';
import RegisterSchool from '../pages/auth/RegisterSchool';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import SchoolAdminDashboard from '../pages/dashboard/SchoolAdminDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import ParentDashboard from '../pages/dashboard/ParentDashboard';
import AccountantDashboard from '../pages/dashboard/AccountantDashboard';
import SuperAdminDashboard from '../pages/dashboard/SuperAdminDashboard';
import SuperAdminPlans from '../pages/dashboard/SuperAdminPlans';
import SuperAdminUsers from '../pages/dashboard/SuperAdminUsers';
import SuperAdminAnalytics from '../pages/dashboard/SuperAdminAnalytics';
import SuperAdminInquiries from '../pages/dashboard/SuperAdminInquiries';
import SuperAdminSettings from '../pages/dashboard/SuperAdminSettings';


import ProfileSettings from '../pages/dashboard/ProfileSettings';

import Sessions from '../pages/academics/Sessions';
import ClassesSections from '../pages/academics/ClassesSections';
import Subjects from '../pages/academics/Subjects';
import TeacherList from '../pages/teachers/TeacherList';
import StudentList from '../pages/students/StudentList';
import AccountantList from '../pages/accountants/AccountantList';

import AttendanceSheet from '../pages/attendance/AttendanceSheet';
import HomeworkList from '../pages/homework/HomeworkList';
import TimetableSchedule from '../pages/timetable/TimetableSchedule';
import NoticeBoard from '../pages/notices/NoticeBoard';

import ExamList from '../pages/exams/ExamList';
import MarksEntry from '../pages/exams/MarksEntry';
import ReportCardView from '../pages/exams/ReportCardView';

import FeeStructures from '../pages/fees/FeeStructures';
import FeeCollection from '../pages/fees/FeeCollection';
import DueFeesList from '../pages/fees/DueFeesList';

import ReportsDashboard from '../pages/reports/ReportsDashboard';
import SubscriptionPanel from '../pages/subscription/SubscriptionPanel';

import SuperAdminLogin from '../pages/auth/SuperAdminLogin';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import GuestRoute from './GuestRoute';
import SuperAdminRoute from './SuperAdminRoute';


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
          <Route path="academics/sessions" element={<Sessions />} />
          <Route path="academics/classes" element={<ClassesSections />} />
          <Route path="academics/subjects" element={<Subjects />} />
          <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="accountants" element={<AccountantList />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER']} />}>
            <Route path="teachers" element={<TeacherList />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['TEACHER', 'SUPER_ADMIN']} />}>
            <Route path="students" element={<StudentList />} />
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
            <Route path="fees/structures" element={<FeeStructures />} />
            <Route path="fees/collection" element={<FeeCollection />} />
            <Route path="fees/dues" element={<DueFeesList />} />
          </Route>
          <Route element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="reports" element={<ReportsDashboard />} />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
