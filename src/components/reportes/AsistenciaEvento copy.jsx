import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  // Image, // Si no usas Image con Logo, puedes quitarlo para aligerar
} from "@react-pdf/renderer";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 15, // Aumentar un poco el padding general
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 10, // Más espacio debajo del encabezado
    textAlign: "center",
  },
  logo: {
    width: 100,
    height: "auto",
    marginBottom: 5,
  },
  companyName: {
    fontSize: 24, // Título de empresa un poco más grande
    fontWeight: "bold",
  },
  address: {
    fontSize: 11, // Tamaño de dirección ajustado
    marginBottom: 5,
    textAlign: "center",
  },
  date: {
    fontSize: 10, // Tamaño de fecha de generación ajustado
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 16, // Título del reporte más grande
    fontWeight: "bold",
    marginBottom: 1,
    textAlign: "center",
  },
  rangoFechas: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 15, // Más espacio debajo del rango de fechas
  },
  table: {
    display: "table",
    width: "auto",
    // Remove height: "auto" as it might cause issues with dynamic content
    marginTop: 15, // Espacio superior de la tabla
    border: "1px solid #000", // Borde de la tabla completo
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee", // Líneas de tabla más suaves
    backgroundColor: "#fff",
  },
  tableHeaderRow: {
    backgroundColor: "#f2f2f2", // Color de fondo para el encabezado
    borderBottom: "2px solid #000", // Borde inferior más grueso para el encabezado
  },
  tableColHeader: {
    width: "16.66%", // 100% / 6 columnas = 16.66%
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 9, // Letra un poco más pequeña en encabezado
  },
  tableCol: {
    width: "16.66%", // 100% / 6 columnas
    padding: 8,
    textAlign: "center",
    fontSize: 8, // Letra un poco más pequeña en contenido
  },
  tableCol2: {
    width: "30%", // 100% / 6 columnas
    padding: 8,
    textAlign: "center",
    fontSize: 8, // Letra un poco más pequeña en contenido
  },
  noData: {
    width: "100%",
    padding: 10,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },
  total: {
    fontSize: 12, // Tamaño del total ajustado
    fontWeight: "bold",
    marginTop: 15, // Espacio superior para el total
    textAlign: "right", // Alinear a la derecha
    paddingRight: 15, // Padding para que no se pegue al borde
  },
  footer: {
    position: 'absolute', // Posiciona el footer absolutamente
    bottom: 30, // Distancia desde el fondo
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#777",
  },
});

// Cambia la desestructuración de las props para recibir asistencias, totalAsistentes y rangoFechas
const AsistenciaEvento = ({ asistencias, totalAsistentes, rangoFechas }) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA;
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA;



  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* <Image src={Logo} style={styles.logo} /> */}
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
          <Text>Reporte de Asistencia a Eventos</Text>
        </View>
        {rangoFechas && (
          <Text style={styles.rangoFechas}>
            Período: {rangoFechas}
          </Text>
        )}

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}> 
            
            <Text style={styles.tableColHeader}>Cedula</Text>
            <Text style={styles.tableColHeader}>Nombre Miembro</Text>
            <Text style={styles.tableColHeader}>Tipo Miembro</Text>
            <Text style={styles.tableColHeader}>Cantidad Eventos</Text>
            <Text style={styles.tableColHeader}>Nombres Eventos</Text>
            
            
          </View>
          
          {asistencias && Array.isArray(asistencias) && asistencias.length > 0 ? (
            asistencias.map((registroAsistencia, index) => (
              <View key={registroAsistencia.id_mie || index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{registroAsistencia.cedula_mie}</Text>
                <Text style={styles.tableCol}>{registroAsistencia.nombre_mie}</Text>
                <Text style={styles.tableCol}>{registroAsistencia.tipo_mie}</Text>
                <Text style={styles.tableCol}>{registroAsistencia.total_eventos_asistidos}</Text>
                <Text style={styles.tableCol2}>{registroAsistencia.eventos_asistidos}</Text>
                
                
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text style={styles.noData}>
                No se encontraron registros de asistencia en el período seleccionado.
              </Text>
            </View>
          )}
        </View>

        {asistencias.length > 0 && (
          <Text style={styles.total}>
            Total de Asistentes: {totalAsistentes}
          </Text>
        )}
        
        <Text style={styles.footer} fixed>
          Este es un reporte generado automáticamente.
        </Text>
      </Page>
    </Document>
  );
};

export default AsistenciaEvento;