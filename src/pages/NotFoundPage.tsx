import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-bold text-slate-200">404</h1>
      <p className="text-xl text-slate-600 mt-2 mb-6">Página no encontrada</p>
      <Link
        to="/"
        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
