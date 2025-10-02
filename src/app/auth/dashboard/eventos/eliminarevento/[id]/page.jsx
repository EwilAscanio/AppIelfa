import axios from "axios";
import {
  LuCalendar, // Icono para fecha
  LuArrowRight, // Aunque no se usa directamente en el botón de eliminar, se mantiene por si el componente EliminarEvento lo usa o como referencia del diseño base
  LuFileText, // Icono para nombre y descripción
  LuTag, // Icono para código
  LuChevronDown, // Icono para select
  LuLoader2, // Icono de carga (para la carga inicial)
} from "react-icons/lu";
// Importa el componente para eliminar evento (asumimos que lo crearás)
import EliminarEvento from "@/components/EliminarEvento";

// Función para cargar los datos del evento
const loadEvent = async (id) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${id}` // Endpoint para obtener evento
    );
    return data;
  } catch (error) {
    console.error("Error loading event:", error); // Mensaje de error
    // Puedes manejar el error aquí, por ejemplo, redirigir o mostrar un mensaje
    return null; // Retorna null si no se pudo cargar el evento
  }
};

// Función para formatear la fecha a YYYY-MM-DD (para mostrarla correctamente en el input type="date")
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
   if (isNaN(date.getTime())) {
      console.error("Invalid date string for formatting:", dateString);
      return "Fecha inválida";
    }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DeleteEvent = async ({ params }) => {
   console.log("params", params);
   console.log("params.id", params.id);

  const event = await loadEvent(params.id); // Cargar datos del evento

  // Si el evento no se pudo cargar
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* Centrado */}
        <div className="flex flex-col items-center">
           <p className="mt-4 text-red-600 text-lg">Error al cargar los datos del evento.</p> {/* Mensaje de error en rojo */}
        </div>
      </div>
    );
  }

  // Clases base para los inputs/selects, adaptadas para ser de solo lectura
  const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed text-gray-700";

  return (
    // Contenedor principal con el diseño de la página
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100">

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados */}
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full mx-auto">
        {/* Título y subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Eliminar Evento
          </h1>
          <p className="text-gray-600 text-sm">
            Datos del evento a eliminar
          </p>
        </div>

        {/* Formulario - Campos de solo lectura */}
        <form>
          {/* Inicio del Grid para campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3"> {/* Ajustado a md:gap-3 para consistencia */}

            {/* Campo CODIGO_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Código del Evento
               </label>
              <div className="relative">
                <LuTag // Icono para código
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={event.codigo_eve} // Mostrar código del evento
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo NOMBRE_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Nombre del Evento
               </label>
              <div className="relative">
                <LuFileText // Icono para nombre
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={event.nombre_eve} // Mostrar nombre del evento
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo FECHA_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Fecha del Evento
               </label>
              <div className="relative">
                <LuCalendar // Icono para fecha
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date" // Usar type="date" para consistencia visual
                  defaultValue={formatDate(event.fecha_eve)} // Mostrar fecha formateada
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo DESCRIPCION_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Descripción del Evento
               </label>
              <div className="relative">
                <LuFileText // Icono para descripción
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={event.descripcion_eve} // Mostrar descripción del evento
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo STATUS_EVE - Ocupa una columna */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Estado
               </label>
              <div className="relative">
                <select
                  className={`${baseInputClass} appearance-none pr-10`}
                  defaultValue={event.status_eve} // Mostrar estado del evento
                  disabled // Deshabilitar el select
                >
                  {/* Opciones basadas en el valor del evento */}
                  <option value={event.status_eve}>
                    {event.status_eve}
                  </option>
                   {/* Si quieres mostrar todas las opciones deshabilitadas: */}
                  {/* <option value="" disabled>Seleccione un Estado</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option> */}
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

          </div> {/* Fin del grid */}

          {/* Botón de Eliminar - Fuera del grid */}
          <div className="mt-6">
            {/* Componente para manejar la eliminación */}
            <EliminarEvento
              // Clases adaptadas para el botón de eliminar (rojo)
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center text-lg font-semibold"
              event_id={params.id} // Pasar el ID del evento al componente de eliminación
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteEvent;