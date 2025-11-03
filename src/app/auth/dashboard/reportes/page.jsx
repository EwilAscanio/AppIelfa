"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PageReports = () => {
  const router = useRouter();

  const [error, setError] = useState("");

  // Estados para las fechas de Eventos
  const [fechaIncialEvento, setFechaIncialEvento] = useState(""); 
  const [fechaFinalEvento, setFechaFinalEvento] = useState(""); 

  // Estados para las fechas de Asistencias
  const [fechaIncialAsistencia, setFechaIncialAsistencia] = useState("");
  const [fechaFinalAsistencia, setFechaFinalAsistencia] = useState("");

  // Estado para el código de evento
  const [codigoEvento, setCodigoEvento] = useState("");

  // Estado para la categoría de miembros
  const [categoria, setCategoria] = useState("Todos");

   // Estado para la categoría de miembros
   const [categoriaFamilias, setCategoriaFamilias] = useState("Todas");



  const handleSubmitEvento = (e) => {
    e.preventDefault();
    // Verificar que las fechas estén presentes
    if (!fechaIncialEvento || !fechaFinalEvento) {
      setError("Por favor, ingrese ambas fechas.");
      return;}
    setError(""); // Limpiar el error
    
    // Redirigir a la página de despacho con las fechas
    router.push(
      `reportes/evento/evento?fechaInicial=${fechaIncialEvento}&fechaFinal=${fechaFinalEvento}`
    );
    }

    const handleSubmitAsistencia = (e) => {
      e.preventDefault();
      // Verificar que las fechas estén presentes
      if (!fechaIncialAsistencia || !fechaFinalAsistencia) {
        setError("Por favor, ingrese ambas fechas.");
        return;}
      setError(""); // Limpiar el error
      
      // Redirigir a la página de despacho con las fechas
      router.push(
        `reportes/asistencia/asistencia?fechaInicial=${fechaIncialAsistencia}&fechaFinal=${fechaFinalAsistencia}`
      );
      }

      const handleSubmitAsistenciaporEvento = (e) => {
        e.preventDefault();
        // Verificar que las fechas estén presentes
        if (!codigoEvento) {
          setError("Por favor, ingrese el codigo del Evento.");
          return;}
        setError(""); // Limpiar el error
        
        // Redirigir a la página de despacho con las fechas
        router.push(
          `reportes/asistenciaporevento/asistencia?codigoEvento=${codigoEvento}`
        );
        }

        const handleSubmitMiembros = (e) => {
          e.preventDefault();

          // Redirigir a la página de Miembros con la categoría seleccionada
          router.push(            
            
            `reportes/miembros?categoria=${categoria}`

          );
      }

      const handleSubmitFamilias = (e) => {
        e.preventDefault();

        // Redirigir a la página de Familias con la categoría seleccionada
        router.push(
          `reportes/familias?categoria=${categoriaFamilias}`
        );
    }

        // Agregar función para manejar el evento de presionar Enter
        const handleCodigoEventoKeyDown = (event) => {
          if (event.key === 'Enter') {
          handleSubmitAsistenciaporEvento(event);
        }
};

  return (
    <>
      <div className="flex justify-around"></div>
      <div className="flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Reportes del Sistema
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Escoge que reporte desea visualizar
            </p>
          </div>

          {/* Mensaje de error */}
          <div className="mb-4">
            {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          </div>

          {/* Formulario para los reportes */}
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Reporte Número 1 Resumen de Eventos */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Eventos.
                </p>
               
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    placeholder="Fecha Inicial"
                    className="w-full pl-4 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    value={fechaIncialEvento}
                    onChange={(e) => setFechaIncialEvento(e.target.value)}
                  />
                  <input
                    type="date"
                    placeholder="Fecha Final"
                    className="w-full pl-4 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    value={fechaFinalEvento}
                    onChange={(e) => setFechaFinalEvento(e.target.value)}
                  />
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-2"
                  onClick={handleSubmitEvento}
                >
                  Mostrar Reporte
                </button>
              </div> 

              {/* Reporte Número 2 Resumen de Asistencias */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Asistencias a Eventos.
                </p>
               
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    placeholder="Fecha Inicial"
                    className="w-full pl-4 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    value={fechaIncialAsistencia}
                    onChange={(e) => setFechaIncialAsistencia(e.target.value)}
                  />
                  <input
                    type="date"
                    placeholder="Fecha Final"
                    className="w-full pl-4 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    value={fechaFinalAsistencia}
                    onChange={(e) => setFechaFinalAsistencia(e.target.value)}
                  />
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-2"
                  onClick={handleSubmitAsistencia}
                >
                  Mostrar Reporte
                </button>
              </div>

              {/* Reporte Número 3 Resumen de Asistencias filtrar por evento */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Asistencias segun el Evento.
                </p>
               
                <div className="mt-2 ">
                  <input
                    type="numeric"
                    placeholder="Codigo de Evento"
                    className="w-full pl-4 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                    value={codigoEvento}
                    onChange={(e) => setCodigoEvento(e.target.value)}
                    onKeyDown={handleCodigoEventoKeyDown}
                  />
                  
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-2"
                  onClick={handleSubmitAsistenciaporEvento}
                >
                  Mostrar Reporte
                </button>
              </div>  

              {/* Reporte Número 4 Reporte de Miembros */}
              <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Miembros e Invitados.
                </p>

                <div className="mt-4">
                  <div className="flex flex-col sm:flex-row sm:space-x-6 sm:justify-center space-y-2 sm:space-y-0">
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Adultos"
                        checked={categoria === "Adultos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Adultos</span>
                    </label>
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Niños"
                        checked={categoria === "Niños"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Niños</span>
                    </label>
                    <label className="flex items-center justify-center sm:justify-start">
                      <input
                        type="radio"
                        name="categoria"
                        value="Todos"
                        checked={categoria === "Todos"}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                  </div>
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-6"
                  onClick={handleSubmitMiembros}
                >
                  Mostrar Reporte
                </button>
              </div>

                            {/* Reporte Número 5 Reporte de Familias */}
                            <div className="relative border border-gray-300 rounded-lg p-4">
                <p className="text-center text-gray-600 mb-4">
                  Mostrar Familias.
                </p>

                <div className="mt-4">
                  <div className="flex justify-center">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="categoriaFamilias"
                        value="Todas"
                        checked={categoriaFamilias === "Todas"}
                        onChange={(e) => setCategoriaFamilias(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">Todas</span>
                    </label>
                  </div>
                </div>
                <button
                  className="col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-hover transition duration-300 flex items-center justify-center mt-6"
                  onClick={handleSubmitFamilias}
                >
                  Mostrar Reporte
                </button>
              </div>


            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PageReports;
