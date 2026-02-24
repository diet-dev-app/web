import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
export default function NotFoundPage() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-center">
      <h1 className="display-1">404</h1>
      <p className="lead">Página no encontrada</p>
      <Link to="/" className="btn btn-success mt-3">
        Volver al inicio
      </Link>
    </div>
  );
}
