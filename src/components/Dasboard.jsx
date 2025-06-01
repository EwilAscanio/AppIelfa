"use client";
import Chart from "@/components/ChartComponent";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const cardStyles = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
  ];

  const [totalMiembros, setTotalMiembros] = useState(null);
  const [totalEventos, setTotalEventos] = useState(null);
  const [totalHombres, setTotalHombres] = useState(0);
  const [totalMujeres, setTotalMujeres] = useState(0);
  const [loading, setLoading] = useState(true); // Estado para manejar carga

  useEffect(() => {
    const obtenerData = async () => {
      try {
        // Ejecuta ambas peticiones en paralelo para mayor eficiencia
        const [resConfiguracion, {data}] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`),
          axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/miembro`)
        ]);

        
        // Manejo de la respuesta de configuracion
        if (resConfiguracion.status === 200) {
          // Si res.data es un objeto, accede directamente a sus propiedades
          // Si res.data es un array que contiene el objeto, usa res.data[0]
          const configData = Array.isArray(resConfiguracion.data) ? resConfiguracion.data[0] : resConfiguracion.data;

          setTotalMiembros(configData.totalMiembros || 0); // Asegura un valor por defecto
          setTotalEventos(configData.totalEventos || 0); // Asegura un valor por defecto
        } else {
          console.warn("Error o respuesta inesperada de /api/configuracion:", resConfiguracion);
        }

        // Manejo de la respuesta de miembros
        if (data.status === 200) {
        
          // Actualiza los estados de hombres y mujeres
          setTotalHombres(data.conteoPorGenero.masculino || 0); // Accede a conteoPorGenero.M, si no existe, 0
          setTotalMujeres(data.conteoPorGenero.femenino || 0); // Accede a conteoPorGenero.F, si no existe, 0


        } else {
          console.warn("Error o respuesta inesperada de /api/miembro:", resMiembros);
        }

      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        // Podrías mostrar un mensaje de error al usuario aquí
      } finally {
        setLoading(false);
      }
    };

    obtenerData();
  }, []); // El array de dependencias vacío significa que se ejecuta una vez al montar el componente

  // Datos para las cards (ahora dinámicos y correctos)
  const cardData = [
    { title: "Total de Miembros", value: totalMiembros, change: "+12.5%" },
    { title: "Eventos Realizados", value: totalEventos, change: "+5.2%" },
    { title: "Total de Hombres", value: totalHombres, change: "+8.7%" },
    { title: "Total Mujeres", value: totalMujeres, change: "-2.1%" } 
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cardData.map((item, index) => (
          <div
            key={index}
            className={`${cardStyles[index]} p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            <h3 className="text-white text-sm font-medium uppercase tracking-wider">
              {item.title}
            </h3>
            <p className="text-3xl font-bold text-white mt-2">
              {loading ? (
                <span className="inline-block h-8 w-20 bg-white bg-opacity-20 rounded animate-pulse"></span>
              ) : (
                item.value !== null ? item.value : "0" // Muestra 0 si es null
              )}
            </p>
            <p className="text-white text-sm mt-2 bg-white bg-opacity-20 inline-block px-2 py-1 rounded-full">
              {item.change}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
        <div className="h-80">
          <Chart />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;