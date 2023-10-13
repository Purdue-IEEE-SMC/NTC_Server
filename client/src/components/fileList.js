import React, { useEffect, useState } from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';

function FileList() {
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/files');
        const data = await response.json();
        setFiles(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="FileList">
        <h3>File List</h3>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="FileList">
        <h3>File List</h3>
        <Alert variant="danger">An unknown error occurred while loading files.</Alert>
      </div>
    );
  }

  if (files.results.length > 0) {
    return (
      <div className="FileList">
        <h3>File List</h3>
        <Table hover>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.results.map((file) => (
              <tr key={file.id}>
                <td>{file.filename}</td>
                <td>{file.owner}</td>
                <td>{file.size}</td>
                <td>temp</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  return (
    <div className="FileList">
      <h3>File List</h3>
      <Alert variant="info">No files found.</Alert>
    </div>
  );
}

export default FileList;
