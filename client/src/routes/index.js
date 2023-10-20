import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import RequireUnauth from '../services/auth/RequireUnauth';

import Home from '../containers/Home/Home';
import Login from '../containers/Login/Login';
import ProjectsList from '../containers/ProjectsList/ProjectsList';
import Project from '../containers/Project/Project';
import NotFound from '../containers/NotFound/NotFound';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />} />
        <Route element={<RequireUnauth />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:projectId" element={<Project />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
