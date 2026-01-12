import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200">404</h1>
        
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          ¡Ups! Página no encontrada.
        </p>
        <p className="mt-4 text-gray-500">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;