"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import ReportePDF from "@/components/reportes/AsistenciaEvento";
import { useRouter } from "next/navigation"; // Importar useRouter

const ReporteAsistencia = () => {
  const router = useRouter(); // Inicializar useRouter
  const searchParams = useSearchParams();
  const [asistencias, setAsistencias] = useState([]); // Renombrado a `eventos` sería más claro, pero lo dejo por ahora
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // No necesitamos totalAsistentes si el reporte es de eventos, usaremos asistencias.length
  // const [totalAsistentes, setTotalAsistentes] = useState(0);
  const [rangoFechas, setRangoFechas] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fechaInicial = searchParams.get("fechaInicial");
        const fechaFinal = searchParams.get("fechaFinal");

        if (!fechaInicial || !fechaFinal) {
          Swal.fire({
            icon: 'error',
            title: 'Parámetros Faltantes',
            text: 'Las fechas inicial y final son necesarias para generar el reporte.',
            confirmButtonText: 'Ir a Selección de Reportes'
          }).then(() => {
            router.push('/auth/dashboard/reports'); // Redirige si faltan fechas
          });
          setLoading(false);
          return;
        }

        // Validación de fechas
        if (new Date(fechaFinal) < new Date(fechaInicial)) {
          Swal.fire({
            icon: 'error',
            title: 'Rango inválido',
            text: 'La fecha final no puede ser anterior a la fecha inicial',
          });
          setLoading(false); // IMPORTANTE: Detener loading aquí también
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/evento/evento?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`
        );
        console.log("Response data.eventos (desde API):", response.data.eventos);

        if (Array.isArray(response.data.eventos)) {
          console.log("API: response.data.eventos es un array válido.");
          setAsistencias(response.data.eventos);
          // Actualizamos totalAsistentes (ahora sería total de eventos)
          // setTotalAsistentes(response.data.eventos.length);
        } else {
          console.log("API: response.data.eventos NO es un array. Se seteará asistencias a []");
          setAsistencias([]); // Asegura que asistencias siempre sea un array
          // setTotalAsistentes(0);
        }
        
        // ¡LA LÍNEA PROBLEMÁTICA HA SIDO ELIMINADA DE AQUÍ!
        // setAsistencias(response.data.eventos); // <-- ELIMINAR ESTA LÍNEA

        setRangoFechas(`${fechaInicial} al ${fechaFinal}`); // Ahora sí, descomenta y usa esto

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
  }, [searchParams, router]); // Añadir router a las dependencias

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
          Reporte de Eventos {/* Título ajustado */}
          {rangoFechas && (
            <span className="block text-lg font-normal text-gray-600">
              Período: {rangoFechas}
            </span>
          )}
        </h1>

        <PDFDownloadLink
          document={
            <ReportePDF 
              asistencias={asistencias}
              totalAsistentes={asistencias.length} 
              rangoFechas={rangoFechas}
            />
          }
          fileName={`Reporte_Eventos_${new Date().toISOString().slice(0,10)}.pdf`} 
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
                  Código Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistencias.length > 0 ? (
                asistencias.map((evento) => ( 
                  <tr key={evento.codigo_eve}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evento.codigo_eve}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evento.nombre_eve}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evento.descripcion_eve}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(evento.fecha_eve)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {evento.status_eve}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron eventos en el período seleccionado.
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
                Total de Eventos: {/* Texto ajustado */}
              </span>
              <span className="text-lg font-bold text-gray-800">
                {asistencias.length} {/* Muestra el total de eventos */}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteAsistencia;