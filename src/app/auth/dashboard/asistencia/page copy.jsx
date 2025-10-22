"use client";

import axios from "axios";
import Swal from "sweetalert2";
import { FaBarcode } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { RiLoader2Line } from "react-icons/ri";

const RegistrarAsistencia = () => {
  // Inicialización del hook de enrutamiento de Next.js
  const router = useRouter();

  // Inicialización de react-hook-form para la gestión del formulario
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    control,
  } = useForm({
    // Establece la fecha de asistencia por defecto a la fecha actual en formato YYYY-MM-DD
    defaultValues: {
      fecha_asi: new Date().toISOString().split('T')[0],
    },
  });

  // ===================================================================
  // 💾 ESTADOS LOCALES DEL COMPONENTE
  // ===================================================================

  // Estado para verificar si un evento ha sido cargado con éxito.
  const [eventoCargado, setEventoCargado] = useState(false);
  // Estado para almacenar y mostrar el nombre del evento.
  const [nombreEvento, setNombreEvento] = useState("");

  // Almacena el miembro seleccionado de los resultados de búsqueda, incluyendo 'fecha_nac'.
  const [selectedMiembro, setSelectedMiembro] = useState(null); 
  // Almacena los resultados de la búsqueda de miembros en tiempo real.
  const [searchResults, setSearchResults] = useState([]);
  // Lista final de miembros asistentes para el evento (el borrador). Incluye 'fecha_nac'.
  const [miembros, setMiembros] = useState([]); 

  // ESTADO PARA EL MODO DE ANULACIÓN (Override Mode): permite modificar listas cerradas.
  const [isOverrideMode, setIsOverrideMode] = useState(false); 

  // Estados de carga para mostrar spinners.
  const [isLoadingEvento, setIsLoadingEvento] = useState(false);
  const [isLoadingMiembro, setIsLoadingMiembro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para indicar si la asistencia del evento ya fue registrada (cerrada).
  const [eventoYaRegistrado, setEventoYaRegistrado] = useState(false);

  // Observa el valor del campo de búsqueda de miembros en tiempo real.
  const watchedSearchTerm = useWatch({ control, name: 'searchTermMiembro' });

  // Referencias para manejar el "debounce" (retraso) en la búsqueda y evitar llamadas excesivas a la API.
  const debounceTimerRef = useRef(null);
  // Ref para evitar que el useEffect de búsqueda se dispare cuando se establece el valor de un miembro seleccionado.
  const isSettingValueRef = useRef(false);


  // ===================================================================
  // 🔄 FUNCIONES DE UTILIDAD PARA EL RESUMEN
  // ===================================================================

  /**
   * Calcula la edad de una persona en años a partir de su fecha de nacimiento.
   * Maneja el formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) extrayendo solo la fecha (YYYY-MM-DD) 
   * para evitar problemas de zona horaria en el cálculo.
   */
  const calcularEdad = (fechaNacimiento) => {
    
    if (!fechaNacimiento) return null;
    const today = new Date();
    // Extrae YYYY-MM-DD para forzar la interpretación de la fecha de nacimiento en UTC/medianoche local.
    const fechaNacimientoBase = fechaNacimiento.split('T')[0];
    const birthDate = new Date(fechaNacimientoBase); 
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Ajuste para corregir la edad si el cumpleaños de este año aún no ha pasado.
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  /**
   * Muestra un resumen de la asistencia clasificado por edad (Niños <10, Adultos >=10).
   * Utiliza SweetAlert2 para mostrar el resultado.
   */
  const mostrarResumenAsistencia = () => {
    const totalMiembros = miembros.length;
    let ninosCount = 0; // Menores de 10 años
    let adultosCount = 0; // 10 años o más
    let sinFechaCount = 0;

    // Itera sobre la lista actual de miembros para calcular las categorías.
    miembros.forEach(miembro => {
        const edad = calcularEdad(miembro.fecha_nac); 

        if (edad === null || isNaN(edad)) {
            sinFechaCount++;
        } else if (edad < 10) {
            ninosCount++;
        } else {
            adultosCount++;
        }
    });

    // Construye el HTML para mostrar el resumen en el modal.
    const resumenHtml = `
        <div style="text-align: left; font-size: 16px;">
            <p style="font-weight: bold; margin-bottom: 10px;">📊 Resumen de la Lista Actual:</p>
            <hr style="margin-bottom: 10px; border-top: 1px solid #ccc;">
            <p style="padding: 4px 0;">👥 Total de Asistentes: <strong style="float: right; color: #1e40af;">${totalMiembros}</strong></p>
            <p style="padding: 4px 0;">👶 Niños (Menores de 10 años): <strong style="float: right; color: #10b981;">${ninosCount}</strong></p>
            <p style="padding: 4px 0;">🧑 Adultos (10 años o más): <strong style="float: right; color: #f59e0b;">${adultosCount}</strong></p>
            ${sinFechaCount > 0 ? `<hr style="margin-top: 10px; border-top: 1px solid #ccc;"><p style="margin-top: 10px; color: #dc2626;">⚠️ Sin Fecha de Nacimiento: <strong style="float: right;">${sinFechaCount}</strong></p>` : ''}
        </div>
    `;

    // Muestra el modal con el resumen.
    Swal.fire({
        title: 'Clasificación de Asistentes',
        html: resumenHtml,
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Cerrar'
    });
  };

  // ===================================================================
  // 🎯 CARGA Y GESTIÓN DE MIEMBROS
  // ===================================================================

  /**
   * Carga el borrador de asistencia para un evento específico desde la base de datos.
   * Asume que la API de borrador hace un JOIN para devolver la 'fecha_nac'.
   */
  const cargarBorradorAsistencia = useCallback(async (codigo) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia/borrador/${codigo}`);
      console.log("Respuesta del borrador:", res);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Mapea los datos del borrador, asumiendo que vienen con 'fecha_nac'.
        setMiembros(res.data.map(m => ({
            cedula: m.cedula_mie,
            nombre: m.nombre_mie,
            id_mie: m.id_mie,
            fecha_nac: m.fechanacimiento_mie // Asume que el campo se llama 'fechanacimiento_mie' en el objeto devuelto.
        })));

        Swal.fire({
          title: "Borrador Cargado",
          text: `Se ha cargado un borrador de ${res.data.length} asistentes para este evento desde la base de datos.`,
          icon: "info",
          confirmButtonColor: "#3085d6",
        });
        return true;
      }
    } catch (e) {
      console.error("Error al cargar el borrador desde la base de datos:", e);
    }
    setMiembros([]);
    return false;
  }, []);


  /**
   * Hook useEffect para manejar la búsqueda de miembros en tiempo real (debounced search).
   * Se ejecuta cada vez que 'watchedSearchTerm' cambia después de un breve retraso.
   */
  useEffect(() => {
    // Evita la ejecución si el valor se está configurando programáticamente (al seleccionar un miembro).
    if (isSettingValueRef.current) {
      return;
    }
    // Resetea los resultados de búsqueda y el miembro seleccionado al iniciar una nueva búsqueda.
    setSearchResults([]);
    setSelectedMiembro(null);
    // Limpia el temporizador anterior.
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const searchTerm = watchedSearchTerm?.trim();

    // No inicia la búsqueda si el término es muy corto.
    if (!searchTerm || searchTerm.length < 4) {
      setIsLoadingMiembro(false);
      return;
    }

    setIsLoadingMiembro(true);
    // Establece el nuevo temporizador de debounce.
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Llama a la API de búsqueda de miembros.
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia?query=${(searchTerm)}`
        );
        console.log("Respuesta de la búsqueda:", res);
        console.log("Término de búsqueda:", searchTerm);
        
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
    }, 500); // Retraso de 500ms

    // Función de limpieza que se ejecuta al desmontar o antes de un nuevo cambio.
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watchedSearchTerm]); // Dependencia: el término de búsqueda observado.


  /**
   * Selecciona un miembro de la lista de resultados de búsqueda, actualiza el campo de entrada 
   * con su cédula/nombre y limpia los resultados.
   */
  const seleccionarMiembro = (miembro) => {
    isSettingValueRef.current = true;
    setSelectedMiembro(miembro); 
    // Muestra la cédula o nombre del miembro en el campo de búsqueda.
    setValue("searchTermMiembro", miembro.cedula_mie || miembro.nombre_mie, { shouldValidate: true });
    setSearchResults([]);
    // Restablece la ref para permitir futuras búsquedas.
    setTimeout(() => {
      isSettingValueRef.current = false;
    }, 50);
  };

  // Limpia el estado del miembro seleccionado y los resultados de búsqueda.
  const resetMemberSearchState = () => {
    setSelectedMiembro(null);
    setSearchResults([]);
  };

  /**
   * Agrega el miembro seleccionado al borrador local y lo persiste en la base de datos.
   * Incluye validación para el modo de anulación y duplicados.
   */
  const agregarMiembro = async () => {
    // 1. Validación de modo de anulación.
    if (eventoYaRegistrado && !isOverrideMode) { 
      Swal.fire({
        title: "Acción No Permitida",
        text: "No puedes agregar miembros porque la asistencia para este evento ya fue registrada. Habilita el modo de modificación si es necesario.",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // 2. Validación de miembro seleccionado.
    if (!selectedMiembro) {
      Swal.fire({
        title: "Advertencia",
        text: "Debes buscar y seleccionar un miembro de la lista antes de agregarlo.",
        icon: "warning",
        confirmButtonColor: "#f8bb86",
      });
      return;
    }

    // Extrae los datos del miembro seleccionado.
    const { 
        id_mie: id, 
        nombre_mie: nombre, 
        cedula_mie: cedulaMiembro,
        fecha_nac_mie: fechaNacimiento // Se extrae la fecha de nacimiento (asumido en la API de búsqueda).
    } = selectedMiembro;

    const codigo_eve = getValues("codigo_evento");

    // 3. Validación de duplicados en la lista local.
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

    // 4. Persistencia en el borrador de la base de datos.
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia/borrador`, {
        codigo_eve,
        id_mie: id,
      });
      
      // 5. Actualización del estado local 'miembros' con la fecha de nacimiento.
      setMiembros((prevMiembros) => [
        ...prevMiembros,
        { 
            cedula: cedulaMiembro, 
            nombre: nombre, 
            id_mie: id,
            fecha_nac: fechaNacimiento // <-- Incluido en el estado para el resumen de edad
        },
      ]);
    } catch (error) {
      console.error("Error al agregar miembro al borrador:", error);
      Swal.fire("Error", "No se pudo agregar el miembro al borrador en la base de datos.", "error");
    }

    // 6. Limpieza y reinicio del estado de búsqueda.
    resetMemberSearchState();
    setValue("searchTermMiembro", "");
  };

  /**
   * Elimina un miembro del borrador local y lo borra de la base de datos.
   * Incluye confirmación con SweetAlert2.
   */
  const eliminarMiembro = (id_mie) => {
    // 1. Validación de modo de anulación.
    if (eventoYaRegistrado && !isOverrideMode) { 
      Swal.fire({
        title: "Acción No Permitida",
        text: "No puedes modificar la lista porque la asistencia para este evento ya fue registrada. Habilita el modo de modificación si es necesario.",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // 2. Confirmación.
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El miembro será eliminado de la lista de borrador.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 3. Eliminación del borrador en la DB.
        try {
          const codigo_eve = getValues("codigo_evento");
          await axios.delete(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia/borrador`, {
            data: { codigo_eve, id_mie }
          });
          // 4. Actualización del estado local 'miembros'.
          setMiembros((prevMiembros) =>
            prevMiembros.filter((member) => member.id_mie !== id_mie)
          );
          Swal.fire(
            'Eliminado!',
            'El miembro ha sido eliminado de la lista de borrador.',
            'success'
          );
        } catch (error) {
          console.error("Error al eliminar miembro del borrador:", error);
          Swal.fire("Error", "No se pudo eliminar el miembro del borrador de la base de datos.", "error");
        }
      }
    });
  };
  
  /**
   * Llama a la API para verificar si el evento ya tiene registros finales de asistencia.
   */
  const verificarSiEventoTieneAsistenciaPrevia = async (codigoEvento) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/asistenciaporevento/asistencia?codigoEvento=${codigoEvento}`
      );

      // Si la respuesta incluye asistencias, el evento ya está registrado.
      if (Array.isArray(res.data.asistencias) && res.data.asistencias.length > 0) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al verificar asistencia previa del evento:", error);
      Swal.fire({
        title: "Error de Verificación",
        text: "Hubo un problema al verificar la asistencia del evento. Intente de nuevo.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      // Devuelve true en caso de error para evitar la sobrescritura accidental.
      return true; 
    }
  };


  /**
   * Función principal para buscar y cargar un evento por código.
   * Maneja la carga del borrador y la verificación de asistencia previa.
   */
  const buscarEvento = async (codigo) => {
    // 1. Validación de código.
    if (!codigo) {
      Swal.fire({
        title: "Advertencia",
        text: "Por favor, ingrese un código de evento.",
        icon: "warning",
        confirmButtonColor: "#f8bb86",
      });
      // Reinicia estados
      setEventoCargado(false);
      setNombreEvento("");
      setMiembros([]);
      setEventoYaRegistrado(false);
      setIsOverrideMode(false); 
      return;
    }

    // 2. Reinicio de estados y activación de carga.
    setIsLoadingEvento(true);
    setEventoCargado(false);
    setNombreEvento("");
    setMiembros([]);
    setEventoYaRegistrado(false);
    setIsOverrideMode(false); 

    try {
      // 3. Llamada a la API para obtener los datos del evento.
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/evento/${codigo}`
      );

      if (res.status === 200) {

        setEventoCargado(true);
        setNombreEvento(res.data.nombre_eve);

        // 4. Verifica si ya existe asistencia final registrada.
        const yaFueRegistrado = await verificarSiEventoTieneAsistenciaPrevia(codigo);

        setEventoYaRegistrado(yaFueRegistrado);

        if (yaFueRegistrado) {
          // Si ya está registrado, carga el borrador (para ver la lista anterior) y notifica al usuario.
          await cargarBorradorAsistencia(codigo);

          Swal.fire({
            title: "Asistencia Ya Registrada",
            text: `La asistencia para el evento "${res.data.nombre_eve}" (Código: ${codigo}) ya ha sido registrada previamente. Se habilita la opción de "Modificación Manual".`,
            icon: "info",
            confirmButtonColor: "#3085d6",
          });
          
        } else {
          // Si no está registrado, carga el borrador existente si lo hay.
          await cargarBorradorAsistencia(codigo);
          Swal.fire({
            title: "Éxito",
            text: "Evento encontrado. Borrador cargado desde la base de datos.",
            icon: "success",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    } catch (error) {
      // Manejo de errores de búsqueda del evento.
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
      setEventoYaRegistrado(false);
      setIsOverrideMode(false);
    } finally {
      // Desactiva el estado de carga.
      setIsLoadingEvento(false);
    }
  };

  /**
   * Activa el Modo de Anulación (Override Mode) para permitir modificaciones en un evento ya registrado.
   * Muestra una advertencia al usuario.
   */
  const toggleOverrideMode = async () => {
    const result = await Swal.fire({
        title: "¿Modificar Asistencia Cerrada?",
        text: "La asistencia ya fue registrada. Habilitar esta opción permite añadir/eliminar miembros. ¿Continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, modificar",
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        setIsOverrideMode(true);
        Swal.fire(
            'Modo Habilitado',
            'Ahora puedes agregar y eliminar miembros al borrador. Recuerda registrar la asistencia nuevamente al finalizar.',
            'info'
        );
    }
  };

  /**
   * Maneja el envío del formulario para registrar la asistencia final.
   */
  const onSubmit = handleSubmit(async (data) => {
    // 1. Validación de modo de anulación.
    if (eventoYaRegistrado && !isOverrideMode) { 
      Swal.fire({
        title: "Registro Imposible",
        text: "La asistencia para este evento ya fue registrada y no se puede enviar de nuevo. Utiliza el modo de modificación si necesitas ajustes.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    // 2. Validación de lista vacía.
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
      // 3. Prepara los datos para el registro final de asistencia.
      const asistenciaData = miembros.map((miembro) => ({
        id_mie: miembro.id_mie,
        codigo_eve: data.codigo_evento,
        nombre_mie: miembro.nombre,
        cedula_mie: miembro.cedula,
        fecha_asi: data.fecha_asi,
      }));

      // 4. Llama a la API para registrar la asistencia.
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia`,
        { asistencia: asistenciaData }
      );

      if (res.status === 200) {
        // 5. Éxito: notifica y elimina el borrador.
        Swal.fire({
          title: "Éxito",
          text: "La asistencia se registró correctamente.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        // Borra el borrador después del registro exitoso.
        await axios.delete(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistencia/borrador/${data.codigo_evento}`);
        // Redirige al dashboard.
        router.push("/auth/dashboard");
      }
    } catch (error) {
      // 6. Manejo de errores durante el registro.
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

  // Permite buscar el evento presionando Enter en el campo de código.
  const handleCodigoEventoKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      buscarEvento(getValues("codigo_evento"));
    }
  };


  // ===================================================================
  // 🎨 RENDERIZADO DEL COMPONENTE
  // ===================================================================
  return (
    <div className="flex place-items-start justify-center p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Registro de Asistencia
          </h1>
          <p className="text-gray-600 mt-2">
            Busque el evento y luego agregue los miembros asistentes.
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          
          {/* Sección de Búsqueda de Evento y Fecha */}
          <div className="flex flex-wrap items-end gap-4">
            
            {/* Campo Código del Evento */}
            <div className="relative flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="codigo_evento">
                Código del Evento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaBarcode
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="codigo_evento"
                  type="text"
                  placeholder="Ingrese código del evento"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  {...register("codigo_evento", {
                    required: {
                      value: true,
                      message: "El código del evento es requerido",
                    },
                  })}
                  // Deshabilita si está cargando o el evento ya está cargado y no está en modo override
                  disabled={isLoadingEvento || (eventoCargado && !isOverrideMode)} 
                  onKeyDown={handleCodigoEventoKeyDown}
                />
              </div>
              {errors.codigo_evento && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.codigo_evento.message}
                </span>
              )}
            </div>

            {/* Campo Nombre del Evento (Solo Lectura) */}
            <div className="relative flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre_evento_display">
                Nombre del Evento
              </label>
              <input
                id="nombre_evento_display"
                type="text"
                placeholder="Nombre del evento"
                value={nombreEvento}
                readOnly
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-700"
              />
            </div>

            {/* Campo Fecha de Asistencia */}
            <div className="relative min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fecha_asi">
                Fecha de Asistencia <span className="text-red-500">*</span>
              </label>
              <input
                id="fecha_asi"
                type="date"
                {...register("fecha_asi", {
                  required: "La fecha de asistencia es requerida",
                })}
                disabled={eventoYaRegistrado && !isOverrideMode}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.fecha_asi && (
                <span className="text-red-600 text-sm mt-1 block">
                  {errors.fecha_asi.message}
                </span>
              )}
            </div>

            {/* Botón Buscar Evento */}
            <button
              type="button"
              onClick={() => buscarEvento(getValues("codigo_evento"))}
              className={`bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-hover transition duration-300 flex items-center justify-center h-10 ${isLoadingEvento || !getValues("codigo_evento") || (eventoCargado && !isOverrideMode && eventoYaRegistrado) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoadingEvento || !getValues("codigo_evento") || (eventoCargado && !isOverrideMode && eventoYaRegistrado)}
            >
              {isLoadingEvento ? <RiLoader2Line className="animate-spin" size={20} /> : 'Buscar'}
            </button>
          </div>


          
          {/* Sección de Búsqueda y Lista de Miembros (Visible si el evento está cargado y permite edición) */}
          {eventoCargado && (!eventoYaRegistrado || isOverrideMode) && (
            <>
              {/* Campo de Búsqueda de Miembro */}
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary disabled:bg-gray-100 disabled:cursor-not-allowed"
                      {...register("searchTermMiembro", {})}
                      disabled={isLoadingMiembro}
                      onKeyDown={(e) => {
                        // Permite agregar miembro presionando Enter si ya hay uno seleccionado
                        if (e.key === 'Enter' && selectedMiembro) {
                          e.preventDefault();
                          agregarMiembro();
                        }
                      }}
                    />
                    {isLoadingMiembro && (
                      <LuSearch className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                    )}
                  </div>

                  {/* Display del miembro seleccionado */}
                  {selectedMiembro && (
                    <div className="ml-4 flex-1 text-gray-700 p-2 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-xs font-medium text-gray-500">Miembro Seleccionado:</p>
                      <p className="text-sm font-semibold">{selectedMiembro.nombre_mie} (ID: {selectedMiembro.id_mie})</p>
                    </div>
                  )}

                  {/* Botón Agregar Miembro */}
                  <button
                    type="button"
                    onClick={agregarMiembro}
                    className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedMiembro}
                  >
                    Agregar
                  </button>
                </div>
                {/* Resultados de Búsqueda (Dropdown) */}
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


              {/* Tabla de Miembros Agregados */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Miembros Agregados ({miembros.length})</h2>
                  
                  {/* Botón para mostrar el Resumen de Asistencia */}
                  <button 
                    type="button" 
                    onClick={mostrarResumenAsistencia} 
                    className="bg-primary text-white py-2 px-4 rounded-lg shadow-lg hover:bg-primary-hover transition duration-300 ease-in-out w-48 disabled:opacity-50 disabled:cursor-not-allowed text-sm" 
                    disabled={miembros.length === 0} 
                  >
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

          
          {/* Mensaje de Asistencia Cerrada / Modo de Anulación */}
          {eventoCargado && eventoYaRegistrado && (
            <div className={`px-4 py-3 rounded relative ${isOverrideMode ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'}`} role="alert">
              <strong className="font-bold">¡Asistencia Cerrada!</strong>
              <span className="block sm:inline ml-2">La asistencia ya fue registrada.</span>
              
              {isOverrideMode ? (
                  <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Modo de Modificación **ACTIVO**.</p>
                      <button
                          type="button"
                          onClick={() => setIsOverrideMode(false)}
                          className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200 text-xs font-medium"
                      >
                          Desactivar Modo
                      </button>
                  </div>
              ) : (
                  <div className="mt-2">
                      <p className="text-sm mt-1 mb-2">Habilite el modo de modificación manual para realizar ajustes post-cierre.</p>
                      <button
                          type="button"
                          onClick={toggleOverrideMode}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out text-sm font-semibold"
                      >
                          Habilitar Modificación Manual
                      </button>
                  </div>
              )}
            </div>
          )}

          
          {/* Botón de Envío Final */}
          <button
            type="submit"
            className={`w-full bg-primary text-white rounded-lg py-3 px-4 hover:bg-primary-hover transition duration-300 ease-in-out text-lg font-semibold flex items-center justify-center gap-2 ${!eventoCargado || isSubmitting || miembros.length === 0 || (eventoYaRegistrado && !isOverrideMode) ? 'opacity-50 cursor-not-allowed' : ''}`}
            // El botón se deshabilita si: el evento no está cargado, está enviando, la lista está vacía, O el evento está registrado y el modo override está apagado.
            disabled={!eventoCargado || isSubmitting || miembros.length === 0 || (eventoYaRegistrado && !isOverrideMode)}
          >
            {isSubmitting ? <RiLoader2Line className="animate-spin" size={20} /> : null}
            {isSubmitting ? 'Registrando...' : 'Registrar Asistencia'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarAsistencia;