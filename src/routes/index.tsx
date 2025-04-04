import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UpdatedLayout from '../components/layout/UpdatedLayout';
import DashboardLayout from '../components/layout/dashboard/DashboardLayout';
import SupportLayout from '../components/layout/support/SupportLayout';

// Authentication
import ProtectedRoute from '../components/layout/ProtectedRoute';
import { FormWizardProvider } from '../contexts/FormWizardContext';

// Pages
// Home
import HomePage from '../pages/home/HomePage';
import TestPage from '../pages/home/TestPage';
import ClearDataPage from '../pages/home/ClearDataPage';

// Auth
import LoginPage from '../pages/auth/LoginPage';
import AdminLoginPage from '../pages/auth/AdminLoginPage';

// Dashboard
import StudentDashboardPage from '../pages/dashboard/StudentDashboardPage';
import StudentNominationsPage from '../pages/dashboard/StudentNominationsPage';
import StudentProfilePage from '../pages/dashboard/StudentProfilePage';

// Admin
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminNominationsPage from '../pages/admin/AdminNominationsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

// Nomination
import NominationPage from '../pages/nomination/NominationPage';

// Support
import SupportPage from '../pages/support/SupportPage';

// Define route with layout
const RouteWithLayout = ({ element, layout: Layout }: { element: React.ReactNode, layout: React.ComponentType<any> }) => (
  <Layout>{element}</Layout>
);

// Define protected route with layout
const ProtectedRouteWithLayout = ({ 
  element, 
  layout: Layout, 
  requireAdmin = false 
}: { 
  element: React.ReactNode, 
  layout: React.ComponentType<any>,
  requireAdmin?: boolean
}) => (
  <ProtectedRoute requireAdmin={requireAdmin}>
    <Layout>{element}</Layout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route path="/" element={<HomePage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/clear-data" element={<ClearDataPage />} />
      
      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Support Pages */}
      <Route path="/support/:shareId" element={<SupportPage />} />
      
      {/* Protected Student Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard/nominations"
        element={
          <ProtectedRoute>
            <StudentNominationsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <StudentProfilePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/nominate"
        element={
          <ProtectedRoute>
            <FormWizardProvider>
              <NominationPage />
            </FormWizardProvider>
          </ProtectedRoute>
        }
      />
      
      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/nominations"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNominationsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requireAdmin>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
