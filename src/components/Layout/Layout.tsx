import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Main application layout with navbar and content area.
 */
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}
