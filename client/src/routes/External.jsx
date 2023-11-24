import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';

function External() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
export default External;
