import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import RequireUnauth from '../services/auth/RequireUnauth';
import RequireAuth from '../services/auth/RequireAuth';
import RequireAdmin from '../services/auth/RequireAdmin';

import Home from '../containers/Home/Home';
import Login from '../containers/Login/Login';
import Project from '../containers/Project/Project';
import NotFound from '../containers/NotFound/NotFound';
import ProjectsPage from '../containers/ProjectsList/ProjectsPage';
import AdminPage from '../containers/Admin/AdminPage';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />} />
        <Route element={<RequireUnauth />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<Project />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;
