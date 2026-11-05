import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const roleDashboardMap = {
  admin: '/admin',
  mess1: '/mess1',
  mess2: '/mess2',
  student: '/student'
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader message="Verifying session..." />
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role -> redirect to own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const ownDashboard = roleDashboardMap[user.role] || '/login';
    return <Navigate to={ownDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;

