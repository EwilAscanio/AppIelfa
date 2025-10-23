import { useEffect, useRef, useState } from "react"; // Importa useState
import Chart from "chart.js/auto"; // Asegúrate de que Chart.js esté instalado
import axios from "axios"; // Importa axios

const ChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState({ labels: [], data: [] }); // Nuevo estado para los datos del gráfico
  const [loading, setLoading] = useState(true); // Estado de carga para la API

  useEffect(() => {
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ]; 

    const fetchChartData = async () => {
      setLoading(true); // Inicia el estado de carga
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/asistenciamensual`
        );

        if (res.status === 200 && Array.isArray(res.data)) {
          const fetchedLabels = [];
          const fetchedData = [];

          // Crear un mapa para un acceso rápido a los datos por mes
          const dataMap = new Map();
          res.data.forEach(item => {
            dataMap.set(item.mes, item.total_asistencias);
          });

          // Llenar los labels y data para los 12 meses, usando 0 si no hay datos
          // Esto asegura que el gráfico siempre tenga 12 barras/puntos, incluso si un mes no tiene asistencias.
          for (let i = 1; i <= 12; i++) {
            fetchedLabels.push(monthNames[i - 1]); // monthNames es 0-indexado
            fetchedData.push(dataMap.get(i) || 0); // Si el mes no tiene datos, usa 0
          }

          setChartData({ labels: fetchedLabels, data: fetchedData });
        } else {
          console.error("Respuesta inesperada de la API de asistencia mensual:", res);
          // Opcional: mostrar un mensaje de error en la UI al usuario
        }
      } catch (error) {
        console.error("Error al obtener datos para el gráfico:", error);
        // Opcional: mostrar un mensaje de error en la UI al usuario
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchChartData();
  }, []); // Eliminar monthNames de las dependencias

  useEffect(() => {
    // Solo renderizar/actualizar el gráfico si los datos han sido cargados
    // y hay al menos un label para evitar errores de Chart.js con arrays vacíos.
    if (!loading && chartData.labels.length > 0) {
      // Destruir la instancia anterior si existe para evitar duplicados
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "bar", // Tipo de gráfico: barras
        data: {
          labels: chartData.labels, // Datos dinámicos de los meses
          datasets: [
            {
              label: "Cantidad de Asistentes",
              data: chartData.data, // Datos dinámicos de las asistencias
              backgroundColor: "rgba(59, 130, 246, 0.8)", // Color de las barras (azul Tailwind)
              borderColor: "#3B82F6", // Borde de las barras
              borderWidth: 1,
              borderRadius: 5, // Bordes redondeados para las barras
              hoverBackgroundColor: "rgba(37, 99, 235, 0.9)", // Color al pasar el ratón
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Permite que el gráfico se ajuste al tamaño del contenedor
          plugins: {
            legend: {
              display: true, // Muestra la leyenda
              position: "top",
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            title: {
              display: true,
              text: "Asistencia Mensual", // Título del gráfico
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            tooltip: { // Mejoras en el tooltip para una mejor visualización
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('es-VE').format(context.parsed.y) + ' asistentes';
                        }
                        return label;
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 8
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false, // No dibujar el borde del eje Y
                color: 'rgba(200, 200, 200, 0.2)', // Color más suave para las líneas de la cuadrícula
              },
              ticks: {
                callback: function(value) { // Formato para el eje Y
                    return new Intl.NumberFormat('es-VE').format(value);
                },
                font: {
                    size: 12
                }
              },
              title: {
                display: true,
                text: 'Número de Asistentes',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
            x: {
              grid: {
                display: false, // No mostrar líneas de cuadrícula en el eje X
              },
              ticks: {
                font: {
                    size: 12
                }
              },
              title: {
                display: true,
                text: 'Mes',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              }
            },
          },
        },
      });
    }

    // Cleanup function to destroy the chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [loading, chartData]); // Depende de loading y chartData para re-renderizar cuando los datos estén listos

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 text-gray-500 text-lg">
        Cargando datos del gráfico de asistencia...
      </div>
    );
  }

  return (
    <>
      <canvas ref={chartRef} />
    </>
  );
};

export default ChartComponent;