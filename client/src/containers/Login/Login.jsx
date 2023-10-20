import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { setCredentials } from '../../services/auth/authSlice';
import { useLoginUserMutation } from '../../services/auth/authApiSlice';

function Login() {
  const errRef = useRef();

  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const [show, setShow] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const navigate = useNavigate();

  const [loginUser, { isLoading }] = useLoginUserMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailErr('');
    setPasswordErr('');

    if (!email || !password) {
      if (!email) {
        setEmailErr('Email is required');
      }
      if (!password) {
        setPasswordErr('Password is required');
      }
      errRef.current?.focus();
      return;
    }

    try {
      const data = await loginUser({ email, password }).unwrap();
      dispatch(setCredentials(data));
      navigate('/projects');
    } catch (err) {
      if (!err.status) {
        setErrMsg('Something went wrong. Please try again later.');
      } else if (err.status === 401) {
        setErrMsg('Invalid email or password');
      } else {
        setErrMsg('Something went wrong. Please try again later.');
      }
      setShow(true);
      errRef.current?.focus();
    }
  };

  return (
    <div className="Login">
      <Row className="justify-content-md-center" style={{ paddingTop: '20vh' }}>
        <Col md={{ span: 5 }}>
          <h3>Login</h3>
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                isInvalid={!!emailErr}
              />
              <Form.Control.Feedback type="invalid">{emailErr}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                isInvalid={!!passwordErr}
              />
              <Form.Control.Feedback type="invalid">{passwordErr}</Form.Control.Feedback>
            </Form.Group>
            <Button className="mb-3" variant="primary" type="submit" disabled={isLoading}>
              Submit
            </Button>
            {isLoading && <Spinner animation="border" />}
            {errMsg && show && (
              <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                <p ref={errRef}>{errMsg}</p>
              </Alert>
            )}
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
