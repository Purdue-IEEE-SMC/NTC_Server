import React, { useState } from 'react';
import { Alert, Button, Modal, Spinner, Table } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Download, Trash } from 'react-bootstrap-icons';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { useDeleteFileMutation, useGetFilesQuery } from '../../services/files/filesApiSlice';
import './FileList.scss';
import humanFileSize from '../../utils/humanFileSize';

FileList.propTypes = {
  projectId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

function FileList({ projectId, type }) {
  const [page, setPage] = useState(1);
  const { data: files, isLoading, isError, error } = useGetFilesQuery({ projectId, params: { type, page } });
  const [deleteFile] = useDeleteFileMutation();

  const [show, setShow] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleDeleteFile = (filename) => {
    setToDelete(filename);
    setShow(true);
  };

  const handleConfirmDelete = async () => {
    await deleteFile({ projectId, filename: toDelete });
    setShow(false);
    setToDelete(null);
  };

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (isError) {
    return <Alert variant="danger">Error: {error?.data?.message}</Alert>;
  }

  if (files?.results && files.totalResults > 0) {
    return (
      <section className="files-list">
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Body>
            <p>Are you sure you would like to delete this file?</p>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="mx-1" onClick={() => setShow(false)}>
                Close
              </Button>
              <Button variant="danger" className="mx-1" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.results?.map((file) => (
              <tr key={file._id}>
                <td>{file.filename}</td>
                <td>{humanFileSize(file.length)}</td>
                <td>
                  <a download href={`/api/v1/projects/${projectId}/files/${file.filename}`}>
                    <button className="mx-1 action-button download-button" type="submit" aria-label="Download">
                      <Download />
                    </button>
                  </a>
                  <button
                    className="mx-1 action-button delete-button"
                    type="submit"
                    onClick={() => handleDeleteFile(file.filename)}
                    aria-label="Delete"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p>Total files: {files.totalResults}</p>
        {files.totalPages > 1 && (
          <PaginationControl
            total={files.totalResults}
            limit={files.limit}
            page={page}
            changePage={(num) => setPage(num)}
          ></PaginationControl>
        )}
      </section>
    );
  }

  return <p>No files were found...</p>;
}

export default FileList;
