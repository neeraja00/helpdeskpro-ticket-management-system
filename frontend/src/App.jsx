import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './views/Login';
import Register from './views/Register';
import DashboardLayout from './layouts/DashboardLayout';
import CustomerPortal from './views/CustomerPortal';
import AgentPortal from './views/AgentPortal';
import AdminDashboard from './views/AdminDashboard';
import TicketDetails from './views/TicketDetails';
import Overview from './views/Overview';
import KnowledgeBase from './views/KnowledgeBase';
import UserManagement from './views/UserManagement';
import PerformanceReports from './views/PerformanceReports';
import SystemSettings from './views/SystemSettings';
import Profile from './views/Profile';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px'
          }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout><Overview /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/customer" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <DashboardLayout><CustomerPortal /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/agent" element={
            <ProtectedRoute allowedRoles={['agent']}>
              <DashboardLayout><AgentPortal /></DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><AdminDashboard /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/ticket/:id" element={
            <ProtectedRoute>
              <DashboardLayout><TicketDetails /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/knowledge" element={
            <ProtectedRoute>
              <DashboardLayout><KnowledgeBase /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout><Profile /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><UserManagement /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><PerformanceReports /></DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout><SystemSettings /></DashboardLayout>
            </ProtectedRoute>
          } />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
