import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Main application layout with navbar and content area.
 */
export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container py-3">
        <Outlet />
      </main>
    </>
  );
}
