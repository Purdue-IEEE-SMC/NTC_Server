import React from 'react';
import { useParams } from 'react-router-dom';
import FileList from './FileList';

function Project() {
  const { projectId } = useParams();

  return (
    <div>
      <FileList projectId={projectId} />
    </div>
  );
}

export default Project;
