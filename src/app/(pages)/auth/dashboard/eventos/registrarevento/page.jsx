"use client";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LuCalendar, LuArrowRight, LuFileText, LuTag, LuChevronDown } from "react-icons/lu"; // Importar LuChevronDown para el select
import Swal from "sweetalert2";

// Definir una clase base para los inputs para reutilizar estilos
const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

const RegistrarEvento = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Función para manejar el envío del formulario
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento`,
        data
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Registrar Evento",
          text: "El evento ha sido registrado exitosamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        router.push("/auth/dashboard/eventos");
        router.refresh();
      }
    } catch (error) {
      // Manejar errores de respuesta
      if (error.response) {
        if (error.response.status === 400) {
          Swal.fire({
            title: "Error",
            text: "El evento ya está registrado. Por favor, verifica los datos.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } else if (error.response.status === 500) {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error en el servidor.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        } else {
           Swal.fire({
            title: "Error",
            text: `Ocurrió un error: ${error.response.data.message || error.response.statusText}`,
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      } else {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error en la solicitud.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    }
  });

  return (
    // Contenedor principal centrado con fondo gris claro y padding
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100">

      {/* Contenedor del formulario con fondo blanco, sombra y bordes redondeados */}
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full">
        {/* Título y subtítulo */}
        <div className="text-center mb-8"> {/* Aumentado mb para separar del grid */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Registrar Nuevo Evento
          </h1>
          <p className="text-gray-600 text-sm"> {/* Ajustado tamaño de texto */}
            Completa los datos requeridos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit}>
          {/* Inicio del Grid para campos - Usando gap del diseño de usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">

            {/* Campo CODIGO_EVE */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código del Evento *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: EVT001"
                  className={baseInputClass} // Usando la clase base
                  {...register("codigo_eve", {
                    required: { value: true, message: "El código es requerido" },
                    minLength: {
                      value: 2,
                      message: "El código debe tener mínimo 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.codigo_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.codigo_eve.message}
                </span>
              )}
            </div>

            {/* Campo NOMBRE_EVE */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Evento *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuFileText
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Conferencia Anual"
                  className={baseInputClass} // Usando la clase base
                  {...register("nombre_eve", {
                    required: { value: true, message: "El nombre es requerido" },
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener mínimo 2 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.nombre_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.nombre_eve.message}
                </span>
              )}
            </div>

            {/* Campo FECHA_EVE */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del Evento *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  className={baseInputClass} // Usando la clase base
                  {...register("fecha_eve", {
                    required: { value: true, message: "La fecha es requerida" },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.fecha_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.fecha_eve.message}
                </span>
              )}
            </div>

            {/* Campo DESCRIPCION_EVE */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Evento *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el input */}
                <LuFileText
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Breve descripción del evento"
                  className={baseInputClass} // Usando la clase base
                  {...register("descripcion_eve", {
                    required: { value: true, message: "La descripción es requerida" },
                    maxLength: {
                      value: 250,
                      message: "La descripción no puede exceder 250 caracteres",
                    },
                  })}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.descripcion_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.descripcion_eve.message}
                </span>
              )}
            </div>

            {/* Campo STATUS_EVE - Ocupa una columna */}
            <div> {/* Div contenedor para el item del grid */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <div className="relative"> {/* Contenedor para el icono y el select */}
                 {/* Puedes añadir un icono si lo deseas, similar al select de rol */}
                 {/* <LuTag // Ejemplo de icono
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                 /> */}
                <select
                  className={`${baseInputClass} appearance-none pr-10 text-gray-700`} // Añadido appearance-none y pr-10 para la flecha, ajustado pl si no hay icono
                  {...register("status_eve", { required: "Debe seleccionar un estado" })}
                  defaultValue="" // Establecer valor por defecto para el placeholder
                >
                  <option value="" disabled> {/* Opción disabled para placeholder */}
                    Seleccione un Estado
                  </option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <LuChevronDown // Icono de flecha para el select a la derecha
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" // pointer-events-none para que no bloquee el click
                  size={20}
                />
              </div>
              {/* Manejo de Errores */}
              {errors.status_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.status_eve.message}
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
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold" // Ajustado padding y tamaño/peso de fuente, color azul
            >
              Crear Evento
              <LuArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrarEvento;