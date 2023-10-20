import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectAccessToken } from './authSlice';

function RequireUnauth() {
  const token = useSelector(selectAccessToken);
  const location = useLocation();

  return !token ? <Outlet /> : <Navigate to="/projects" state={{ from: location }} replace />;
}
export default RequireUnauth;
