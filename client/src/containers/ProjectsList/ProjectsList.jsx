import React from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { useGetProjectsQuery } from '../../services/project/projectApiSlice';

function ProjectsList() {
  const [page, setPage] = React.useState(1);
  const { data: projects, isLoading, isError, error } = useGetProjectsQuery({ params: { page } });

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
              <th>Name</th>
              <th>Data files</th>
              <th>Model files</th>
            </tr>
          </thead>
          <tbody>
            {projects.results?.map((project) => (
              <tr key={project.id}>
                <td>
                  <Link to={`/projects/${project.id}`}>{project.name}</Link>
                </td>
                <td>{project.dataFileCount}</td>
                <td>{project.modelFileCount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {projects.totalPages > 1 && (
          <PaginationControl
            total={projects.totalResults}
            limit={projects.limit}
            page={page}
            changePage={(num) => setPage(num)}
          ></PaginationControl>
        )}
      </section>
    );
  }

  return <p>No projects were found...</p>;
}

export default ProjectsList;
