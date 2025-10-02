"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react"; // 1. Importar Suspense
import Link from "next/link";
import { FaExclamationTriangle, FaSignInAlt } from "react-icons/fa";

const errorMessages = {
  Configuration: "Hay un problema con la configuración del servidor. Por favor, contacta al administrador.",
  AccessDenied: "No tienes permiso para acceder a esta página. Por favor, inicia sesión con una cuenta autorizada.",
  Verification: "El token de enlace mágico ha expirado o ya ha sido utilizado.",
  Default: "Ha ocurrido un error. Por favor, intenta de nuevo.",
};

// 2. Mover la lógica que usa el hook a un componente hijo
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Obtiene el mensaje de error correspondiente o uno por defecto
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg text-center">
      <div className="flex justify-center">
        <FaExclamationTriangle className="text-red-500 text-5xl" />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Acceso Denegado</h1>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>

      <div className="mt-6">
        <Link href="/auth/login" passHref>
          <button className="w-full flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 bg-primary hover:bg-primary-hover">
            <FaSignInAlt className="mr-3" />
            Volver al Inicio de Sesión
          </button>
        </Link>
      </div>
    </div>
  );
}

// 3. El componente de la página ahora envuelve el contenido en <Suspense>
export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Suspense
        fallback={
          <div className="text-center">
            <p>Cargando...</p>
          </div>
        }
      >
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
