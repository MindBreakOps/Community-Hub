import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Landing from './pages/Landing';
import Subscription from './pages/Subscription';

// Layouts & Auth
import WorkspaceGate from './pages/WorkspaceGate';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview';
import Residents from './pages/Residents';
import VirtualMap from './pages/VirtualMap';
import Competencies from './pages/Competencies';
import Committee from './pages/Committee';
import Certificates from './pages/Certificates';
import Settings from './pages/Settings';

// A wrapper to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; 
  if (!user) return <Navigate to="/" replace />;
  
  return children;
};

function AppRoutes() {
  const { user, workspace } = useAuth();

  return (
    <Routes>
      {/* 1. Main Landing Page */}
      <Route 
        path="/" 
        element={
          user && workspace 
            ? <Navigate to={`/${workspace.slug}/dashboard`} replace /> 
            : <Landing />
        } 
      />

      {/* 2. Subscriptions Page */}
      <Route 
        path="/subscriptions" 
        element={<Subscription />} 
      />

      {/* 3. The Gate: Ask for Workspace ID */}
      <Route 
        path="/gate" 
        element={
          user && workspace 
            ? <Navigate to={`/${workspace.slug}/dashboard`} replace /> 
            : <WorkspaceGate />
        } 
      />
      
      {/* 4. Tenant-Specific Login Page */}
      <Route 
        path="/:workspaceSlug/login" 
        element={
          user && workspace 
            ? <Navigate to={`/${workspace.slug}/dashboard`} replace /> 
            : <Login />
        } 
      />

      {/* 5. Tenant-Specific Protected Dashboard Routes */}
      <Route 
        path="/:workspaceSlug" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="residents" element={<Residents />} />
        <Route path="map" element={<VirtualMap />} />
        <Route path="competencies" element={<Competencies />} />
        <Route path="committee" element={<Committee />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;