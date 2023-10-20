import React from 'react';
import { Container } from 'react-bootstrap';

import AppRoutes from './routes';

function App() {
  return (
    <div className="App">
      <Container className="mt-4">
        <AppRoutes />
      </Container>
    </div>
  );
}

export default App;
