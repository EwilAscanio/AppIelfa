"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  LuCalendar, // Icono para fecha
  LuArrowRight, // Icono para botón
  LuFileText, // Icono para nombre y descripción
  LuTag, // Icono para código
  LuChevronDown, // Icono para select
} from "react-icons/lu";
import { RiLoader2Line } from "react-icons/ri";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";

const UpdateEvent = ({ params }) => {
  const [event, setEvent] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Función para formatear la fecha a YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return ""; // Devolver cadena vacía si no hay fecha
    const date = new Date(dateString);
    // Asegurarse de que la fecha es válida
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Cargar datos del evento al montar el componente
    axios
      .get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${params.id}`)
      .then((res) => {
        const eventData = res.data;
        setEvent(eventData); // Guardar datos del evento

        // Formatear la fecha antes de resetear el formulario
        const formattedEventData = {
          ...eventData,
          fecha_eve: formatDate(eventData.fecha_eve),
        };

        // Resetear el formulario con los datos cargados y la fecha formateada
        reset(formattedEventData);

      })
      .catch((error) => console.error("Error loading event data:", error));
  }, [params.id, reset]); // Dependencias: id del evento y reset

  const onSubmit = handleSubmit(async (data) => {
    try {
      
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${params.id}`,
        data
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Actualizar Evento",
          text: "El evento ha sido actualizado exitosamente.",
          icon: "success",
          confirmButtonColor: "#9D00FF",
        });
        router.push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard/eventos`);
        router.refresh();
      } else {
        Swal.fire({
           title: "Error",
           text: "Ocurrió un error al actualizar el evento.",
           icon: "error",
           confirmButtonColor: "#d33",
         });
      }
    } catch (error) {
      console.error("Error updating event:", error);
       if (error.response) {
          Swal.fire({
            title: "Error",
            text: `Error del servidor: ${error.response.data.message || error.response.statusText}`,
            icon: "error",
            confirmButtonColor: "#d33",
          });
       } else {
           Swal.fire({
            title: "Error",
            text: "Ocurrió un error en la solicitud. Intenta nuevamente más tarde.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
       }
    }
  });

  // Clases base para los inputs/selects
  const baseInputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700";

  // Mostrar un mensaje de carga o spinner
  if (event === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <RiLoader2Line className="animate-spin text-primary" size={50} />
          <p className="mt-4 text-gray-600 text-lg">Cargando datos del evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl sm:p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Actualizar Evento
          </h1>
          <p className="text-gray-600 text-sm">
            Modifica los datos requeridos
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">

            {/* Campo CODIGO_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Código del Evento *
               </label>
              <div className="relative">
                <LuTag
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: EVT001"
                  disabled
                  className={baseInputClass}
                  {...register("codigo_eve", {
                    required: {
                      value: true,
                      message: "El código es requerido",
                    },
                    minLength: {
                      value: 2,
                      message: "El código debe tener mínimo 2 caracteres",
                    },
                  })}
                />
              </div>
              {errors.codigo_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.codigo_eve.message}
                </span>
              )}
            </div>

            {/* Campo NOMBRE_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Nombre del Evento *
               </label>
              <div className="relative">
                <LuFileText
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ej: Conferencia Anual"
                  className={baseInputClass}
                  {...register("nombre_eve", {
                    required: {
                      value: true,
                      message: "El nombre es requerido",
                    },
                    minLength: {
                      value: 2,
                      message: "El nombre debe tener mínimo 2 caracteres",
                    },
                  })}
                />
              </div>
              {errors.nombre_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.nombre_eve.message}
                </span>
              )}
            </div>

            {/* Campo FECHA_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Fecha del Evento *
               </label>
              <div className="relative">
                <LuCalendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  className={baseInputClass}
                  {...register("fecha_eve", {
                    required: {
                      value: true,
                      message: "La fecha es requerida",
                    },
                  })}
                />
              </div>
              {errors.fecha_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.fecha_eve.message}
                </span>
              )}
            </div>

            {/* Campo DESCRIPCION_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Descripción del Evento *
               </label>
              <div className="relative">
                <LuFileText
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Breve descripción del evento"
                  className={baseInputClass}
                  {...register("descripcion_eve", {
                    required: {
                      value: true,
                      message: "La descripción es requerida",
                    },
                    maxLength: {
                      value: 250,
                      message: "La descripción no puede exceder 250 caracteres",
                    },
                  })}
                />
              </div>
              {errors.descripcion_eve && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.descripcion_eve.message}
                </span>
              )}
            </div>

            {/* Campo STATUS_EVE */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Estado *
               </label>
              <div className="relative">
                <select
                  className={`${baseInputClass} appearance-none pr-10 text-gray-700`}
                  {...register("status_eve", { required: "Debe seleccionar un estado" })}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccione un Estado
                  </option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
                <LuChevronDown
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            {errors.status_eve && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.status_eve.message}
              </span>
            )}
          </div>

          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold"
            >
              Actualizar Evento
              <LuArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEvent;