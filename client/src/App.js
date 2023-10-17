import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Projects from './pages/Projects';
import List from './pages/List';

function App() {
  return (
    <div className="App">
      <Container className="mt-4">
        <Router>
          <Routes>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<List />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Container>
    </div>
  );
}

export default App;
