"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import ReportePDF from "@/components/reportes/Familias";
import { useRouter, useSearchParams } from "next/navigation";

const ReportFamilyServer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');
  const [familias, setFamilias] = useState([]);
  const [familiasFiltradas, setFamiliasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/familias`,
          {
            params: categoria ? { categoria: categoria } : {}
          }
        );

        // Filtrar datos según categoria si existe
        let familiasFiltradas = response.data.familias;
        if (categoria === "Adultos") {
          familiasFiltradas = response.data.familias.filter(familia => familia.miembros_adultos > 0);
        } else if (categoria === "Niños") {
          familiasFiltradas = response.data.familias.filter(familia => familia.miembros_ninos > 0);
        }

        setFamilias(response.data.familias);
        setFamiliasFiltradas(familiasFiltradas);

      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error response details:", err.response); // Más detallado

        let errorMessage = "Ocurrió un error al cargar el reporte.";
        let errorTitle = "Error en el Reporte";

        if (axios.isAxiosError(err) && err.response) {
            errorMessage = err.response.data?.message || `Error del servidor (Código: ${err.response.status})`;
            if (err.response.status === 404) {
                errorTitle = "Datos No Encontrados";
            } else if (err.response.status >= 500) {
                errorTitle = "Error Interno del Servidor";
            }
        } else if (axios.isAxiosError(err) && err.request) {
            errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
            errorTitle = "Error de Conexión";
        } else {
            errorMessage = err.message || errorMessage;
            errorTitle = "Error Desconocido";
        }

        setError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoria]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Reporte de Familias
        </h1>

        <PDFDownloadLink
          document={
            <ReportePDF
              familias={familiasFiltradas}
              totalFamilias={familiasFiltradas.length}
            />
          }
          fileName={`Reporte_Familias_${categoria || 'Todas'}_${new Date().toISOString().slice(0,10)}.pdf`}
          className="bg-primary hover:bg-primary-hover text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {({ loading }) => (
            loading ? "Generando PDF..." : "Descargar Reporte"
          )}
        </PDFDownloadLink>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jefe de Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miembros de la Familia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {familiasFiltradas.length > 0 ? (
                familiasFiltradas.map((familia) => (
                  <tr key={familia.id_fam}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {familia.nombre_fam}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {familia.jefe_nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {familia.miembros && familia.miembros.length > 0 ? (
                          familia.miembros.map((miembro, index) => (
                            <div key={miembro.id} className="text-xs">
                              <span className="font-medium">{miembro.nombre}</span>
                              <span className="text-gray-500 ml-1">({miembro.parentesco})</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">Sin miembros adicionales</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {familia.jefe_direccion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {familia.jefe_telefono}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron familias en la categoría seleccionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {familiasFiltradas.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Total de Familias:
              </span>
              <span className="text-lg font-bold text-gray-800">
                {familiasFiltradas.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportFamilyServer;

export const dynamic = 'force-dynamic';
