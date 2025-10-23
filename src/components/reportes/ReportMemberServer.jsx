"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import ReportePDF from "@/components/reportes/Miembros";
import { useRouter, useSearchParams } from "next/navigation";

const ReportMemberServer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria');
  const [asistencias, setAsistencias] = useState([]);
  const [miembrosTotales, setMiembrosTotales] = useState([]);
  const [miembrosAdultos, setMiembrosAdultos] = useState([]);
  const [miembrosNinos, setMiembrosNinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/miembros`,
          {
            params: categoria ? { categoria: categoria } : {}
          }
        );
       
        // Filtrar datos según categoria si existe
        let miembrosFiltrados = response.data.miembrosTotales;
        if (categoria === "Adultos") {
          miembrosFiltrados = response.data.miembrosAdultos;
        } else if (categoria === "Niños") {
          miembrosFiltrados = response.data.miembrosNinos;
        }

        setAsistencias(miembrosFiltrados);
        setMiembrosTotales(response.data.miembrosTotales);
        setMiembrosAdultos(response.data.miembrosAdultos);
        setMiembrosNinos(response.data.miembrosNinos);

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
          Reporte de Miembros 
          
        </h1>

        <PDFDownloadLink
          document={
            <ReportePDF
              asistencias={asistencias}
              totalAsistentes={asistencias.length}

            />
          }
          fileName={`Reporte_Miembros_${categoria || 'Todos'}_${new Date().toISOString().slice(0,10)}.pdf`}
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
                  Cedula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direccion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Nacimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Miembro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistencias.length > 0 ? (
                asistencias.map((miembro) => (
                  <tr key={miembro.cedula_mie}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {miembro.cedula_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {miembro.nombre_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {miembro.direccion_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {miembro.telefono_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(miembro.fechanacimiento_mie)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {miembro.edad_actual} años
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {miembro.tipo_mie}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron miembros en la categoría seleccionada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {asistencias.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">
                Total de Miembros: {/* Texto ajustado */}
              </span>
              <span className="text-lg font-bold text-gray-800">
                {asistencias.length} {/* Muestra el total de miembros */}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportMemberServer;

export const dynamic = 'force-dynamic';
