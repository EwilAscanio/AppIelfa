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
  const [totalNinos, setTotalNinos] = useState(0);
  const [cumpleanerosDelDia, setCumpleanerosDelDia] = useState([]);
  const [cumpleanerosDelMes, setCumpleanerosDelMes] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const obtenerData = async () => {
      try {
        const [resConfiguracion, resMiembros] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/configuracion`),
          axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/miembro`)
        ]);
  
        // Manejo de configuración
        if (resConfiguracion.status === 200) {
          const configData = resConfiguracion.data; // Objeto plano, no array

          setTotalMiembros(configData.totalmiembros || 0);
          setTotalEventos(configData.totalEventos || 0);
        }
  
        // Manejo de miembros
        if (resMiembros.status === 200) {
          const miembrosData = resMiembros.data;

          // Ajusta estos nombres según lo que devuelve tu API
          setTotalHombres(miembrosData.conteoPorGenero?.Masculino || 0);
          setTotalMujeres(miembrosData.conteoPorGenero?.Femenino || 0);
          setTotalNinos(miembrosData.conteoDeNinos || 0);
          setCumpleanerosDelDia(miembrosData.cumpleanerosDelDia || []);
          setCumpleanerosDelMes(miembrosData.cumpleanerosDelMes || []);
        }
  
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
  
    obtenerData();
  }, []);

  // Datos para las cards (ahora dinámicos y correctos)
  const cardData = [
    { title: "Total de Miembros", value: totalMiembros, change: "+12.5%" },
    //{ title: "Eventos Realizados", value: totalEventos, change: "+5.2%" },
    { title: "Total de Hombres", value: totalHombres, change: "+3.4%" },
    { title: "Total de Mujeres", value: totalMujeres, change: "-2.1%" },
    { title: "Total de Niños", value: totalNinos, change: "+2.1%" }  
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
                item.value !== null ? item.value : "0" 
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Cumpleañeros del Día */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎂</span>
          Cumpleañeros de Hoy
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : cumpleanerosDelDia.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cumpleanerosDelDia.map((persona, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-30"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {persona.nombre_mie.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{persona.nombre_mie}</h4>
                    <p className="text-white text-sm opacity-90">
                      {persona.edad_actual} años
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center py-8">No hay cumpleañeros hoy</p>
        )}
      </div>

      {/* Cumpleañeros del Mes */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🎉</span>
          Cumpleañeros del Mes
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : cumpleanerosDelMes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
            {cumpleanerosDelMes.map((persona, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg border border-white border-opacity-30"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {persona.nombre_mie.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium text-sm truncate">{persona.nombre_mie}</h4>
                    <p className="text-white text-xs opacity-90">
                      {persona.dia_cumple} • {persona.edad_actual} años
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center py-8">No hay cumpleañeros este mes</p>
        )}
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
