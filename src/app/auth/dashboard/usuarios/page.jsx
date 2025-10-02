import axios from "axios";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Esta función sigue siendo la misma para cargar los usuarios
const loadUsers = async () => {
  try {

     // 1. OBTENER LA URL DE CONFIGURACIÓN (del .env)
      //    No renombramos la variable del proceso de entorno.
      const configUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL;
     
     // 2. DETERMINAR LA BASE_URL EN BASE A SI INCLUYE 'localhost'
     const BASE_URL = configUrl && configUrl.includes('localhost')
     ? configUrl // Caso: Desarrollo (ej. http://localhost:3000 o 3001)
     : '';  // Caso: Producción/Vercel (ej. tudominio.com), usar ruta relativa
     
      // 3. REALIZAR LA LLAMADA AXIOS
     const { data } = await axios.get(`${BASE_URL}/api/usuarios`);
    
    return data;
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    return []; // Retorna un array vacío en caso de error para evitar que la aplicación falle
  }
};

const UsersPage = async () => {
  const users = await loadUsers();
  const sesion = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-4"> {/* Contenedor principal centrado y con padding */}
      <div className="flex justify-between items-center mb-6"> {/* Flexbox para alinear título y botón */}
        <div>

        <h1 className="text-3xl font-extrabold text-gray-800"> {/* Título más prominente */}
          Lista de Usuarios
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Total registrados: {users.length} 
        </p>
        </div>
        <Link href={"/auth/dashboard/usuarios/registerusers"}>
          <button className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"> {/* Botón con mejor estilo */}
            Crear Usuario
          </button>
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden"> {/* Contenedor de la tabla con sombra y bordes redondeados */}
        <div className="overflow-x-auto"> {/* Asegura scroll horizontal en pantallas pequeñas */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"> 
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200"> 
              {users.length === 0 ? (
                 <tr>
                   <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                     No hay usuarios disponibles.
                   </td>
                 </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id_usr} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.nombre_usr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email_usr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> {/* Contenedor de botones centrado */}
                      <Link href={`/auth/dashboard/usuarios/updateusers/${user.id_usr}`} passHref>
                        <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2 transition duration-200"> 
                          Actualizar
                        </button>
                      </Link>
                      {sesion?.user?.email !== user.email_usr && ( 
                        <Link href={`/auth/dashboard/usuarios/deleteusers/${user.id_usr}`} passHref>
                           <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"> 
                            Eliminar
                          </button>
                        </Link>
                      )}
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

export default UsersPage;