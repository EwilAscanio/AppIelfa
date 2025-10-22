import axios from "axios";
import Link from "next/link";

const loadFamilias = async () => {
  try {
    // CORRECCIÓN: Usar siempre la URL absoluta para las llamadas a la API en Componentes de Servidor.
    // Esto asegura que la llamada funcione durante el `build` y en producción.
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias`
    );
    return data.familias;
  } catch (error) {
    console.error("Error loading familias:", error);
    // Puedes retornar un array vacío o lanzar el error dependiendo de cómo quieras manejarlo
    return [];
  }
};

const FamiliasPage = async () => {
  const familias = await loadFamilias();

  return (
    <div className="container mx-auto px-4 "> {/* Contenedor principal centrado y con padding */}
      <div className="flex justify-between items-center mb-6"> {/* Flexbox para alinear título y botón */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"> {/* Título más prominente, ajustado a 2xl/3xl */}
            Lista de Familias
          </h1>
          <p className="text-gray-600 text-sm"> {/* Texto más pequeño y gris */}
            Total registrados: {familias.length}
          </p>
        </div>
        <Link href={"/auth/dashboard/familias/registrar"} passHref> {/* Usar passHref con Link */}
          <button className="bg-primary hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out text-sm sm:text-base"> {/* Botón con mejor estilo, ajustado padding y tamaño de fuente */}
            Crear Familia
          </button>
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden"> {/* Contenedor de la tabla con sombra y bordes redondeados */}
        <div className="overflow-x-auto"> {/* Asegura scroll horizontal en pantallas pequeñas */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jefe de Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parentesco
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> {/* Centrado para Acciones */}
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {familias.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500"> {/* colSpan 5 para cubrir todas las columnas */}
                    No hay familias disponibles.
                  </td>
                </tr>
              ) : (
                familias.map((familia) => (
                  <tr key={familia.id_fam} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"> {/* Estilo para el nombre */}
                      {familia.nombre_fam}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {familia.jefe_nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {familia.miembros && familia.miembros.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {familia.miembros.map((miembro, index) => (
                            <li key={index}>{miembro.nombre}</li>
                          ))}
                        </ul>
                      ) : (
                        "Sin miembros adicionales"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {familia.miembros && familia.miembros.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {familia.miembros.map((miembro, index) => (
                            <li key={index}>{miembro.parentesco}</li>
                          ))}
                        </ul>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> {/* Contenedor de botones centrado */}
                      <Link href={`/auth/dashboard/familias/update/${familia.id_fam}`} passHref>
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 transition duration-200"> {/* Botón Actualizar con estilo primario */}
                          Actualizar
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

export default FamiliasPage;
