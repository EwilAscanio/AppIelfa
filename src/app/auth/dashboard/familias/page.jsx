"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";
import Swal from 'sweetalert2';
import {
  RiUserLine,
  RiHashtag,
  RiSearchLine,
  RiArrowRightLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiGroupLine,
  RiAddLine,
  RiDeleteBinLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { MdCheckCircleOutline } from "react-icons/md";





const RegisterFamily = () => {
  const [jefeFound, setJefeFound] = useState(null);
  const [familyName, setFamilyName] = useState(''); // Almacena el nombre de la familia
  const [newFamilyId, setNewFamilyId] = useState(null); // Almacena el ID de la familia recién creada
  const [isSearching, setIsSearching] = useState(false);

  const [currentView, setCurrentView] = useState('search'); // 'search', 'register_family_name', 'register_members'

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

  
  // --- ETAPA 3: BUSCAR Y ASIGNAR MIEMBROS A LA FAMILIA ---
  const handleSearchAndAssignMembers = async (data) => {
    if (!jefeFound || !familyName) {
      Swal.fire({
        icon: 'error',
        title: 'Error Interno',
        text: "Faltan datos del jefe de familia o nombre de la familia."
      });
      return;
    }

    // Filtrar campos vacíos de miembros
    const membersToAssign = data.familyMembers
      .filter(m => m.nombre_mie && m.cedula_mie && m.parentesco);

    if (membersToAssign.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos Incompletos',
        text: "Debe agregar al menos un miembro válido (con nombre, cédula y parentesco)."
      });
      return;
    }

    // Paso 1: Registrar la familia
    const familyPayload = {
      nombre_fam: familyName,
      jefe_de_familia_id: jefeFound.id_mie,
    };

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

        // Paso 2: Buscar y asignar miembros existentes a la familia
        const assignMembersUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/familias/${familyId}/assign-members`;

        const assignResponse = await axios.post(assignMembersUrl, {
          members: membersToAssign
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
        handleSearchAndAssignMembers(data);
    }
  }, [currentView, jefeFound, familyName]);

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
          Paso 3: Registrar Otros Miembros de la Familia
      </h2>

      {/* Formulario Dinámico de Miembros */}
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">Miembro {index + 1}</h3>
                <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                >
                    <RiDeleteBinLine size={20} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nombre */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        {...register(`familyMembers.${index}.nombre_mie`, { required: "Nombre es requerido" })}
                    />
                    {errors.familyMembers?.[index]?.nombre_mie && (
                        <span className="text-red-600 text-xs mt-1 block">
                            {errors.familyMembers[index].nombre_mie.message}
                        </span>
                    )}
                </div>

                {/* Cédula */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cédula</label>
                    <input
                        type="text"
                        placeholder="Cédula"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        {...register(`familyMembers.${index}.cedula_mie`, { required: "Cédula es requerida" })}
                    />
                    {errors.familyMembers?.[index]?.cedula_mie && (
                        <span className="text-red-600 text-xs mt-1 block">
                            {errors.familyMembers[index].cedula_mie.message}
                        </span>
                    )}
                </div>

                {/* Parentesco */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Parentesco</label>
                    <div className="relative">
                        <select
                            className={`${baseSelectClass} bg-white`}
                            {...register(`familyMembers.${index}.parentesco`, { required: "Parentesco es requerido" })}
                        >
                            <option value="">Seleccione</option>
                            <option value="Cónyuge">Cónyuge</option>
                            <option value="Hijo/a">Hijo/a</option>
                            <option value="Padre/Madre">Padre/Madre</option>
                            <option value="Otro">Otro</option>
                        </select>
                        <RiArrowDownSLine className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.familyMembers?.[index]?.parentesco && (
                        <span className="text-red-600 text-xs mt-1 block">
                            {errors.familyMembers[index].parentesco.message}
                        </span>
                    )}
                </div>
            </div>
        </div>
      ))}

      {/* Botón para añadir miembro */}
      <button
        type="button"
        onClick={() => append({ nombre_mie: '', cedula_mie: '', parentesco: '' })}
        className="flex items-center justify-center w-full py-2 border-2 border-dashed border-purple-400 text-purple-600 rounded-lg hover:bg-purple-50 transition duration-200 mt-4"
      >
        <RiAddLine size={18} className="mr-2" />
        Añadir Otro Miembro
      </button>

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
  }, [currentView, isSearching, jefeFound, errors, fields, remove]);


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
            Flujo de 3 Pasos: Búsqueda $\rightarrow$ Registrar Nombre $\rightarrow$ Registrar Miembros.
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
