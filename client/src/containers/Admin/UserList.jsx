import React, { useState } from 'react';
import { Alert, Button, Modal, Spinner, Table } from 'react-bootstrap';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { Trash } from 'react-bootstrap-icons';
import { useGetUsersQuery, useDeleteUserMutation } from '../../services/user/userApiSlice';

function UserList() {
  const [page, setPage] = React.useState(1);
  const { data: users, isLoading, isError, error } = useGetUsersQuery({ params: { page } });
  const [deleteUser] = useDeleteUserMutation();

  const [show, setShow] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleDeleteUser = (username) => {
    setToDelete(username);
    setShow(true);
  };

  const handleConfirmDelete = async () => {
    await deleteUser(toDelete);
    setShow(false);
    setToDelete(null);
  };

  if (isLoading) {
    return <Spinner animation="border" role="status" />;
  }

  if (isError) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (users.totalResults > 0) {
    return (
      <section className="users-list">
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Body>
            <p>Are you sure you would like to delete this user?</p>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="mx-1" onClick={() => setShow(false)}>
                Close
              </Button>
              <Button variant="danger" className="mx-1" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.results?.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isEmailVerified ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    className="mx-1 action-button delete-button"
                    type="submit"
                    onClick={() => handleDeleteUser(user.id)}
                    aria-label="Delete user"
                  >
                    <Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {users.totalPages > 1 && (
          <PaginationControl
            total={users.totalResults}
            limit={users.limit}
            page={page}
            changePage={(num) => setPage(num)}
          ></PaginationControl>
        )}
      </section>
    );
  }

  return <p>No users were found...</p>;
}

export default UserList;
