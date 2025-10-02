import { RiLoader2Line } from "react-icons/ri";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <RiLoader2Line className="animate-spin text-primary" size={50} />
        <p className="mt-4 text-gray-600 text-lg">Cargando datos...</p>
      </div>
    </div>
  );
}
