"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuUser,
  LuMail,
  LuLock,
  LuArrowRight,
  LuChevronDown, 
} from "react-icons/lu";
import { TbUserSquareRounded } from "react-icons/tb";
import { RiLoader2Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const UpdateUsers = ({ params }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/update/${params.id}`)
      .then((res) => {
        setUser(res.data);
        // Resetear el formulario con los datos cargados
        reset(res.data);
      })
      .catch((error) => console.error("Error loading user data:", error));
  }, [params.id, reset]); // Añadir reset como dependencia

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log("DATA UPDATE", data);
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/update/${params.id}`,
        data
      );

      if (res.status === 200) { // Usar === para comparación estricta
        Swal.fire({
          title: "Actualizar Usuario",
          text: "El usuario ha sido actualizado exitosamente.", // Mensaje actualizado
          icon: "success",
          confirmButtonColor: "#9D00FF",
        });
        router.push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard`);
        router.refresh();
      } else {
        // Manejar otros códigos de estado si es necesario
        alert("Ocurrió un error al actualizar el usuario.");
      }
    } catch (error) {
      console.error("Error updating user:", error); // Log del error
      // Puedes mostrar un mensaje de error más específico basado en error.response
      alert("Ocurrió un error en el servidor. Intenta nuevamente más tarde.");
    }
  });

  // Clases base para los inputs/selects, similar al diseño de creación
  const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"; // Añadido text-gray-700

  // Mostrar un mensaje de carga o spinner mientras se cargan los datos del usuario
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <RiLoader2Line className="animate-spin text-primary" size={50} />
        <p className="mt-4 text-gray-600 text-lg">Cargando datos...</p>
      </div>
    </div>
    );
  }

  return (
    // Contenedor principal con el diseño de la página de creación
    <div className="flex place-items-start p-4 min-h-screen bg-gray-100">

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados, más ancho */}
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full mx-auto">
        {/* Título y subtítulo con estilo similar al de la lista/creación */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Actualizar Usuario
          </h1>
          <p className="text-gray-600 text-sm">
            Modifica los datos requeridos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          {/* Inicio del Grid para campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4"> {/* Usando md:gap-4 */}

            {/* Campo NOMBRE */}
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
                  {...register("nombre_usr", {
                    required: {
                      value: true,
                      message: "El nombre completo es requerido",
                    },
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.nombre_usr && ( // Corregido a errors.nombre_usr
                <span className="text-red-600 text-sm mt-1 block"> {/* Añadido mt-1 block */}
                  {errors.nombre_usr.message}
                </span>
              )}
            </div>

            {/* Campo LOGIN */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Nombre de Usuario (Login) *
               </label>
              <div className="relative">
                <TbUserSquareRounded
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: juperez"
                  className={baseInputClass}
                  {...register("login_usr", {
                    required: {
                      value: true,
                      message: "El nombre de usuario es requerido",
                    },
                    minLength: {
                      value: 2,
                      message: "El nombre de usuario debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.login_usr && ( // Corregido a errors.login_usr
                <span className="text-red-600 text-sm mt-1 block"> {/* Añadido mt-1 block */}
                  {errors.login_usr.message}
                </span>
              )}
            </div>

            {/* Campo EMAIL */}
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
                  {...register("email_usr", {
                    required: {
                      value: true,
                      message: "El correo electrónico es requerido",
                    },
                     pattern: { // Añadir validación de formato de email
                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                       message: "Formato de correo electrónico inválido"
                    }
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.email_usr && ( // Corregido a errors.email_usr
                <span className="text-red-600 text-sm mt-1 block"> {/* Añadido mt-1 block */}
                  {errors.email_usr.message}
                </span>
              )}
            </div>

            {/* Campo PASSWORD */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Contraseña *
               </label>
              <div className="relative">
                <LuLock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres" // Placeholder descriptivo
                  className={baseInputClass}
                  {...register("password_usr", {
                    required: {
                      value: true,
                      message: "La contraseña es requerida",
                    },
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.password_usr && ( // Corregido a errors.password_usr
                <span className="text-red-600 text-sm mt-1 block"> {/* Añadido mt-1 block */}
                  {errors.password_usr.message}
                </span>
              )}
            </div>

            {/* Campo ROL - Ocupa una columna */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Rol *
               </label>
              <div className="relative">
                 <TbUserSquareRounded // Icono a la izquierda
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className={`${baseInputClass} appearance-none pr-10`} // Añadido appearance-none y pr-10 para la flecha
                  {...register("id_rol", {
                     required: "Debe seleccionar un rol"
                  })}
                  defaultValue="" // Asegurarse de que el valor por defecto sea manejado por react-hook-form con reset()
                >
                  <option value="" disabled> {/* Opción disabled para placeholder */}
                    Seleccione un Rol
                  </option>
                  <option value="2">Usuario</option>
                  <option value="1">Administrador</option>
                </select>
                <LuChevronDown // Icono de flecha para el select a la derecha
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" // pointer-events-none para que no bloquee el click
                  size={20}
                />
              </div>
             {/* Manejo de Errores */}
            {errors.id_rol && (
              <span className="text-red-600 text-sm mt-1 block"> {/* Añadido mt-1 block */}
                {errors.id_rol.message}
              </span>
            )}
          </div>

          </div> {/* Fin del grid */}

          {/* Botón de Envío - Fuera del grid, ocupará todo el ancho */}
          <div className="mt-6"> {/* Margen superior para separar del grid */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold" // Ajustado padding y tamaño/peso de fuente
            >
              Actualizar Usuario
              <LuArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUsers;