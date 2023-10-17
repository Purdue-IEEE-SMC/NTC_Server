import React from 'react';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function Home() {
  return (
    <div className="Home d-flex justify-content-center cssanimation fade-in-bottom" style={{ paddingTop: '20vh' }}>
      <div className="text-center">
        <div className="image-container"></div>
        <h1 className="display-5 fw-bold">NTC Server</h1>
        <div className="mx-auto mt-4">
          <div className="d-grid gap-2 mb-5">
            <LinkContainer to="/login">
              <Button variant="primary btn-lg px-4" style={{ width: '200px' }}>
                Log In
              </Button>
            </LinkContainer>
            <LinkContainer to="/projects">
              <Button variant="outline-secondary btn-lg px-4" style={{ width: '200px' }}>
                Enter as Guest
              </Button>
            </LinkContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
