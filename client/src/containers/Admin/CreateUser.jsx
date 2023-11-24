import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useCreateUserMutation } from '../../services/user/userApiSlice';

function CreateUser() {
  const [createUser, { isError, error, isLoading, isSuccess }] = useCreateUserMutation();
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [admin, setAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyPasswordErr, setVerifyPasswordErr] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      if (!name) {
        setNameErr('Name must not be empty');
        return;
      }
      if (!email) {
        setEmailErr('Email must not be empty');
        return;
      }
      if (!password) {
        setPasswordErr('Password must not be empty');
        return;
      }
    }
    if (password !== verifyPassword) {
      setVerifyPasswordErr('Passwords do not match');
      return;
    }
    const role = admin ? 'admin' : 'user';
    await createUser({ name, email, role, password });
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

  const handleEmailChange = (e) => {
    if (!e.target.value) {
      setEmailErr('Email must not be empty');
    } else {
      setEmailErr('');
    }
    setEmail(e.target.value);
  };

  const handleRoleChange = (e) => {
    setAdmin(e.target.checked);
  };

  const handlePasswordChange = (e) => {
    if (!e.target.value) {
      setPasswordErr('Password must not be empty');
    } else {
      setPasswordErr('');
    }
    setPassword(e.target.value);
  };

  const handleVerifyPasswordChange = (e) => {
    if (e.target.value !== password) {
      setVerifyPasswordErr('Passwords must match');
    } else {
      setVerifyPasswordErr('');
    }
    setVerifyPassword(e.target.value);
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setShow(true)}>
        Create User
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group className="mb-3" controlId="formUserName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                isInvalid={!!nameErr}
                type="text"
                placeholder="Full Name"
                onChange={handleNameChange}
                required
              />
              <Form.Control.Feedback type="invalid">{nameErr}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserEmail">
              <Form.Label>Purdue Email</Form.Label>
              <Form.Control
                isInvalid={!!emailErr}
                type="email"
                placeholder="example@purdue.edu"
                onChange={handleEmailChange}
                required
              />
              <Form.Control.Feedback type="invalid">{emailErr}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserRole">
              <Form.Label>Permissions</Form.Label>
              <Form.Check type="checkbox" id="admin-switch" label="Admin" onChange={handleRoleChange} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserPassword">
              <Form.Label>User Password</Form.Label>
              <Form.Control
                isInvalid={!!passwordErr}
                type="password"
                placeholder="Enter user password"
                onChange={handlePasswordChange}
                required
              />
              <Form.Control.Feedback type="invalid">{passwordErr}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formUserVerifyPassword">
              <Form.Label>Verify Password</Form.Label>
              <Form.Control
                isInvalid={!!verifyPasswordErr}
                type="password"
                placeholder="password"
                onChange={handleVerifyPasswordChange}
                required
              />
              <Form.Control.Feedback type="invalid">{verifyPasswordErr}</Form.Control.Feedback>
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

export default CreateUser;
