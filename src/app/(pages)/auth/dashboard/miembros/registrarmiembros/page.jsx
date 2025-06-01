"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuCalendar,
  LuArrowRight,
  LuChevronDown, // Necesitamos este icono para el select
} from "react-icons/lu";
import { GoPersonAdd } from "react-icons/go";
import { FaDirections } from "react-icons/fa";
import { PiGenderMaleBold } from "react-icons/pi";
import { MdNumbers } from "react-icons/md";
import Swal from "sweetalert2";

const RegisterMembers = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Clase base para los estilos de los inputs y select
  const baseInputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition duration-200";

  // Función para manejar el envío del formulario
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/miembro`,
        data
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Registrar Miembro",
          text: "El miembro ha sido registrado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push("/auth/dashboard/miembros");
        router.refresh();
      }
    } catch (error) {
      // Manejar errores de respuesta
      if (error.response) {
        if (error.response.status === 400) {
          Swal.fire({
            title: "Error",
            text: "El miembro ya está registrado. Por favor, verifica los datos.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } else if (error.response.status === 500) {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error en el servidor al registrar el miembro.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } else {
           Swal.fire({
              title: "Error",
              text: `Error al registrar miembro: ${error.response.status}`,
              icon: "error",
              confirmButtonColor: "#d33",
           });
        }
      } else if (error.request) {
         console.error("Error de red:", error.request);
         Swal.fire({
            title: "Error",
            text: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
            icon: "error",
            confirmButtonColor: "#d33",
         });
      }
      else {
        console.error("Error de configuración:", error.message);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  });

  return (
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100"> {/* Ajustado a justify-center para centrar */}

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados */}
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-4xl w-full"> {/* Ajustado padding */}
        {/* Título y subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Registrar Nuevo Miembro
          </h1>
          <p className="text-gray-600 text-sm">
            Completa los datos requeridos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          {/* Inicio del Grid para campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"> {/* Ajustado gap */}

            {/* Campo nombre_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <LuUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className={baseInputClass}
                  {...register("nombre_mie", {
                    required: "El nombre completo es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {errors.nombre_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.nombre_mie.message}
                </span>
              )}
            </div>

            {/* Campo cedula_mie */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula de Identidad *
              </label>
              <div className="relative">
                <MdNumbers
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: 123456789"
                  className={baseInputClass}
                  {...register("cedula_mie", {
                    required: "La cédula es requerida",
                    // Puedes añadir validaciones de formato de cédula si es necesario
                  })}
                />
              </div>
              {errors.cedula_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.cedula_mie.message}
                </span>
              )}
            </div>

            {/* Campo direccion_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección de Residencia *
              </label>
              <div className="relative">
                <FaDirections
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Calle Principal #123"
                  className={baseInputClass}
                  {...register("direccion_mie", {
                    required: "La dirección es requerida",
                  })}
                />
              </div>
              {errors.direccion_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.direccion_mie.message}
                </span>
              )}
            </div>

            {/* Campo telefono_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Teléfono *
              </label>
              <div className="relative">
                <LuPhone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="tel"
                  placeholder="Ej: 0412-1234567"
                  className={baseInputClass}
                  {...register("telefono_mie", {
                    //required: "El teléfono es requerido",
                    // Añadir validaciones de formato de teléfono si es necesario
                  })}
                />
              </div>
              {errors.telefono_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.telefono_mie.message}
                </span>
              )}
            </div>

             {/* Campo Fecha de Nacimiento */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  placeholder="Ej: 30"
                  className={baseInputClass}
                  {...register("fechanacimiento_mie", {
                    required: "La Fecha de Nacimiento es requerida",
                    validate: (value) => {
                      const today = new Date();
                      const birthDate = new Date(value);
                      if (birthDate > today) {
                        return "La fecha de nacimiento no puede ser futura";
                      }
                      return true;
                    },
                  })}
                />
              </div>
              {errors.fechanacimiento_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.edad_mie.message}
                </span>
              )}
            </div>

            {/* Campo sexo_mie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo *
              </label>
              <div className="relative">
                <PiGenderMaleBold
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  size={20}
                />
                <select
                  className={`${baseInputClass} appearance-none pr-10 text-gray-700`}
                  {...register("sexo_mie", { required: "El sexo es requerido" })}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccionar Sexo
                  </option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
              {errors.sexo_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.sexo_mie.message}
                </span>
              )}
            </div>

            {/* Campo email_mie - Este campo podría ocupar una fila completa si se desea,
                o colocarse en la segunda columna si hay espacio. Lo pondremos en la segunda columna
                para completar la fila con el campo sexo. */}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <LuMail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Ej: correo@dominio.com"
                  className={baseInputClass}
                  {...register("email_mie", {
                    
                    pattern: {
                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                       message: "Formato de correo electrónico inválido"
                    }
                  })}
                />
              </div>
              {errors.email_mie && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.email_mie.message}
                </span>
              )}
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
                              {...register("tipo_mie", { required: "El tipo de Miembro es requerido" })}
                              defaultValue="" // react-hook-form maneja el valor inicial con reset()
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
                          {errors.tipo_mie && (
                            <span className="text-red-600 text-sm mt-1 block">
                              {errors.sexo_mie.message}
                            </span>
                          )}
                        </div>

            {/* Si tuvieras un número impar de campos que quieres en el grid de 2 columnas,
                podrías añadir un div vacío aquí para forzar el siguiente elemento a la siguiente fila:
                <div className="md:col-span-2"></div>
                Pero como el botón va a ocupar todo el ancho, no es estrictamente necesario.
            */}

          </div> {/* Fin del grid */}

          {/* Botón de Envío - Fuera del grid, ocupará todo el ancho */}
          <div className="mt-8"> {/* Margen superior para separar del grid */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center justify-center text-lg font-semibold shadow-md"
            >
              Registrar Miembro
              <LuArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMembers;