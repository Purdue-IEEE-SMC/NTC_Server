import React from 'react';
import { Container } from 'react-bootstrap';
import FileList from '../components/fileList';

function Home() {
  return (
    <div className="Home">
      <Container>
        <h1>Home</h1>
        <FileList />
      </Container>
    </div>
  );
}

export default Home;
