"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuUser,
  LuUserCircle,
  LuMail,
  LuLock,
  LuArrowRight,
  LuChevronDown, // Icono para el select
} from "react-icons/lu";
import Link from "next/link";
import Swal from "sweetalert2";

const Register = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset // Añadimos reset para limpiar el formulario después de éxito
  } = useForm();

  // Función para manejar el envío del formulario
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/usuarios`,
        data
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Registrar Usuario",
          text: "El usuario ha sido registrado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        reset(); // Limpiar el formulario
        router.push("/auth/dashboard/usuarios"); // Redirigir después del registro exitoso
      } else if (res.status === 400) {
        // Error de validación del servidor (ej: usuario ya existe)
        Swal.fire({
          title: "Error de registro",
          text: "El usuario ya está registrado. Por favor, verifica los datos.",
          icon: "warning",
          confirmButtonColor: "#f8bb86",
        });
      } else if (res.status === 500) {
        // Error interno del servidor
         Swal.fire({
          title: "Error del servidor",
          text: "Ocurrió un error en el servidor. Intenta nuevamente más tarde.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      } else {
        // Otro error
        Swal.fire({
          title: "Error inesperado",
          text: "Ocurrió un error inesperado. Por favor, contacta al administrador.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error en la solicitud.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  });

  const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";


  return (
    // Contenedor principal centrado y con fondo gris
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100">
      
      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados */}
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full">
        {/* Título y subtítulo */}
        <div className="text-center mb-8"> {/* Aumentado mb para separar del grid */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Crear Nuevo Usuario
          </h1>
          <p className="text-gray-600 text-sm"> {/* Ajustado tamaño de texto */}
            Completa los datos requeridos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit}> {/* Eliminado space-y ya que el grid maneja el espacio */}
          {/* Inicio del Grid para campos - Usando gap del diseño de eliminar */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">

            {/* Campo NOMBRE */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez" // Placeholder descriptivo
                  className={baseInputClass}
                  {...register("nombre_usr", {
                    required: "El nombre completo es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.nombre_usr && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.nombre_usr.message}
                </span>
              )}
            </div>

            {/* Campo LOGIN */}
             <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario (Login) *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuUserCircle
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: juperez" // Placeholder descriptivo
                  className={baseInputClass}
                  {...register("login_usr", {
                    required: "El nombre de usuario es requerido",
                    minLength: {
                      value: 2,
                      message: "El nombre de usuario debe tener al menos 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.login_usr && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.login_usr.message}
                </span>
              )}
            </div>

            {/* Campo EMAIL */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuMail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Ej: correo@dominio.com" // Placeholder descriptivo
                  className={baseInputClass}
                  {...register("email_usr", {
                    required: "El correo electrónico es requerido",
                    pattern: { // Añadir validación de formato de email
                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                       message: "Formato de correo electrónico inválido"
                    }
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.email_usr && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.email_usr.message}
                </span>
              )}
            </div>

            {/* Campo PASSWORD */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuLock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres" // Placeholder descriptivo
                  className={baseInputClass}
                  {...register("password_usr", {
                    required: "La contraseña es requerida",
                    minLength: {
                      value: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.password_usr && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.password_usr.message}
                </span>
              )}
            </div>

            {/* Campo ROL - Ocupa una columna */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el select */}
                 <LuUserCircle // Icono a la izquierda
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className={`${baseInputClass} appearance-none pr-10 text-gray-700`} // Añadido appearance-none y pr-10 para la flecha
                  {...register("id_rol", {
                     required: "Debe seleccionar un rol"
                  })}
                  defaultValue="" // Establecer valor por defecto para el placeholder
                >
                  <option value="" disabled> {/* Opción disabled para placeholder */}
                    Seleccione un Rol
                  </option>
                  <option value="2">Usuario</option> {/* Asegúrate que los valores coincidan con tu BD */}
                  <option value="1">Administrador</option> {/* Asegúrate que los valores coincidan con tu BD */}
                </select>
                <LuChevronDown // Icono de flecha para el select a la derecha
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" // pointer-events-none para que no bloquee el click
                  size={20}
                />
              </div>
             {/* Manejo de Errores */}
            {errors.id_rol && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.id_rol.message}
              </span>
            )}
          </div>

          {/* Puedes añadir un div vacío aquí si quieres que el siguiente campo (si hubiera)
              empiece en la segunda columna, pero para el botón no es necesario si va después del grid */}
          {/* <div></div> */}

          </div> {/* Fin del grid */}

          {/* Botón de Envío - Fuera del grid, ocupará todo el ancho */}
          <div className="mt-6"> {/* Margen superior para separar del grid */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold" // Ajustado padding y tamaño/peso de fuente
            >
              Crear Cuenta
              <LuArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default Register;