import React from 'react';
import UserList from './UserList';
import CreateUser from './CreateUser';

function AdminPage() {
  return (
    <div>
      <h1>Admin Portal</h1>
      <h3>Users</h3>
      <CreateUser />
      <UserList />
    </div>
  );
}

export default AdminPage;
