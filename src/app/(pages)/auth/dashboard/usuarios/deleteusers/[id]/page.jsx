import axios from "axios";
import {
  LuUser,
  LuUserCircle,
  LuMail,
  LuLock,
  LuArrowRight, // Aunque no se usa directamente en el botón de eliminar, se mantiene por si el componente EliminarUsuario lo usa o como referencia del diseño base
  LuChevronDown,
} from "react-icons/lu";
import EliminarUsuario from "@/components/EliminarUsuario";

const loadUser = async (id) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/update/${id}`
    );
    return data;
  } catch (error) {
    console.error("Error loading user:", error);
    // Puedes manejar el error aquí, por ejemplo, redirigir o mostrar un mensaje
    return null; // Retorna null si no se pudo cargar el usuario
  }
};

const DeleteUsers = async ({ params }) => {
  const user = await loadUser(params.id);

  // Si el usuario no se pudo cargar, puedes mostrar un mensaje de error o redirigir
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Error al cargar los datos del usuario.
      </div>
    );
  }

  // Clases base para los inputs/selects, adaptadas para ser de solo lectura
  const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 cursor-not-allowed text-gray-700"; // Añadido bg-gray-100, cursor-not-allowed y text-gray-700

  return (
    // Contenedor principal con el diseño de la página de creación
    <div className="flex place-items-start p-4 min-h-screen bg-gray-100">

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados, más ancho */}
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full mx-auto"> {/* Añadido mx-auto para centrar */}
        {/* Título y subtítulo con estilo similar al de la lista/creación */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Eliminar Usuario
          </h1>
          <p className="text-gray-600 text-sm">
            Datos del usuario a eliminar
          </p>
        </div>

        {/* Formulario - Los campos son de solo lectura */}
        {/* No se necesita onSubmit en el form ya que la acción la maneja el componente EliminarUsuario */}
        <form>
          {/* Inicio del Grid para campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4"> {/* Ajustado el gap para consistencia si es necesario, o mantener md:gap-3 */}

            {/* Campo NOMBRE */}
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
                  defaultValue={user.nombre_usr}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo LOGIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario (Login)
              </label>
              <div className="relative">
                <LuUserCircle
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  defaultValue={user.login_usr}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo EMAIL */}
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
                  defaultValue={user.email_usr}
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo PASSWORD - Mostrar placeholder genérico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <LuLock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  defaultValue="********" // Valor fijo para no mostrar la real
                  readOnly
                  className={baseInputClass}
                />
              </div>
            </div>

            {/* Campo ROL - Ocupa una columna */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <div className="relative">
                <LuUserCircle
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className={`${baseInputClass} appearance-none pr-10`} // Mantener appearance-none y pr-10 para la flecha
                  defaultValue={user.id_rol}
                  disabled // Deshabilitar el select
                >
                  {/* Opciones basadas en el valor del usuario */}
                  <option value={user.id_rol}>
                    {user.id_rol === 1 ? "Administrador" : "Usuario"}
                  </option>
                   {/* Si quieres mostrar todas las opciones deshabilitadas: */}
                  {/* <option value="" disabled>Seleccione un Rol</option>
                  <option value="2">Usuario</option>
                  <option value="1">Administrador</option> */}
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

          </div> {/* Fin del grid */}

          {/* Botón de Eliminar - Fuera del grid */}
          <div className="mt-6"> {/* Margen superior para separar del grid */}
            <EliminarUsuario
              // Clases adaptadas del botón de "Crear Cuenta" pero en rojo
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center text-lg font-semibold"
              user_id={params.id}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteUsers;