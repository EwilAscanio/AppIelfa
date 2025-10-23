"use client";

import axios from "axios";
import Link from "next/link";
import { useState, useEffect } from "react";

const ListadoAsistenciaPage = () => {
  const [asistencia, setAsistencia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const loadListadoAsistencia = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/listadoasistencia`
        );
        setAsistencia(data);
      } catch (error) {
        console.error("Error loading attendance:", error);
        setAsistencia([]);
      } finally {
        setLoading(false);
      }
    };

    loadListadoAsistencia();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"; // Manejar fechas nulas o vacías
    const date = new Date(dateString);
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        return "Fecha inválida";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses son 0-indexados
    const day = String(date.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const toggleRowExpansion = (codigo_eve) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(codigo_eve)) {
      newExpandedRows.delete(codigo_eve);
    } else {
      newExpandedRows.add(codigo_eve);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="container mx-auto px-4"> {/* Contenedor principal centrado y con padding */}
      <div className="flex justify-between items-center mb-6"> {/* Flexbox para alinear título y botón */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"> {/* Título más prominente, ajustado a 2xl/3xl */}
            Listado de Asistencia
          </h1>
          <p className="text-gray-600 text-sm"> {/* Texto más pequeño y gris */}
            Total de eventos con asistencia: {asistencia.length}
          </p>
        </div>
      </div>

      {/* Contenedor de la tabla con sombra y bordes redondeados */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Asegura scroll horizontal en pantallas pequeñas */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100"> 
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistentes
                </th>
                
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
  {loading ? (
    <tr>
      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
        Cargando...
      </td>
    </tr>
  ) : asistencia.length > 0 ? (
    asistencia.map((evento) => (
      <>
        <tr key={evento.codigo_eve} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            <button
              onClick={() => toggleRowExpansion(evento.codigo_eve)}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {expandedRows.has(evento.codigo_eve) ? '▼' : '▶'}
            </button>
            {evento.codigo_eve}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{evento.nombre_eve}</td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
            {formatDate(evento.fecha_asistencia)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
            {evento.total_asistentes}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
            <div className="inline-flex">
              <Link href={`/auth/dashboard/reportes/asistenciaporevento/${evento.codigo_eve}`} passHref>
                <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200">
                  Ver Reporte
                </button>
              </Link>
            </div>
          </td>
        </tr>
        {expandedRows.has(evento.codigo_eve) && (
          <tr>
            <td colSpan={5} className="px-6 py-4 bg-gray-50">
              <div className="text-sm">
                <h4 className="font-medium text-gray-900 mb-2">Miembros Asistentes:</h4>
                {evento.miembros && evento.miembros.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {evento.miembros.map((miembro) => (
                      <div key={miembro.id_mie} className="bg-white p-3 rounded border">
                        <div className="font-medium text-gray-900">{miembro.nombre_mie}</div>
                        <div className="text-gray-600 text-sm">Cédula: {miembro.cedula_mie}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay miembros registrados para este evento.</p>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    ))
  ) : (
    <tr>
      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
        No hay registros de asistencia disponibles.
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListadoAsistenciaPage;
