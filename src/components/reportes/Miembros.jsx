import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  // Image, // Si no usas Image con Logo, puedes quitarlo para aligerar
} from "@react-pdf/renderer";

// Define la cantidad de ítems que deseas por cada hoja
const ITEMS_PER_PAGE = 23; // Puedes ajustar este número a tu preferencia

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 15,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  logo: {
    width: 100,
    height: "auto",
    marginBottom: 5,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  address: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: "center",
  },
  date: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  rangoFechas: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15,
  },
  table: {
    display: "table",
    width: "auto", // Mantén "auto" para que se ajuste al ancho disponible
    marginTop: 15,
    border: "1px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
  },
  tableHeaderRow: {
    backgroundColor: "#f2f2f2",
    borderBottom: "2px solid #000",
  },
  // ESTILOS DE CABECERA DE COLUMNA AJUSTADOS
  tableColHeaderCedula: {
    width: "12%",
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderNombre: {
    width: "22%",
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderDireccion: {
    width: "25%",
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderTelefono: {
    width: "10%", // ¡COLUMNA MÁS ANCHA!
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderfechanacimiento: {
    width: "15%", // ¡COLUMNA MÁS ANCHA!
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderEdad: {
    width: "10%", // ¡COLUMNA MÁS ANCHA!
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableColHeaderTipoMiembro: {
    width: "10%",
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9,
  },

  // ESTILOS DE CELDA DE CONTENIDO AJUSTADOS
  tableColCedula: {
    width: "12%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },
  tableColNombre: {
    width: "22%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },
  tableColDireccion: {
    width: "25%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },
  tableColTelefono: {
    width: "10%", // ¡COLUMNA MÁS ANCHA!
    padding: 8,
    textAlign: "center", // Puedes ajustar a "left" si prefieres que el nombre quede alineado a la izquierda
    fontSize: 8,
  },
  tableColFechaNacimiento: {
    width: "15%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },
  tableColEdad: {
    width: "10%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },
  tableColTipoMiembro: {
    width: "10%",
    padding: 8,
    textAlign: "center",
    fontSize: 8,
  },

  noData: {
    width: "100%",
    padding: 10,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },
  total: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "right",
    paddingRight: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#777",
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: "#777",
  },
});

const ReporteMiembros = ({ asistencias, totalAsistentes, conteoNinosEnAsistencia }) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA;
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPaginatedAsistencias = (data, itemsPerPage) => {
    const pages = [];
    for (let i = 0; i < data.length; i += itemsPerPage) {
      pages.push(data.slice(i, i + itemsPerPage));
    }
    if (pages.length === 0) {
      pages.push([]);
    }
    return pages;
  };

  const paginatedAsistencias = getPaginatedAsistencias(asistencias, ITEMS_PER_PAGE);

  return (
    <Document>
      {paginatedAsistencias.map((pageAsistencias, pageIndex) => (
        <Page size="A4" style={styles.page} key={`page-${pageIndex}`}>
          <View style={styles.header}>
            <Text style={styles.companyName}>
              {nombreEmpresa || "Nombre de la Empresa"}
            </Text>
            <Text style={styles.address}>
              {direccionEmpresa || "Dirección de la Empresa"}
            </Text>
            <Text style={styles.date}>
              Fecha de Generación: {new Date().toLocaleDateString('es-ES')}
            </Text>
          </View>
          <View style={styles.title}>
            <Text>Reporte de Miembros</Text>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              
              {/* Encabezados de tabla ajustados a los datos de eventos */}
                    <Text style={styles.tableColHeaderCedula}>Cedula</Text>
                    <Text style={styles.tableColHeaderNombre}>Nombre</Text>
                    <Text style={styles.tableColHeaderDireccion}>Direccion</Text>
                    <Text style={styles.tableColHeaderTelefono}>Telefono</Text>
                    <Text style={styles.tableColHeaderfechanacimiento}>Fecha de Nacimiento</Text>
                    <Text style={styles.tableColHeaderEdad}>Edad</Text>
                    <Text style={styles.tableColHeaderTipoMiembro}>Tipo de Miembro</Text>

            </View>

            {pageAsistencias && pageAsistencias.length > 0 ? (
              pageAsistencias.map((miembro, index) => (
                <View key={miembro.cedula_mie || `${pageIndex}-${index}`} style={styles.tableRow}>
                
                  <Text style={styles.tableColCedula}>{miembro.cedula_mie}</Text>
                  <Text style={styles.tableColNombre}>{miembro.nombre_mie}</Text>
                  <Text style={styles.tableColDireccion}>{miembro.direccion_mie}</Text>
                  <Text style={styles.tableColTelefono}>{miembro.telefono_mie}</Text>
                  <Text style={styles.tableColFechaNacimiento}>{formatDate(miembro.fechanacimiento_mie)}</Text>
                  <Text style={styles.tableColEdad}>{miembro.edad_actual} años</Text>
                  <Text style={styles.tableColTipoMiembro}>{miembro.tipo_mie}</Text>


                </View>
              ))
            ) : (
              pageIndex === 0 && asistencias.length === 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.noData}>
                    No se encontraron registros de asistencia en el período seleccionado.
                  </Text>
                </View>
              )
            )}
          </View>

          {pageIndex === paginatedAsistencias.length - 1 && asistencias.length > 0 && (
            <View>
              <Text style={styles.total}>
                Total de Adultos: {totalAsistentes}
              </Text>
              
            </View>
          )}

          {/* <Text style={styles.footer} fixed>
            Este es un reporte generado automáticamente.
          </Text> */}

          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      ))}
    </Document>
  );
};

export default ReporteMiembros;