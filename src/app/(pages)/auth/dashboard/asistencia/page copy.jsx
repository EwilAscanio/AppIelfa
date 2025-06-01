"use client";

import axios from "axios";
import Swal from "sweetalert2";
import { FaBarcode } from "react-icons/fa";
import { LuLoader2, LuSearch } from "react-icons/lu";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

const RegistrarAsistencia = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
  } = useForm();

  const [eventoCargado, setEventoCargado] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");

  const [selectedMiembro, setSelectedMiembro] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [miembros, setMiembros] = useState([]);

  const [isLoadingEvento, setIsLoadingEvento] = useState(false);
  const [isLoadingMiembro, setIsLoadingMiembro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para controlar si el evento ya tiene asistencia registrada
  const [eventoYaRegistrado, setEventoYaRegistrado] = useState(false); // <--- NUEVO ESTADO

  const watchedSearchTerm = useWatch({ control, name: 'searchTermMiembro' });
  const watchedCodigoEvento = useWatch({ control, name: 'codigo_evento' });

  const debounceTimerRef = useRef(null);
  const isSettingValueRef = useRef(false);

  const getLocalStorageKey = (codigo) => `asistencia_borrador_${codigo}`;

  const cargarBorradorAsistencia = useCallback((codigo) => {
    const key = getLocalStorageKey(codigo);
    const storedMembers = localStorage.getItem(key);
    if (storedMembers) {
      try {
        const parsedMembers = JSON.parse(storedMembers);
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          setMiembros(parsedMembers);
          Swal.fire({
            title: "Borrador Cargado",
            text: `Se ha cargado un borrador de ${parsedMembers.length} asistentes para este evento.`,
            icon: "info",
            confirmButtonColor: "#3085d6",
          });
          return true;
        }
      } catch (e) {
        console.error("Error al parsear el borrador del LocalStorage:", e);
        localStorage.removeItem(key);
      }
    }
    setMiembros([]);
    return false;
  }, []);

  const guardarBorradorAsistencia = useCallback((codigo, currentMembers) => {
    if (codigo && currentMembers.length > 0) {
      const key = getLocalStorageKey(codigo);
      localStorage.setItem(key, JSON.stringify(currentMembers));
      console.log(`Borrador guardado para evento ${codigo}:`, currentMembers);
    } else if (codigo && currentMembers.length === 0) {
      //localStorage.removeItem(getLocalStorageKey(codigo));
      console.log(`Borrador limpiado para evento ${codigo} (sin miembros).`);
    }
  }, []);

  useEffect(() => {
    // Solo guardar borrador si el evento está cargado y NO está ya registrado
    if (eventoCargado && watchedCodigoEvento && !eventoYaRegistrado) { // <--- MODIFICADO
      guardarBorradorAsistencia(watchedCodigoEvento, miembros);
    }
  }, [miembros, eventoCargado, watchedCodigoEvento, guardarBorradorAsistencia, eventoYaRegistrado]); // <--- AÑADIDO eventoYaRegistrado

  useEffect(() => {
    if (isSettingValueRef.current) {
      return;
    }
    setSearchResults([]);
    setSelectedMiembro(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const searchTerm = watchedSearchTerm?.trim();

    if (!searchTerm || searchTerm.length < 3) {
      setIsLoadingMiembro(false);
      return;
    }

    setIsLoadingMiembro(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia?query=${(searchTerm)}`
                      );
        console.log("Resultados de búsqueda de miembro:", res.data);
        if (res.status === 200 && Array.isArray(res.data)) {
          setSearchResults(res.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error buscando miembro en tiempo real:", error);
        setSearchResults([]);
      } finally {
        setIsLoadingMiembro(false);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watchedSearchTerm]);

  const seleccionarMiembro = (miembro) => {
    isSettingValueRef.current = true;
    setSelectedMiembro(miembro);
    setValue("searchTermMiembro", miembro.cedula_mie || miembro.nombre_mie, { shouldValidate: true });
    setSearchResults([]);
    setTimeout(() => {
      isSettingValueRef.current = false;
    }, 50);
  };

  const resetMemberSearchState = () => {
    setSelectedMiembro(null);
    setSearchResults([]);
  };

  // --- NUEVA FUNCIÓN: Verificar si el evento YA tiene asistencia registrada ---
  const verificarSiEventoTieneAsistenciaPrevia = async (codigoEvento) => {
      try {
          // Asumo que tu API tiene un endpoint para esto. Por ejemplo:
          // GET /api/asistencia?codigo_eve={codigo}
          // O un endpoint más específico como /api/asistencia/check-event?codigo_eve={codigo}
          // Esta llamada debe devolver true si existe AL MENOS UN registro de asistencia para ese código de evento,
          // y false si NO existe NINGÚN registro.
          const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/asistenciaporevento/asistencia?codigoEvento=${codigoEvento}`
                    );

          // Ajusta esta lógica según la respuesta real de tu API:
          // Si tu API devuelve una lista de asistencias para el evento, comprobamos si la lista no está vacía.
          if (Array.isArray(res.data.asistencias) && res.data.asistencias.length > 0) {
            console.log("Asistencias encontradas para el evento: true");
          return true;  
        } 
          // Si tu API devuelve un objeto como { "registrado": true }
          // if (res.data.registrado === true) { return true; }
          
          return false; // No hay asistencias registradas para este evento
      } catch (error) {
          console.error("Error al verificar asistencia previa del evento:", error);
          // En caso de error de red o servidor, es más seguro asumir que ya está registrado
          // para evitar duplicados si la verificación falla.
          Swal.fire({
              title: "Error de Verificación",
              text: "Hubo un problema al verificar la asistencia del evento. Intente de nuevo.",
              icon: "error",
              confirmButtonColor: "#d33",
          });
          return true; // Bloquear por seguridad
      }
  };
  // -------------------------------------------------------------------------

  const buscarEvento = async (codigo) => {
    if (!codigo) {
      Swal.fire({
        title: "Advertencia",
        text: "Por favor, ingrese un código de evento.",
        icon: "warning",
        confirmButtonColor: "#f8bb86",
      });
      setEventoCargado(false);
      setNombreEvento("");
      setMiembros([]);
      setEventoYaRegistrado(false); // Resetear
      return;
    }

    setIsLoadingEvento(true);
    setEventoCargado(false);
    setNombreEvento("");
    setMiembros([]);
    setEventoYaRegistrado(false); // Resetear al buscar un nuevo evento

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${codigo}`
      );
      if (res.status === 200) {
        setEventoCargado(true);
        setNombreEvento(res.data.nombre_eve);

        // --- LÓGICA PRINCIPAL: Verificar asistencia previa del evento ---
        const yaFueRegistrado = await verificarSiEventoTieneAsistenciaPrevia(codigo);
        console.log("Evento ya registrado:", yaFueRegistrado);
        setEventoYaRegistrado(yaFueRegistrado); // Actualizar estado

        if (yaFueRegistrado) {
          Swal.fire({
            title: "Asistencia Ya Registrada",
            text: `La asistencia para el evento "${res.data.nombre_eve}" (Código: ${codigo}) ya ha sido registrada previamente. No se pueden agregar más asistentes.`,
            icon: "info",
            confirmButtonColor: "#3085d6",
          });
          setMiembros([]); // Limpiar miembros, ya que no se puede registrar
          localStorage.removeItem(getLocalStorageKey(codigo)); // Opcional: Limpiar borrador si el evento ya está completado
          //Habilitar el campo de buscar evento
          setEventoCargado(false);
          setNombreEvento("");
          setValue("codigo_evento", "");
          setEventoYaRegistrado(false); // Asegurarse de resetear
        } else {
          // Si el evento NO ha sido registrado, intentar cargar el borrador
          const borradorCargado = cargarBorradorAsistencia(codigo);
          if (!borradorCargado) {
            Swal.fire({
              title: "Éxito",
              text: "Evento encontrado. No se encontró borrador de asistencia.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          }
        }
        // ---------------------------------------------------------------
      }
    } catch (error) {
      console.error("Error buscando evento:", error);
      Swal.fire({
        title: "Error",
        text: "Evento no encontrado o error al buscar.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      setEventoCargado(false);
      setNombreEvento("");
      setValue("codigo_evento", "");
      setMiembros([]);
      setEventoYaRegistrado(false); // Asegurarse de resetear
    } finally {
      setIsLoadingEvento(false);
    }
  };

  const agregarMiembro = () => {
    // Si el evento ya está registrado, no permitir agregar miembros
    if (eventoYaRegistrado) {
        Swal.fire({
            title: "Acción No Permitida",
            text: "No puedes agregar miembros porque la asistencia para este evento ya fue registrada.",
            icon: "warning",
            confirmButtonColor: "#d33",
        });
        return;
    }

    if (!selectedMiembro) {
      Swal.fire({
        title: "Advertencia",
        text: "Debes buscar y seleccionar un miembro de la lista antes de agregarlo.",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const { id_mie: id, nombre_mie: nombre, cedula_mie: cedulaMiembro } = selectedMiembro;

    // 1. Verificar si ya está en la lista de borrador (frontend)
    const miembroExistenteEnBorrador = miembros.find((member) => member.id_mie === id);
    if (miembroExistenteEnBorrador) {
      Swal.fire({
        title: "Error",
        text: "Este miembro ya ha sido agregado a la lista actual de asistencia.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      resetMemberSearchState();
      setValue("searchTermMiembro", "");
      return;
    }

    // Agrega el miembro a la lista
    setMiembros((prevMiembros) => [
      ...prevMiembros,
      { cedula: cedulaMiembro, nombre: nombre, id_mie: id },
    ]);

    resetMemberSearchState();
    setValue("searchTermMiembro", "");
  };

  const eliminarMiembro = (id_mie) => {
    // Si el evento ya está registrado, no permitir eliminar miembros (aunque esto sería raro, ya que no se agregarían)
    if (eventoYaRegistrado) {
        Swal.fire({
            title: "Acción No Permitida",
            text: "No puedes modificar la lista porque la asistencia para este evento ya fue registrada.",
            icon: "warning",
            confirmButtonColor: "#d33",
        });
        return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setMiembros((prevMiembros) =>
          prevMiembros.filter((member) => member.id_mie !== id_mie)
        );
        Swal.fire(
          'Eliminado!',
          'El miembro ha sido eliminado de la lista.',
          'success'
        );
      }
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    // Bloquear si el evento ya está registrado
    if (eventoYaRegistrado) {
        Swal.fire({
            title: "Registro Imposible",
            text: "La asistencia para este evento ya fue registrada y no se puede enviar de nuevo.",
            icon: "error",
            confirmButtonColor: "#d33",
        });
        return;
    }

    if (miembros.length === 0) {
      Swal.fire({
        title: "Advertencia",
        text: "Debe agregar al menos un miembro para registrar la asistencia.",
        icon: "warning",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const asistenciaData = miembros.map((miembro) => ({
        id_mie: miembro.id_mie,
        codigo_eve: data.codigo_evento,
        nombre_mie: miembro.nombre,
        cedula_mie: miembro.cedula,
      }));

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia`,
        { asistencia: asistenciaData }
      );

      if (res.status === 200) {
        Swal.fire({
          title: "Éxito",
          text: "La asistencia se registró correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        localStorage.removeItem(getLocalStorageKey(data.codigo_evento));
        router.push("/auth/dashboard");
      }
    } catch (error) {
      console.error("Error registrando asistencia:", error);
      let errorMessage = "Ocurrió un error al registrar la asistencia.";

      if (error.response && error.response.status === 409) {
          errorMessage = error.response.data.message || "Algunos miembros ya tienen asistencia registrada para este evento.";
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleCodigoEventoKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscarEvento(getValues("codigo_evento"));
    }
  };

  return (
    <div className="flex place-items-start justify-center p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Registro de Asistencia
          </h1>
          <p className="text-gray-600 mt-2">
            Busque el evento y luego agregue los miembros asistentes.
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          {/* Sección Buscar Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="codigo_evento">
              Buscar Evento por Código <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaBarcode
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="codigo_evento"
                  type="text"
                  placeholder="Ingrese código del evento"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  {...register("codigo_evento", {
                    required: {
                      value: true,
                      message: "El código del evento es requerido",
                    },
                  })}
                  disabled={isLoadingEvento || eventoCargado || eventoYaRegistrado} // <--- MODIFICADO
                  onKeyDown={handleCodigoEventoKeyDown}
                />
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Nombre del evento"
                  value={nombreEvento}
                  readOnly
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700"
                />
              </div>

              <div className="relative flex-1">
                <input
                  type="date"
                  placeholder="Fecha de Asistencia"
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700"
                />
              </div>

              <button
                type="button"
                onClick={() => buscarEvento(getValues("codigo_evento"))}
                className={`bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-300 flex items-center justify-center ${isLoadingEvento || !getValues("codigo_evento") || eventoCargado || eventoYaRegistrado ? 'opacity-50 cursor-not-allowed' : ''}`} // <--- MODIFICADO
                disabled={isLoadingEvento || !getValues("codigo_evento") || eventoCargado || eventoYaRegistrado} // <--- MODIFICADO
              >
                {isLoadingEvento ? <LuLoader2 className="animate-spin" size={20} /> : 'Buscar'}
              </button>
            </div>
            {errors.codigo_evento && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.codigo_evento.message}
              </span>
            )}
          </div>


          {/* Sección Agregar Miembros (visible solo si hay evento cargado Y NO ha sido registrado) */}
          {eventoCargado && !eventoYaRegistrado && ( 
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="searchTermMiembro">
                  Buscar Miembro por Cédula o Nombre <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LuSearch
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      id="searchTermMiembro"
                      type="text"
                      placeholder="Ingrese cédula o nombre del miembro"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      {...register("searchTermMiembro", {})}
                      disabled={isLoadingMiembro || eventoYaRegistrado} // <--- MODIFICADO
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && selectedMiembro && !eventoYaRegistrado) {
                              e.preventDefault();
                              agregarMiembro();
                          }
                      }}
                    />
                    {isLoadingMiembro && (
                        <LuLoader2 className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                    )}
                  </div>

                  {selectedMiembro && (
                    <div className="ml-4 flex-1 text-gray-700 p-2 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">Miembro Seleccionado:</p>
                      <p className="text-sm font-semibold">{selectedMiembro.nombre_mie} (ID: {selectedMiembro.id_mie})</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={agregarMiembro}
                    className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedMiembro || eventoYaRegistrado} // <--- MODIFICADO
                  >
                    Agregar
                  </button>
                </div>
                {errors.searchTermMiembro && (
                  <span className="text-red-600 text-sm mt-1 block">
                    {errors.searchTermMiembro.message}
                  </span>
                )}

                {/* Lista de resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <ul className="absolute z-10 w-[calc(50%-4px)] bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {searchResults.map((miembro) => (
                      <li
                        key={miembro.id_mie}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                        onClick={() => seleccionarMiembro(miembro)}
                      >
                        <span className="font-semibold">{miembro.nombre_mie}</span> {miembro.cedula_mie}
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Miembros Agregados ({miembros.length})</h2>
                  <button type="button" className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out w-48 disabled:opacity-50 disabled:cursor-not-allowed text-sm" disabled>
                    Resumen Asistencia
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                        <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                        <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {miembros.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">No hay miembros agregados aún.</td>
                        </tr>
                      ) : (
                        miembros.map((miembro) => (
                          <tr
                            key={miembro.id_mie}
                            className="hover:bg-gray-50"
                          >
                            <td className="py-3 px-6 text-left whitespace-nowrap text-sm text-gray-900">{miembro.id_mie}</td>
                            <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.cedula}</td>
                            <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.nombre}</td>
                            <td className="py-3 px-6 text-center text-sm">
                              <button
                                type="button"
                                onClick={() => eliminarMiembro(miembro.id_mie)}
                                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200 text-xs font-medium"
                                disabled={eventoYaRegistrado} // <--- MODIFICADO
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Mensaje de evento ya registrado, si aplica */}
          {eventoCargado && eventoYaRegistrado && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">¡Atención!</strong>
                <span className="block sm:inline ml-2">La asistencia para este evento ya ha sido registrada.</span>
                <p className="text-sm mt-1">No se pueden realizar más registros para este evento.</p>
            </div>
          )}


          {/* Botón Registrar Asistencia */}
          <button
            type="submit"
            className={`w-full bg-primary text-white rounded-lg py-3 px-4 hover:bg-primary-hover transition duration-300 ease-in-out text-lg font-semibold flex items-center justify-center gap-2 ${!eventoCargado || isSubmitting || miembros.length === 0 || eventoYaRegistrado ? 'opacity-50 cursor-not-allowed' : ''}`} // <--- MODIFICADO
            disabled={!eventoCargado || isSubmitting || miembros.length === 0 || eventoYaRegistrado} // <--- MODIFICADO
          >
            {isSubmitting ? <LuLoader2 className="animate-spin" size={20} /> : null}
            {isSubmitting ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarAsistencia;