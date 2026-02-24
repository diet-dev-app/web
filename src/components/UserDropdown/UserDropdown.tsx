import { NavLink } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';

/**
 * User dropdown in the navbar.
 * Shows user name/email with profile link and logout button.
 */
export default function UserDropdown() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = user.name ?? user.email;

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="outline-light" size="sm">
        {displayName}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item as={NavLink} to="/profile">
          👤 Perfil
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={logout} className="text-danger">
          🚪 Cerrar sesión
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
