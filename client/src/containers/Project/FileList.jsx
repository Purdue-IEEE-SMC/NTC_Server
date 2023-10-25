import React, { useState } from 'react';
import { Alert, Button, Spinner, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Download, Trash } from 'react-bootstrap-icons';
import { useCreateFileMutation, useDeleteFileMutation, useGetFilesQuery } from '../../services/files/filesApiSlice';

function FileList({ projectId }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data: files, isLoading, isError, error } = useGetFilesQuery(projectId);
  const [createFile] = useCreateFileMutation();
  const [deleteFile] = useDeleteFileMutation();

  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFiles([...event.target.files]);
    }
  };
  const handleFileUpload = async () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('type', 'data');

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await createFile({ projectId, formData });
    }
  };

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (isError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (files.totalResults > 0) {
    return (
      <section className="files-list">
        <h1>Files List</h1>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.results?.map((file) => (
              <tr key={file._id}>
                <td>{file.filename}</td>
                <td>{file.length}</td>
                <td>{file.metadata.type}</td>
                <td>
                  <a download href={`/api/v1/projects/${projectId}/files/${file.filename}`}>
                    <Download />
                  </a>
                  <button
                    type="submit"
                    onClick={() => deleteFile({ projectId, filename: file.filename })}
                    className="mx-2"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div>
          <input type="file" multiple onChange={handleFileChange} />
          <Button onClick={handleFileUpload}>Upload</Button>
        </div>
      </section>
    );
  }

  return <p>No files were found...</p>;
}

FileList.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default FileList;
