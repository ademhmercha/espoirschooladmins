import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';
import AdminLayout from './components/AdminLayout';
import TeacherLayout from './components/TeacherLayout';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Teachers from './pages/admin/Teachers';
import Groups from './pages/admin/Groups';
import GroupDetail from './pages/admin/GroupDetail';
import Students from './pages/admin/Students';
import StudentDetail from './pages/admin/StudentDetail';
import Payments from './pages/admin/Payments';
import TeacherHome from './pages/teacher/Home';
import TeacherGroupDetail from './pages/teacher/GroupDetail';
import Profile from './pages/teacher/Profile';

function PrivateRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'admin' | 'teacher';
}) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/teacher/my-groups'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner" />
      </div>
    );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/dashboard' : '/teacher/my-groups'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin routes */}
      <Route
        element={
          <PrivateRoute role="admin">
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/payments" element={<Payments />} />
      </Route>

      {/* Teacher routes */}
      <Route
        element={
          <PrivateRoute role="teacher">
            <TeacherLayout />
          </PrivateRoute>
        }
      >
        <Route path="/teacher/my-groups" element={<TeacherHome />} />
        <Route path="/teacher/groups/:id" element={<TeacherGroupDetail />} />
        <Route path="/teacher/profile" element={<Profile />} />
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to={user ? (user.role === 'admin' ? '/dashboard' : '/teacher/my-groups') : '/login'}
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
