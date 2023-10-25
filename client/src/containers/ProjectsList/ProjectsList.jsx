import React from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetProjectsQuery } from '../../services/project/projectApiSlice';

function ProjectsList() {
  const { data: projects, isLoading, isError, error } = useGetProjectsQuery();

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (isError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (projects.totalResults > 0) {
    return (
      <section className="projects-list">
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {projects.results?.map((project) => (
              <tr key={project.id}>
                <td>{project.id}</td>
                <td>
                  <Link to={`/projects/${project.id}`}>{project.name}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    );
  }

  return <p>No projects were found...</p>;
}

export default ProjectsList;
