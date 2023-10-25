import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useCreateFileMutation } from '../../services/files/filesApiSlice';

FileUpload.propTypes = {
  projectId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

function FileUpload({ projectId, type }) {
  const [createFile, { isSuccess, isError, error, isLoading }] = useCreateFileMutation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFileError, setIsFileError] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const uploadRef = useRef();

  const handleFileUpload = async () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('type', type);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await createFile({ projectId, formData });
    } else {
      setIsFileError(true);
    }

    setSelectedFiles([]);
    uploadRef.current.value = null;
    setIsModified(false);
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setIsFileError(false);
      setSelectedFiles([...event.target.files]);
      setIsModified(true);
    }
  };

  return (
    <>
      <Form.Group controlId="formFileMultiple" className="mb-3">
        <Form.Label>Upload Files</Form.Label>
        <Form.Control
          isValid={isSuccess && !isModified}
          isInvalid={isFileError}
          ref={uploadRef}
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <Form.Control.Feedback type="invalid">File is required</Form.Control.Feedback>
        <Form.Control.Feedback type="valid">Files uploaded successfully</Form.Control.Feedback>
      </Form.Group>
      <Button disabled={isLoading} className="mb-3" onClick={handleFileUpload}>
        Upload
      </Button>
      {isLoading && <Spinner animation="border" role="status" />}
      {isError && <Alert variant="danger">Error: {error.data}</Alert>}
    </>
  );
}

export default FileUpload;
