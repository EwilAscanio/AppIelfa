"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const UpdateFamiliaPage = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [familia, setFamilia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre_fam: "",
    cedula_jefe_fam: "",
    miembros: []
  });

  useEffect(() => {
    const fetchFamilia = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias/${id}`);
        setFamilia(data.familia);
        setFormData({
          nombre_fam: data.familia.nombre_fam,
          cedula_jefe_fam: data.familia.cedula_jefe_fam,
          miembros: data.familia.miembros || []
        });
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
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias/${id}`, formData);
      router.push("/auth/dashboard/familias");
    } catch (err) {
      setError("Error al actualizar la familia");
      console.error(err);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Actualizar Familia</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre de Familia</label>
          <input
            type="text"
            value={formData.nombre_fam}
            onChange={(e) => setFormData({ ...formData, nombre_fam: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Cédula del Jefe de Familia</label>
          <input
            type="text"
            value={formData.cedula_jefe_fam}
            onChange={(e) => setFormData({ ...formData, cedula_jefe_fam: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        {/* Aquí se puede agregar gestión de miembros */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Actualizar Familia
        </button>
      </form>
    </div>
  );
};

export default UpdateFamiliaPage;
