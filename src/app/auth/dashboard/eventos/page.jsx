import axios from "axios";
import Link from "next/link";

/**
 * Formatea una cadena de fecha (ej. de la BD) a un formato DD-MM-YYYY.
 * @param {string} dateString - La fecha en formato de cadena.
 * @returns {string} - La fecha formateada o un texto indicando invalidez/ausencia.
 */
const formatDate = (dateString) => {
  if (!dateString) return "Fecha no disponible"; // Manejar fechas nulas o vacías
  const date = new Date(dateString);
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
      return "Fecha inválida";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses son 0-indexados
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}-${month}-${year}`;
};

const loadEventos = async () => {
  try {
    // En Componentes de Servidor, siempre usa la URL absoluta para las llamadas a la API.
    // Esto funciona tanto en desarrollo como en producción.
    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento`);
    return data;
  } catch (error) {
    console.error("Error loading events:", error);
    return [];
  }
};

const EventosPage = async () => {
  const eventos = await loadEventos();

  const EventFormat = eventos.map((evento) => ({
    ...evento,
    // Asegurarse de que evento.fecha_eve exista antes de formatear
    fecha_eve: evento.fecha_eve ? formatDate(evento.fecha_eve) : "Fecha no especificada",
  }));

  return (
    <div className="container mx-auto px-4"> {/* Contenedor principal centrado y con padding */}
      {/* Encabezado con Título y Botón */}
      <div className="flex justify-between items-center mb-6"> {/* Flexbox para alinear título y botón */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800"> {/* Título más prominente */}
            Lista de Eventos
          </h1>
          {/* Añadido el conteo de eventos, similar a la página de usuarios */}
          <p className="mt-2 text-sm text-gray-500">
            Total registrados: {eventos.length}
          </p>
        </div>
        <Link
          href={"/auth/dashboard/eventos/registrarevento"}
          // Aplicando estilos del botón "Crear Usuario"
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Crear Evento
        </Link>
      </div>

      {/* Contenedor de la tabla con sombra y bordes redondeados */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Asegura scroll horizontal en pantallas pequeñas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100"> 
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {EventFormat.length > 0 ? (
                EventFormat.map((evento) => (
                  <tr key={evento.codigo_eve} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{evento.codigo_eve}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{evento.nombre_eve}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">{evento.fecha_eve}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{evento.descripcion_eve}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                       <span className={`py-1 px-3 rounded-full text-xs ${evento.status_eve === 'Activo' ? 'bg-green-200 text-green-600' : 'bg-red-200 text-red-600'}`}> 
                        
                          {evento.status_eve}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> 
                      <div className="inline-flex"> 
                       
                        <Link href={`/auth/dashboard/eventos/actualizarevento/${evento.codigo_eve}`} passHref>
                          
                          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2 transition duration-200">
                            Actualizar
                          </button>
                        </Link>
                        
                        <Link href={`/auth/dashboard/eventos/eliminarevento/${evento.codigo_eve}`} passHref>
                          
                          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200">
                            Eliminar
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500"> 
                    No hay eventos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventosPage;