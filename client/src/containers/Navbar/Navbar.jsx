import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Nav, Navbar as BootstrapBar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import {
  selectRefreshToken,
  selectUserName,
  selectUserRole,
  logout as logoutAction,
} from '../../services/auth/authSlice';
import { useLogoutUserMutation } from '../../services/auth/authApiSlice';
import './Navbar.scss';

function Navbar() {
  const name = useSelector(selectUserName);
  const role = useSelector(selectUserRole);
  const refreshToken = useSelector(selectRefreshToken);

  const [logout, { isLoading }] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout(refreshToken);
    dispatch(logoutAction());
    navigate('/');
  };

  return (
    <BootstrapBar bg="dark" className="navbar">
      <Container>
        {location.key !== 'default' && (
          <Nav>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
          </Nav>
        )}
        <BootstrapBar.Collapse className="justify-content-end">
          <Nav>
            <BootstrapBar.Text className="mx-3">
              Logged in as {name || 'guest'}
              {role === 'admin' ? ' (Admin)' : ''}.
            </BootstrapBar.Text>
            {name ? (
              <Button variant="warning" onClick={handleLogout} disabled={isLoading}>
                Logout
              </Button>
            ) : (
              <LinkContainer to="/login">
                <Button>Login</Button>
              </LinkContainer>
            )}
          </Nav>
        </BootstrapBar.Collapse>
      </Container>
    </BootstrapBar>
  );
}
export default Navbar;
