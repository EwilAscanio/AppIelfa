import axios from "axios";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuCalendar,
  LuChevronDown, // Necesario para el select
} from "react-icons/lu";
import { PiGenderMaleBold } from "react-icons/pi";
import { GoPersonAdd } from "react-icons/go";
import { MdNumbers } from "react-icons/md";
import EliminarMiembro from "@/components/EliminarMiembro"; // Asegúrate de que la ruta sea correcta

import { FaDirections } from "react-icons/fa";

// Clase base para los estilos de los inputs y select (readOnly/disabled)
const baseInputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700"; 

const loadMiembro = async (id) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/miembro/${id}`
    );

    // Convertir la fecha de nacimiento al formato requerido por el input date
    if (data.fechanacimiento_mie) {
      const date = new Date(data.fechanacimiento_mie);
      data.fechanacimiento_mie = date.toISOString().split('T')[0];
    }

    return data;
  } catch (error) {
    console.error("Error loading member data:", error);
    
    return null; 
  }
};

const DeleteMiembro = async ({ params }) => {
  const miembro = await loadMiembro(params.id);

  if (!miembro) {
    // Manejar el caso en que el miembro no se encontró o hubo un error al cargar
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        Error al cargar los datos del miembro o miembro no encontrado.
      </div>
    );
  }

  return (
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100"> {/* Ajustado a justify-center para centrar */}

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados, más ancho */}
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-4xl w-full mx-auto"> {/* Ajustado padding y max-w */}
        {/* Título y subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Eliminar Miembro
          </h1>
          <p className="text-gray-600 text-sm">
            Datos del miembro a eliminar
          </p>
        </div>

        {/* Formulario - Los campos son de solo lectura */}
        {/* No se necesita onSubmit en el form ya que la acción la maneja el componente EliminarMiembro */}
        <form>
          {/* Inicio del Grid para campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"> {/* Ajustado gap */}

            {/* Campo nombre_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <LuUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={miembro.nombre_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo cedula_mie */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula de Identidad
              </label>
              <div className="relative">
                <MdNumbers
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={miembro.cedula_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo direccion_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección de Residencia
              </label>
              <div className="relative">
                <FaDirections
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={miembro.direccion_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo telefono_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono
              </label>
              <div className="relative">
                <LuPhone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  defaultValue={miembro.telefono_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo fechanacimiento_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  defaultValue={miembro.fechanacimiento_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo edad_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <div className="relative">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  defaultValue={miembro.edad_actual}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo sexo_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <div className="relative">
                <PiGenderMaleBold
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  size={20}
                />
                 <select
                  className={`${baseInputClass} appearance-none pr-10`} // Mantener appearance-none y pr-10 para la flecha
                  defaultValue={miembro.sexo_mie}
                  disabled // Deshabilitar el select
                >
                  {/* Renderiza la opción basada en el valor del miembro */}
                  {miembro.sexo_mie && (
                     <option value={miembro.sexo_mie}>
                       {miembro.sexo_mie.charAt(0).toUpperCase() + miembro.sexo_mie.slice(1)} {/* Capitaliza la primera letra */}
                     </option>
                  )}
                   {/* Si el valor no está presente, podrías mostrar una opción por defecto deshabilitada */}
                   {!miembro.sexo_mie && (
                      <option value="" disabled>Sexo no especificado</option>
                   )}
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* Campo email_mie */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  defaultValue={miembro.email_mie}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo tipo_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Miembro *
              </label>
              <div className="relative">
                <GoPersonAdd
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  size={20}
                />
                <select
                  className={`${baseInputClass} appearance-none pr-10 text-gray-700`}
                  defaultValue={miembro.tipo_mie}
                  disabled
                >
                  <option value="" disabled>
                    Seleccionar Tipo de Miembro
                  </option>
                  <option value="Miembro">Miembro</option>
                  <option value="Invitado">Invitado</option>
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
              
            </div>


          </div> {/* Fin del grid */}

          {/* Botón de Eliminar - Fuera del grid */}
          <div className="mt-8"> {/* Margen superior para separar del grid */}
            <EliminarMiembro
              // Clases adaptadas del botón de "Crear Cuenta" pero en rojo
              //className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold shadow-md"
              miembro_id={params.id}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteMiembro;