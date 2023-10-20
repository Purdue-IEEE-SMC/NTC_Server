import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import ProjectsList from '../pages/ProjectsList/ProjectsList';
import Project from '../pages/Project/Project';
import NotFound from '../pages/NotFound/NotFound';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:projectId" element={<Project />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
