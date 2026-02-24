import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserDropdown from '@/components/UserDropdown/UserDropdown';

/**
 * Application navigation bar.
 */
export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          🥗 Diet App
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/calendar">
                📅 Calendario
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meals">
                🍽️ Comidas
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/meal-options">
                ⚙️ Opciones
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/shopping-list">
                🛒 Lista de compra
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/help">
                ❓ Ayuda
              </NavLink>
            </li>
          </ul>

          {isAuthenticated && <UserDropdown />}
        </div>
      </div>
    </nav>
  );
}
