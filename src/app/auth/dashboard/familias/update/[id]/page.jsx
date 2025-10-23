"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import MemberSearch from "@/components/MemberSearch";
import Loading from "@/libs/loading";

const UpdateFamiliaPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [familia, setFamilia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMiembros, setCurrentMiembros] = useState([]);

  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre_fam: "",
      cedula_jefe_fam: "",
      searchTermMiembro: ""
    }
  });

  useEffect(() => {
    const fetchFamilia = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias/${id}`);
        setFamilia(data.familia);
        setCurrentMiembros(data.familia.miembros || []);
        setValue("nombre_fam", data.familia.nombre_fam);
        setValue("cedula_jefe_fam", data.familia.cedula_jefe_fam);
      } catch (err) {
        setError("Error al cargar la familia");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFamilia();
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      const updateData = {
        nombre_fam: data.nombre_fam,
        cedula_jefe_fam: data.cedula_jefe_fam,
        miembros: currentMiembros
      };

      await axios.put(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias/${id}`, updateData);

      // Mostrar alerta de éxito
      await Swal.fire({
        title: "¡Éxito!",
        text: "La familia ha sido actualizada correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Aceptar"
      });

      router.push("/auth/dashboard/familias");

    } catch (err) {
      setError("Error al actualizar la familia");
      console.error(err);
    }
  };

  const handleAddMember = async (member) => {
    // Verificar que no sea el jefe
    if (member.cedula_mie === watch("cedula_jefe_fam")) {
      alert("El jefe de familia no puede ser agregado como miembro adicional");
      return;
    }

    // Verificar que no esté ya en la lista
    if (currentMiembros.some(m => m.cedula === member.cedula_mie)) {
      alert("Este miembro ya está en la familia");
      return;
    }

    // Agregar a la lista local
    const newMember = {
      cedula: member.cedula_mie,
      nombre: member.nombre_mie,
      parentesco: "Hijo/a" // Default, se puede cambiar después
    };
    setCurrentMiembros([...currentMiembros, newMember]);
  };

  const handleRemoveMember = (cedula) => {
    setCurrentMiembros(currentMiembros.filter(m => m.cedula !== cedula));
  };

  const updateParentesco = (cedula, parentesco) => {
    setCurrentMiembros(currentMiembros.map(m =>
      m.cedula === cedula ? { ...m, parentesco } : m
    ));
  };

  if (loading) return <Loading />;

  if (error) return (
    <div className="flex place-items-start justify-center p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full text-center">
        <div className="text-red-500">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="flex place-items-start justify-center p-4 min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Actualizar Familia
          </h1>
          <p className="text-gray-600 mt-2">
            Modifique la información de la familia y gestione sus miembros.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

          {/* Información básica de la familia */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Información de la Familia</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Familia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("nombre_fam", { required: "Nombre de familia es requerido" })}
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.nombre_fam && <p className="text-red-500 text-sm mt-1">{errors.nombre_fam.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cédula del Jefe de Familia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("cedula_jefe_fam", { required: "Cédula del jefe es requerida" })}
                  className="w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.cedula_jefe_fam && <p className="text-red-500 text-sm mt-1">{errors.cedula_jefe_fam.message}</p>}
              </div>
            </div>
          </div>

          {/* Gestión de miembros */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Miembros de la Familia</h2>

            {/* Componente de Búsqueda de Miembro */}
            <MemberSearch
              control={control}
              register={register}
              setValue={setValue}
              name="searchTermMiembro"
              label="Buscar Miembro para Agregar"
              placeholder="Ingrese cédula o nombre del miembro"
              onAddClick={handleAddMember}
              addButtonText="Agregar a Familia"
              showSelectedDisplay={true}
              showAddButton={true}
            />

            {/* Tabla de Miembros Actuales */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Miembros Actuales ({currentMiembros.length})</h3>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                      <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                      <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentMiembros.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">No hay miembros adicionales en esta familia.</td>
                      </tr>
                    ) : (
                      currentMiembros.map((miembro) => (
                        <tr
                          key={miembro.cedula}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-3 px-6 text-left whitespace-nowrap text-sm text-gray-900">{miembro.cedula}</td>
                          <td className="py-3 px-6 text-left text-sm text-gray-900">{miembro.nombre}</td>
                          <td className="py-3 px-6 text-left text-sm text-gray-900">
                            <select
                              value={miembro.parentesco}
                              onChange={(e) => updateParentesco(miembro.cedula, e.target.value)}
                              className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                            >
                              <option value="Cónyuge">Cónyuge</option>
                              <option value="Hijo/a">Hijo/a</option>
                              <option value="Padre/Madre">Padre/Madre</option>
                              <option value="Hermano/a">Hermano/a</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </td>
                          <td className="py-3 px-6 text-center text-sm">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(miembro.cedula)}
                              className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-200 text-xs font-medium"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/auth/dashboard/familias")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition duration-300"
            >
              Actualizar Familia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFamiliaPage;
