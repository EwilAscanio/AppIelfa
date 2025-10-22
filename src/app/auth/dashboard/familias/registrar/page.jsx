"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import Swal from 'sweetalert2';
import {
  RiUserLine,
  RiHashtag,
  RiSearchLine,
  RiArrowRightLine,
  RiGroupLine,
} from "react-icons/ri";
import { MdCheckCircleOutline } from "react-icons/md";
import MemberSearch from '@/components/MemberSearch';





const RegisterFamily = () => {
  const [jefeFound, setJefeFound] = useState(null);
  const [familyName, setFamilyName] = useState(''); // Almacena el nombre de la familia
  const [newFamilyId, setNewFamilyId] = useState(null); // Almacena el ID de la familia recién creada
  const [isSearching, setIsSearching] = useState(false);

  const [currentView, setCurrentView] = useState('search'); // 'search', 'register_family_name', 'register_members'

  // Estados para miembros agregados a la familia
  const [miembrosAgregados, setMiembrosAgregados] = useState([]); // Lista de miembros agregados para la familia

  // Debug: Log cuando cambia miembrosAgregados
  useEffect(() => {
    console.log("Estado miembrosAgregados cambió:", miembrosAgregados);
  }, [miembrosAgregados]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
    clearErrors,
  } = useForm({
    defaultValues: {
      familyMembers: [{ nombre_mie: '', cedula_mie: '', parentesco: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "familyMembers"
  });



  // Clase base para los estilos de los inputs
  const baseInputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200";
  const baseSelectClass = "w-full pl-3 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 appearance-none";
  const baseInputIconClass = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400";


  // --- ETAPA 1: BÚSQUEDA DEL JEFE ---
  const handleSearchJefe = async (data) => {
    setIsSearching(true);
    setJefeFound(null);

    const isCedula = /^\d+$/.test(data.search_term);

    if (!isCedula) {
      Swal.fire({
        icon: 'error',
        title: 'Entrada inválida',
        text: "Por favor ingrese solo el número de cédula para buscar al jefe de familia."
      });
      setIsSearching(false);
      return;
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/miembro/${data.search_term}`;

    Swal.fire({
      title: 'Buscando...',
      text: 'Buscando Jefe de Familia por cédula...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
        const response = await axios.get(apiUrl);

        console.log("Respuesta de búsqueda de jefe:", response.data);

        const jefe = response.data;

        if (jefe) {
            if (jefe.familiaId) {
                setJefeFound(null);
                Swal.fire({
                    icon: 'error',
                    title: 'Miembro ya pertenece a una familia',
                    text: `El miembro ${jefe.nombre_mie} ya pertenece a una familia (ID: ${jefe.familiaId}).`
                });
            } else {
                setJefeFound(jefe);
                setValue('search_term', '');
                setCurrentView('register_family_name'); // Transición a la etapa de registro de nombre

                Swal.fire({
                    icon: 'success',
                    title: '¡Miembro Encontrado!',
                    text: `${jefe.nombre_mie}. Procede a registrar el nombre de la nueva familia.`,
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        } else {
            Swal.fire({
              icon: 'error',
              title: 'Miembro no encontrado',
              text: "Jefe de Familia no encontrado. Verifique la cédula o nombre."
            });
            setJefeFound(null);
        }
    } catch (error) {
        let errorMessage = 'Error de conexión o configuración del servidor.';
        if (error.response) {
            errorMessage = error.response.data.message || `Error del servidor: ${error.response.status}`;
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
        setJefeFound(null);
    } finally {
        Swal.close();
        setIsSearching(false);
    }
  };


  // --- ETAPA 2: GUARDAR NOMBRE DE LA FAMILIA ---
  const handleSaveFamilyName = async (data) => {
    if (!jefeFound) return;

    // Solo guardar el nombre de la familia en el estado
    setFamilyName(data.nombre_fam);
    setValue('nombre_fam', ''); // Limpiar el campo del formulario
    setCurrentView('register_members'); // Transición al Paso 3

    Swal.fire({
        icon: 'success',
        title: 'Nombre Guardado',
        text: `Nombre de familia "${data.nombre_fam}" guardado. Ahora registra los miembros de la familia.`,
        timer: 3000,
        showConfirmButton: false
    });
  };

  
  // Callback para cuando se selecciona un miembro
  const handleMemberSelect = (miembro) => {
    // Aquí puedes hacer algo adicional si es necesario
    console.log("Miembro seleccionado:", miembro);
  };

  // Callback para cuando se agrega un miembro
  const handleAddMember = async (miembro) => {
    console.log("handleAddMember llamado con:", miembro);

    // Extrae los datos del miembro seleccionado.
    const {
        id_mie: id,
        nombre_mie: nombre,
        cedula_mie: cedulaMiembro,
    } = miembro;

    console.log("Datos extraídos:", { id, nombre, cedulaMiembro });

    // 2. Validación de duplicados en la lista local.
    const miembroExistenteEnFamilia = miembrosAgregados.find((member) => member.id_mie === id);
    if (miembroExistenteEnFamilia) {
      console.log("Miembro duplicado encontrado");
      Swal.fire({
        title: "Error",
        text: "Este miembro ya ha sido agregado a la lista actual de la familia.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      throw new Error("Miembro duplicado"); // Lanzar error para que no se limpie el campo
    }

    console.log("Mostrando modal de parentesco");

    // 3. Mostrar modal para seleccionar parentesco
    const result = await Swal.fire({
      title: 'Seleccionar Parentesco',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 15px;"><strong>Miembro:</strong> ${nombre} (${cedulaMiembro})</p>
          <label for="parentesco-select" style="display: block; margin-bottom: 8px; font-weight: bold;">Parentesco:</label>
          <select id="parentesco-select" class="swal2-input" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="">Seleccione parentesco</option>
            <option value="Cónyuge">Cónyuge</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Padre/Madre">Padre/Madre</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const parentesco = document.getElementById('parentesco-select').value;
        console.log("Parentesco seleccionado:", parentesco);
        if (!parentesco) {
          Swal.showValidationMessage('Debes seleccionar un parentesco');
          return false;
        }
        return parentesco;
      }
    });

    console.log("Resultado del modal:", result);

    if (result.isConfirmed) {
      const parentesco = result.value;
      console.log("Agregando miembro con parentesco:", parentesco);

      // 4. Actualización del estado local 'miembrosAgregados' con el parentesco.
      setMiembrosAgregados((prevMiembros) => {
        const nuevosMiembros = [
          ...prevMiembros,
          {
            cedula: cedulaMiembro,
            nombre: nombre,
            id_mie: id,
            parentesco: parentesco
          },
        ];
        console.log("Nuevo estado miembrosAgregados:", nuevosMiembros);
        return nuevosMiembros;
      });

      console.log("Miembro agregado exitosamente");
    } else {
      console.log("Usuario canceló la selección de parentesco");
      // Si el usuario cancela, lanzar error para que no se limpie el campo
      throw new Error("Usuario canceló la selección de parentesco");
    }
  };

  /**
   * Elimina un miembro de la lista de miembros agregados para la familia.
   * Incluye confirmación con SweetAlert2.
   */
  const eliminarMiembroDeFamilia = (id_mie) => {
    // 1. Confirmación.
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El miembro será eliminado de la lista de la familia.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 2. Actualización del estado local 'miembrosAgregados'.
        setMiembrosAgregados((prevMiembros) =>
          prevMiembros.filter((member) => member.id_mie !== id_mie)
        );
        Swal.fire(
          'Eliminado!',
          'El miembro ha sido eliminado de la lista de la familia.',
          'success'
        );
      }
    });
  };

  // --- ETAPA 3: REGISTRO DE FAMILIA Y ASIGNACIÓN DE MIEMBROS ---
  const handleRegisterFamilyAndAssignMembers = async () => {
    if (!jefeFound || !familyName) {
      Swal.fire({
        icon: 'error',
        title: 'Error Interno',
        text: "Faltan datos del jefe de familia o nombre de la familia."
      });
      return;
    }

    if (miembrosAgregados.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos Incompletos',
        text: "Debe agregar al menos un miembro a la familia."
      });
      return;
    }

    // Paso 1: Registrar la familia
    const familyPayload = {
      nombre_fam: familyName,
      cedula_jefe_fam: jefeFound.cedula_mie,
    };

    console.log("Payload para registrar familia:", familyPayload);

    const familyApiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/familias`;

    Swal.fire({
      title: 'Registrando Familia...',
      text: 'Creando la familia y asignando miembros...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Registrar familia
      const familyResponse = await axios.post(familyApiUrl, familyPayload);

      if (familyResponse.status === 201 || familyResponse.status === 200) {
        const familyId = familyResponse.data.familyId || familyResponse.data.id;

        // Paso 2: Asignar miembros a la familia
        const assignMembersUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/familias/${familyId}/assign-members`;

        const assignResponse = await axios.post(assignMembersUrl, {
          members: miembrosAgregados
        });

        if (assignResponse.status === 201 || assignResponse.status === 200) {
          const results = assignResponse.data.results || [];
          const assignedCount = results.filter(r => r.success).length;
          const failedCount = results.filter(r => !r.success).length;

          let message = `Familia "${familyName}" creada. `;
          if (assignedCount > 0) {
            message += `Se asignaron ${assignedCount} miembros.`;
          }
          if (failedCount > 0) {
            message += ` ${failedCount} miembros no pudieron ser asignados (no encontrados o ya pertenecen a otra familia).`;
          }

          Swal.fire({
              icon: assignedCount > 0 ? 'success' : 'warning',
              title: '¡Proceso Completado!',
              text: message,
              timer: 4000,
              showConfirmButton: false
          });

          // Reiniciar todo el proceso
          setJefeFound(null);
          setFamilyName('');
          setNewFamilyId(null);
          setMiembrosAgregados([]);
          setCurrentView('search');
          reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al Asignar Miembros',
            text: assignResponse.data.message || "La familia se creó pero hubo un error al asignar los miembros."
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al Crear Familia',
          text: familyResponse.data.message || "Ocurrió un error al crear la familia."
        });
      }
    } catch (error) {
      let errorMessage = 'Error de conexión o configuración del servidor.';
      if (error.response) {
        errorMessage = error.response.data.message || `Error del servidor: ${error.response.status}`;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    } finally {
      Swal.close();
    }
  };

  // Función principal de envío del formulario basada en la vista actual
  const onSubmit = useCallback((data) => {
    if (currentView === 'search') {
        handleSearchJefe(data);
    } else if (currentView === 'register_family_name') {
        handleSaveFamilyName(data);
    } else if (currentView === 'register_members') {
        handleRegisterFamilyAndAssignMembers();
    }
  }, [currentView, jefeFound, familyName, miembrosAgregados]);

  // --- RENDERS CONDICIONALES ---

  const renderJefeInfo = (title, showButton = true) => (
    <div className="p-4 mb-6 bg-purple-100 border-l-4 border-purple-500 rounded-lg text-purple-800 flex items-center justify-between shadow-md">
        <div className='flex items-center'>
             <RiUserLine className="mr-3 h-5 w-5" />
             <span className="font-semibold">{title}:</span>
             <span className="ml-2 font-bold">{jefeFound.nombre_mie} (C.I: {jefeFound.cedula_mie})</span>
        </div>
        {showButton && (
            <button
                type="button"
                onClick={() => {
                    setJefeFound(null);
                    setFamilyName(''); // Limpiar nombre de familia
                    setCurrentView('search');
                    setNewFamilyId(null); // Asegurar reinicio completo
                    reset();
                    clearErrors();
                }}
                className="text-purple-800 hover:text-purple-900 font-medium text-sm transition bg-purple-200 px-3 py-1 rounded-full"
            >
                Cambiar Jefe
            </button>
        )}
    </div>
  );

  const renderFamilyNameRegistration = () => (
    <div className="mt-8">
        {renderJefeInfo("Jefe de Familia Seleccionado")}
        
        <h2 className="text-xl font-semibold text-purple-600 mb-4 border-b pb-2 flex items-center">
            <RiGroupLine className="mr-2" size={20} />
            Paso 2: Datos de la Nueva Familia
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Familia *
                </label>
                <div className="relative">
                    <RiGroupLine
                        className={baseInputIconClass}
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Ej: Familia Pérez Rodríguez"
                        className={baseInputClass}
                        {...register("nombre_fam", {
                            required: "El nombre de la familia es requerido",
                            minLength: {
                                value: 3,
                                message: "Debe tener al menos 3 caracteres",
                            },
                        })}
                    />
                </div>
                {errors.nombre_fam && (
                    <span className="text-red-600 text-sm mt-1 block">
                        {errors.nombre_fam.message}
                    </span>
                )}
            </div>
        </div>

        <div className="mt-10">
            <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center text-lg font-bold shadow-lg transform hover:scale-[1.01]"
            >
                Registrar Nombre de Familia y Continuar
                <RiArrowRightLine className="ml-2" size={20} />
            </button>
        </div>
    </div>
  );

  const renderMemberRegistration = () => (
    <div className="mt-8">

      {/* Información de la familia */}
      <div className="p-4 mb-6 bg-blue-100 border-l-4 border-blue-600 rounded-lg text-blue-800 shadow-md">
        <p className="font-semibold flex items-center">
            <RiGroupLine className="mr-2 h-5 w-5" />
            Familia: <span className="ml-2 font-bold">{familyName}</span>
        </p>
        <p className="text-sm mt-1">
            <RiUserLine className="inline h-4 w-4 mr-1" />
            Jefe: {jefeFound.nombre_mie}
        </p>
      </div>

      <h2 className="text-xl font-semibold text-purple-600 mb-4 border-b pb-2 flex items-center">
          <RiUserLine className="mr-2" size={20} />
          Paso 3: Buscar y Agregar Miembros a la Familia
      </h2>

      {/* Componente de Búsqueda de Miembro */}
      <MemberSearch
        control={control}
        register={register}
        setValue={setValue}
        name="searchTermMiembro"
        label="Buscar Miembro por Cédula o Nombre"
        placeholder="Ingrese cédula o nombre del miembro"
        required={true}
        onMemberSelect={handleMemberSelect}
        onAddClick={handleAddMember}
        addButtonText="Agregar"
        showSelectedDisplay={true}
        showAddButton={true}
      />

      {/* Tabla de Miembros Agregados */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Miembros Agregados ({miembrosAgregados.length})</h3>
          
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {miembrosAgregados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">No hay miembros agregados aún.</td>
                </tr>
              ) : (
                miembrosAgregados.map((miembro) => (
                  <tr
                    key={miembro.id_mie}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap text-sm text-gray-900">{miembro.id_mie}</td>
                    <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.cedula}</td>
                    <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.nombre}</td>
                    <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.parentesco}</td>
                    <td className="py-3 px-6 text-center text-sm">
                      <button
                        type="button"
                        onClick={() => eliminarMiembroDeFamilia(miembro.id_mie)}
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

      {/* Botón de Envío Final */}
      <div className="mt-10">
          <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center text-lg font-bold shadow-lg transform hover:scale-[1.01]"
          >
              Finalizar Registro de Familia y Miembros
              <MdCheckCircleOutline className="ml-2" size={20} />
          </button>
      </div>

    </div>
  );
  
  // --- RENDER PRINCIPAL ---
  const renderCurrentView = useMemo(() => {
    if (currentView === 'search') {
      return (
        <div className="mb-8 p-6 bg-purple-50 border-l-4 border-purple-400 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-purple-600 mb-4 flex items-center">
                <RiSearchLine className="mr-2" size={20} />
                Paso 1: Buscar Jefe de Familia
            </h2>
            <div className="grid grid-cols-1 gap-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula del Jefe de Familia *
                </label>
                <div className="relative">
                    <RiHashtag
                        className={baseInputIconClass}
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Ingrese la cédula (Ej: 16501654)"
                        className={baseInputClass}
                        {...register("search_term", {
                            required: "Debe ingresar la cédula para buscar",
                            pattern: {
                                value: /^\d+$/,
                                message: "Solo se permiten números (cédula)"
                            },
                            minLength: {
                                value: 3,
                                message: "La cédula debe tener al menos 3 dígitos"
                            },
                        })}
                    />
                </div>
                {errors.search_term && (
                    <span className="text-red-600 text-sm mt-1 block">
                        {errors.search_term.message}
                    </span>
                )}

                <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 flex items-center justify-center text-lg font-bold shadow-lg mt-4 disabled:opacity-50"
                >
                    {isSearching ? 'Buscando...' : 'Buscar Miembro'}
                    <RiSearchLine className="ml-2" size={20} />
                </button>
            </div>
        </div>
      );
    } else if (currentView === 'register_family_name') {
      return renderFamilyNameRegistration();
    } else if (currentView === 'register_members') {
      return renderMemberRegistration();
    }
    return null; // Caso por defecto
  }, [currentView, isSearching, jefeFound, errors, fields, remove, miembrosAgregados]);


  return (
    <div className="flex justify-center place-items-start p-4 min-h-screen bg-gray-100 font-sans">
      


      {/* Contenedor del formulario */}
      <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl w-full">
        {/* Título y subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-purple-700 mb-2">
            Gestión de Registro de Familia
          </h1>
          <p className="text-gray-600 text-md">
            Flujo de 3 Pasos:   🔍  Búsqueda  🧑‍💼 Registrar Nombre  ✏️ Registrar Miembros.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
            {renderCurrentView}
        </form>

        {/* Barra de progreso visual (Opcional, pero útil) */}
        <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs font-medium text-gray-500">
                <span className={currentView === 'search' ? 'text-purple-600 font-bold' : ''}>Paso 1</span>
                <span className={currentView === 'register_family_name' ? 'text-purple-600 font-bold' : ''}>Paso 2</span>
                <span className={currentView === 'register_members' ? 'text-purple-600 font-bold' : ''}>Paso 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div 
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                        width: currentView === 'search' ? '33%' : 
                               currentView === 'register_family_name' ? '66%' : 
                               '100%' 
                    }}
                ></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFamily;
