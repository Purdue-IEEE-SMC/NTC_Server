import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Col, Row } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ProjectsList from './ProjectsList';
import { selectUserRole } from '../../services/auth/authSlice';
import CreateProject from './CreateProject';

function ProjectsPage() {
  const role = useSelector(selectUserRole);

  return (
    <div>
      <h1>Projects</h1>
      {role === 'admin' && (
        <Row>
          <Col>
            <CreateProject />
          </Col>

          <Col>
            <div className="float-end">
              <LinkContainer to="/admin">
                <Button variant="secondary">Admin portal</Button>
              </LinkContainer>
            </div>
          </Col>
        </Row>
      )}
      <ProjectsList />
    </div>
  );
}

export default ProjectsPage;
