import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectUserRole } from './authSlice';

function RequireAdmin() {
  const role = useSelector(selectUserRole);
  const location = useLocation();

  return role === 'admin' ? <Outlet /> : <Navigate to="/projects" state={{ from: location }} replace />;
}
export default RequireAdmin;
