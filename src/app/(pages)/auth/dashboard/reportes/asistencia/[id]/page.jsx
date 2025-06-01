"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
// Asegúrate de que el path a tu componente PDF sea correcto
import ReportePDF from "@/components/reportes/AsistenciaEvento";
import { useRouter } from "next/navigation";

const ReporteAsistencia = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [asistencias, setAsistencias] = useState([]); // Aquí se almacenarán los registros de asistencia
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAsistentes, setTotalAsistentes] = useState(0); // Para el conteo total de asistentes
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
            router.push('/auth/dashboard/reportes');
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
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/reportes/asistencia/evento?fechaInicial=${fechaInicial}&fechaFinal=${fechaFinal}`
        );

        console.log("Datos de la API (asistencias):", response.data.asistencias);
        console.log("Total Asistentes (desde API):", response.data.totalAsistentes);

        // La API ahora devuelve 'asistencias' y 'totalAsistentes'
        if (Array.isArray(response.data.asistencias)) {
          setAsistencias(response.data.asistencias);
          setTotalAsistentes(response.data.totalAsistentes || 0); // Asegurarse de que sea un número
        } else {
          console.warn("response.data.asistencias no es un array o está vacío.");
          setAsistencias([]);
          setTotalAsistentes(0);
        }

        setRangoFechas(`${fechaInicial} al ${fechaFinal}`);

      } catch (err) {
        console.error("Error al cargar los datos:", err);
        console.error("Detalles del error de respuesta:", err.response);

        let errorMessage = "Ocurrió un error al cargar el reporte.";
        let errorTitle = "Error en el Reporte";

        if (axios.isAxiosError(err) && err.response) {
            errorMessage = err.response.data?.message || `Error del servidor (Código: ${err.response.status})`;
        } else if (axios.isAxiosError(err) && err.request) {
            errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet.";
        } else {
            errorMessage = err.message || errorMessage;
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
  }, [searchParams, router]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Verificar si la fecha es inválida antes de formatear
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    // Asume que timeString ya viene en formato HH:MM:SS
    // Si fuera un objeto Date completo y quisieras un formato más específico:
    // const date = new Date(`2000-01-01T${timeString}`); // Crear una fecha dummy para usar toLocaleTimeString
    // return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return timeString.substring(0, 5); // Simplemente toma HH:MM si viene como HH:MM:SS
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
          Reporte de Asistencia a Eventos {/* Título ajustado */}
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
              totalAsistentes={totalAsistentes} 
              rangoFechas={rangoFechas}
            />
          }
          fileName={`Reporte_Asistencia_${new Date().toISOString().slice(0,10)}.pdf`} 
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
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Miembro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistencias.length > 0 ? (
                asistencias.map((registroAsistencia) => ( 
                  <tr key={registroAsistencia.id_asi}> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registroAsistencia.codigo_eve}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registroAsistencia.nombre_eve}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(registroAsistencia.fecha_eve)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registroAsistencia.nombre_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registroAsistencia.cedula_mie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registroAsistencia.tipo_mie}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron registros de asistencia para el período seleccionado.
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
                Total de Asistentes: 
              </span>
              <span className="text-lg font-bold text-gray-800">
                {totalAsistentes} 
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteAsistencia;