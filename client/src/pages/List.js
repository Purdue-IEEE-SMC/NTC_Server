import React from 'react';
import { useParams } from 'react-router-dom';
import FileList from '../components/FileList';

function List() {
  const projectId = useParams();

  return (
    <div className="Home">
      <h1>Files</h1>
      <FileList projectId={projectId} />
    </div>
  );
}

export default List;
