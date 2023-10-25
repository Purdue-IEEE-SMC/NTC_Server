import React from 'react';
import { useSelector } from 'react-redux';
import ProjectsList from './ProjectsList';
import { selectUserRole } from '../../services/auth/authSlice';
import CreateProject from './CreateProject';

function ProjectsPage() {
  const role = useSelector(selectUserRole);

  return (
    <div>
      <h1>Projects</h1>
      {role === 'admin' && <CreateProject />}
      <ProjectsList />
    </div>
  );
}

export default ProjectsPage;
