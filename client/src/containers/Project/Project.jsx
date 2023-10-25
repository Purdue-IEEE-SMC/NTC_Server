import React from 'react';
import { useParams } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import FileList from './FileList';
import FileUpload from './FileUpload';

function Project() {
  const { projectId } = useParams();

  return (
    <div>
      <Row>
        <Col>
          <h3>Data</h3>
          <FileList projectId={projectId} type="data" />
          <FileUpload projectId={projectId} type="data" />
        </Col>
        <Col>
          <h3>Models</h3>
          <FileList projectId={projectId} type="model" />
          <FileUpload projectId={projectId} type="model" />
        </Col>
      </Row>
    </div>
  );
}

export default Project;
