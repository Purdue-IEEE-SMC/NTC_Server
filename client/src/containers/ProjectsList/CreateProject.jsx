import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useCreateProjectMutation } from '../../services/project/projectApiSlice';

function CreateProject() {
  const [createProject, { isError, error, isLoading, isSuccess }] = useCreateProjectMutation();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');

  const handleSubmit = async () => {
    if (!name) {
      setNameErr('Name must not be empty');
      return;
    }
    await createProject({ name });
  };

  useEffect(() => {
    setShow(false);
  }, [isSuccess]);

  const handleNameChange = (e) => {
    if (!e.target.value) {
      setNameErr('Name must not be empty');
    } else {
      setNameErr('');
    }
    setName(e.target.value);
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShow(true)}>
        Create Project
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formProjectName">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                isInvalid={!!nameErr}
                type="text"
                placeholder="Enter project name"
                onChange={handleNameChange}
              />
              <Form.Control.Feedback type="invalid">{nameErr}</Form.Control.Feedback>
            </Form.Group>
          </Form>
          {isError && <Alert variant="danger">Error: {error?.data?.message}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          {isLoading && <Spinner animation="border" role="status" />}
          <Button variant="primary" type="submit" disabled={isLoading} onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CreateProject;
