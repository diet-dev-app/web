import { NavLink } from 'react-router-dom';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';

interface UserDropdownProps {
  /** When true, renders as a simple vertical list (no floating panel) for mobile nav. */
  mobile?: boolean;
  /** Called after a navigation action (mobile only). */
  onNavigate?: () => void;
}

/**
 * User dropdown in the navbar.
 * Desktop: Headless UI Menu floating panel.
 * Mobile: Inline vertical list.
 */
export default function UserDropdown({ mobile = false, onNavigate }: UserDropdownProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  const displayName = user.name ?? user.email;

  if (mobile) {
    return (
      <div className="flex flex-col gap-1 px-1">
        <NavLink
          to="/profile"
          onClick={onNavigate}
          className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          👤 Perfil ({displayName})
        </NavLink>
        <button
          type="button"
          onClick={() => { logout(); onNavigate?.(); }}
          className="text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-700 transition-colors"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-white transition-colors">
        <span>{displayName}</span>
        <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 focus:outline-none"
      >
        <MenuItem>
          <NavLink
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full data-[focus]:bg-slate-50"
          >
            👤 Perfil
          </NavLink>
        </MenuItem>
        <div className="my-1 border-t border-slate-100" />
        <MenuItem>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left data-[focus]:bg-red-50"
          >
            🚪 Cerrar sesión
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
