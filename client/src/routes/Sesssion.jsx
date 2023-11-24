import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from '../containers/Navbar/Navbar';

function Session() {
  return (
    <>
      <Navbar />
      <Container className="mt-2">
        <Outlet />
      </Container>
    </>
  );
}
export default Session;
