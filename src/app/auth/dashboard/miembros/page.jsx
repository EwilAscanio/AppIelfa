import axios from "axios";
import Link from "next/link";

const loadMiembros = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/miembro`
    );
    return data.miembros;
  } catch (error) {
    console.error("Error loading miembros:", error);
    return [];
  }
};

const MiembrosPage = async () => {
  const miembros = await loadMiembros();

  return (
    <div className="container mx-auto px-4 "> {/* Contenedor principal centrado y con padding */}
      <div className="flex justify-between items-center mb-6"> {/* Flexbox para alinear título y botón */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"> {/* Título más prominente, ajustado a 2xl/3xl */}
            Lista de Miembros
          </h1>
          <p className="text-gray-600 text-sm"> {/* Texto más pequeño y gris */}
            Total registrados: {miembros.length}
          </p>
        </div>
        <Link href={"/auth/dashboard/miembros/registrarmiembros"} passHref> {/* Usar passHref con Link */}
          <button className="bg-primary hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-sm sm:text-base"> {/* Botón con mejor estilo, ajustado padding y tamaño de fuente */}
            Crear Miembro
          </button>
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden"> {/* Contenedor de la tabla con sombra y bordes redondeados */}
        <div className="overflow-x-auto"> {/* Asegura scroll horizontal en pantallas pequeñas */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre y Apellido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cedula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sexo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> {/* Centrado para Acciones */}
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {miembros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500"> {/* colSpan 6 para cubrir todas las columnas */}
                    No hay miembros disponibles.
                  </td>
                </tr>
              ) : (
                miembros.map((miembro) => (
                  <tr key={miembro.id_mie} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"> {/* Estilo para el nombre */}
                      {miembro.nombre_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {miembro.cedula_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {miembro.telefono_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {miembro.sexo_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {miembro.edad_actual}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> {/* Contenedor de botones centrado */}
                      <Link href={`/auth/dashboard/miembros/actualizarmiembro/${miembro.cedula_mie}`} passHref>
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 transition duration-200"> {/* Botón Actualizar con estilo primario */}
                          Actualizar
                        </button>
                      </Link>

                      <Link href={`/auth/dashboard/miembros/eliminarmiembro/${miembro.cedula_mie}`} passHref> {/* Asegúrate que la ruta es correcta, eliminé el process.env.NEXT_PUBLIC_NEXTAUTH_URL porque Link lo maneja internamente */}
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"> {/* Botón Eliminar con estilo de peligro */}
                          Eliminar
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MiembrosPage;