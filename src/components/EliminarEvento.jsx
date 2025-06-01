"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useCallback } from "react";
import { LuArrowRight } from "react-icons/lu";

const EliminarEvento = ({ event_id }) => {
  
  const router = useRouter();

  //Utilizo el hook useCallback para evitar que se ejecute la función en cada renderizado
  const handleDelete = useCallback(
    //Evento de click del botón de eliminar, prevengo cualquier comportamiento predeterminado, de recarga de la página.
    async (event) => {
      event.preventDefault(); // Prevenir cualquier comportamiento predeterminado

      try {
        // Mostrar alerta de confirmación
        const result = await Swal.fire({
          title: "¿Estás seguro?",
          text: "No podrás revertir esta acción",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
        });

        // Verificar si el usuario confirmó la acción
        if (result.isConfirmed) {
          // Eliminar usuario mediante petición a la API
          const resp = await axios.delete(
            `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${event_id}`
          );

          if (resp.status === 200) {
            // Mostrar alerta de éxito
            await Swal.fire({
              title: "Eliminado!",
              text: "El Evento ha sido eliminado",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });

            // Redirigir al usuario después de la eliminación
            router.push(
              `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard/eventos`
            );
            router.refresh();
          }
        }
      } catch (error) {
        // Mostrar alerta de error
        console.error("Error al eliminar el evento:", error);

        if (error.response.status === 409) {
          await Swal.fire(
            "Error",
            "El evento tiene registros asociados y no se puede eliminar.",
            "error"
          );
        } else if (error.response.status === 500) {
          await Swal.fire(
            "Error",
            "Error interno del servidor. Por favor, inténtalo más tarde.",
            "error"
          );
        } else {
          await Swal.fire(
            "Error",
            "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
            "error"
          );
        }
      }
    },
    [event_id, router]
  );

  return (
    <button
      className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center text-lg font-semibold shadow-md"
      onClick={handleDelete}
    >
      Eliminar Evento
      <LuArrowRight className="ml-2" size={20} />
    </button>
  );
};

export default EliminarEvento;
