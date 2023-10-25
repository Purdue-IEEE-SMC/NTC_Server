import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Form } from 'react-bootstrap';
import { useCreateFileMutation } from '../../services/files/filesApiSlice';

FileUpload.propTypes = {
  projectId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

function FileUpload({ projectId, type }) {
  const [createFile, { isSuccess, isError, error }] = useCreateFileMutation();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const uploadRef = useRef();

  const handleFileUpload = async () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('type', type);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await createFile({ projectId, formData });
    }

    setSelectedFiles([]);
    uploadRef.current.value = null;
  };

  const handleFileChange = (event) => {
    if (event.target.files) {
      setSelectedFiles([...event.target.files]);
    }
  };

  return (
    <>
      <Form.Group controlId="formFileMultiple" className="mb-3">
        <Form.Label>Upload Files</Form.Label>
        <Form.Control ref={uploadRef} type="file" multiple onChange={handleFileChange} />
      </Form.Group>
      <Button className="mb-3" onClick={handleFileUpload}>
        Upload
      </Button>
      {isSuccess && <Alert variant="info">File(s) uploaded successfully.</Alert>}
      {isError && <Alert variant="danger">Error: {error.data}</Alert>}
    </>
  );
}

export default FileUpload;
