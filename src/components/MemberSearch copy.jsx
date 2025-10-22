import React, { useState, useEffect, useRef } from 'react';
import { useWatch } from "react-hook-form";
import axios from "axios";
import { LuSearch } from "react-icons/lu";

/**
 * Componente reutilizable para búsqueda de miembros
 * Permite buscar miembros por cédula o nombre con búsqueda en tiempo real
 *
 * Props:
 * - control: Control de react-hook-form
 * - setValue: Función setValue de react-hook-form
 * - name: Nombre del campo en el formulario
 * - label: Etiqueta del campo
 * - placeholder: Placeholder del input
 * - onMemberSelect: Callback cuando se selecciona un miembro
 * - disabled: Si el componente está deshabilitado
 * - required: Si el campo es requerido
 * - showSelectedDisplay: Si mostrar el panel de miembro seleccionado
 * - showAddButton: Si mostrar el botón de agregar
 * - addButtonText: Texto del botón de agregar
 * - onAddClick: Callback del botón agregar
 * - className: Clases CSS adicionales
 */
const MemberSearch = ({
  control,
  register,
  setValue,
  name = "searchTermMiembro",
  label = "Buscar Miembro por Cédula o Nombre",
  placeholder = "Ingrese cédula o nombre del miembro",
  onMemberSelect,
  disabled = false,
  required = false,
  showSelectedDisplay = true,
  showAddButton = true,
  addButtonText = "Agregar",
  onAddClick,
  className = "",
  ...props
}) => {
  // Estados locales del componente
  const [selectedMiembro, setSelectedMiembro] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingMiembro, setIsLoadingMiembro] = useState(false);

  // Referencias para manejar el "debounce" (retraso) en la búsqueda
  const debounceTimerRef = useRef(null);
  // Ref para evitar que el useEffect de búsqueda se dispare cuando se establece el valor de un miembro seleccionado
  const isSettingValueRef = useRef(false);
  // Ref para el input para poder hacer focus
  const inputRef = useRef(null);

  // Observa el valor del campo de búsqueda en tiempo real
  const watchedSearchTerm = useWatch({ control, name });

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
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/miembro/search?query=${encodeURIComponent(searchTerm)}`
        );

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
    if (setValue) {
      setValue(name, miembro.cedula_mie || miembro.nombre_mie, { shouldValidate: true });
    }
    setSearchResults([]);

    // Llama al callback si está definido
    if (onMemberSelect) {
      onMemberSelect(miembro);
    }

    // Restablece la ref para permitir futuras búsquedas.
    setTimeout(() => {
      isSettingValueRef.current = false;
    }, 50);
  };

  /**
   * Maneja el evento onKeyDown del input
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedMiembro && onAddClick) {
        onAddClick(selectedMiembro);
      } else if (searchResults.length > 0) {
        // Si hay resultados pero no hay seleccionado, seleccionar el primero
        seleccionarMiembro(searchResults[0]);
      }
    }
  };

  /**
   * Maneja el clic del botón agregar
   */
  const handleAddClick = () => {
    if (onAddClick && selectedMiembro) {
      onAddClick(selectedMiembro);
      // Limpiar el campo de búsqueda y resetear estados después de agregar
      if (setValue) {
        setValue(name, '', { shouldValidate: true });
      }
      setSelectedMiembro(null);
      setSearchResults([]);
      // Hacer focus en el input después de un breve delay para permitir que se actualice el DOM
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Campo de búsqueda */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LuSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            ref={inputRef}
            id={name}
            type="text"
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            {...register ? register(name) : {}}
            disabled={disabled || isLoadingMiembro}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {isLoadingMiembro && (
            <LuSearch className="animate-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
          )}
        </div>

        {/* Display del miembro seleccionado */}
        {showSelectedDisplay && selectedMiembro && (
          <div className="ml-4 flex-1 text-gray-700 p-2 border border-gray-300 rounded-lg bg-gray-50">
            <p className="text-xs font-medium text-gray-500">Miembro Seleccionado:</p>
            <p className="text-sm font-semibold">{selectedMiembro.nombre_mie} (ID: {selectedMiembro.id_mie})</p>
          </div>
        )}

        {/* Botón Agregar Miembro */}
        {showAddButton && (
          <button
            type="button"
            onClick={handleAddClick}
            className="bg-green-500 text-white rounded-lg px-4 py-2 hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedMiembro}
          >
            {addButtonText}
          </button>
        )}
      </div>

      {/* Resultados de Búsqueda (Dropdown) */}
      {searchResults.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {searchResults.map((miembro) => (
            <li
              key={miembro.id_mie}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              onClick={() => seleccionarMiembro(miembro)}
            >
              <span className="font-semibold">{miembro.nombre_mie}</span> - {miembro.cedula_mie}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberSearch;
