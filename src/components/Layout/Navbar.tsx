import { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserDropdown from '@/components/UserDropdown/UserDropdown';

/**
 * Application navigation bar.
 * Custom implementation with React state for mobile menu toggle (no Bootstrap JS needed).
 */
export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /** Collapse the menu when a navigation link is clicked (mobile UX). */
  const collapseMenu = useCallback(() => setMenuOpen(false), []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`;

  return (
    <nav className="bg-slate-900 sticky top-0 z-30 shadow-md backdrop-blur">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <NavLink
            to="/"
            className="text-white font-bold text-lg hover:text-green-400 transition-colors"
            onClick={collapseMenu}
          >
            🥗 Diet App
          </NavLink>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/calendar" className={navLinkClass} onClick={collapseMenu}>📅 Calendario</NavLink>
            <NavLink to="/meals" className={navLinkClass} onClick={collapseMenu}>🍽️ Comidas</NavLink>
            <NavLink to="/meal-options" className={navLinkClass} onClick={collapseMenu}>⚙️ Opciones</NavLink>
            <NavLink to="/shopping-list" className={navLinkClass} onClick={collapseMenu}>🛒 Lista de compra</NavLink>
            <NavLink to="/help" className={navLinkClass} onClick={collapseMenu}>❓ Ayuda</NavLink>
          </div>

          {/* Right side — desktop */}
          <div className="hidden lg:flex items-center">
            {isAuthenticated && <UserDropdown />}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700 py-2 flex flex-col gap-1">
            <NavLink to="/calendar" className={navLinkClass} onClick={collapseMenu}>📅 Calendario</NavLink>
            <NavLink to="/meals" className={navLinkClass} onClick={collapseMenu}>🍽️ Comidas</NavLink>
            <NavLink to="/meal-options" className={navLinkClass} onClick={collapseMenu}>⚙️ Opciones</NavLink>
            <NavLink to="/shopping-list" className={navLinkClass} onClick={collapseMenu}>🛒 Lista de compra</NavLink>
            <NavLink to="/help" className={navLinkClass} onClick={collapseMenu}>❓ Ayuda</NavLink>
            {isAuthenticated && (
              <div className="pt-1 border-t border-slate-700">
                <UserDropdown mobile onNavigate={collapseMenu} />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
