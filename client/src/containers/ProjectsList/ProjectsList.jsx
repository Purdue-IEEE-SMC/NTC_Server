import React from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import { useGetProjectsQuery } from '../../services/project/projectApiSlice';

function ProjectsList() {
  const { data: projects, isLoading, isSuccess, isError, error } = useGetProjectsQuery();

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (isError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (isSuccess && projects.totalResults > 0) {
    return (
      <section className="projects-list">
        <h1>Projects List</h1>
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
                <td>{project.name}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    );
  }

  return <p>no clue what happened</p>;
}

export default ProjectsList;
