import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image, // Si no usas Image con Logo, puedes quitarlo
} from "@react-pdf/renderer";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 4,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 1,
    textAlign: "center",
  },
  logo: {
    width: 100, // Aumentar el tamaño del logo
    height: "auto",
    marginBottom: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  address: {
    fontSize: 12,
    marginBottom: 5,
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
    border: "1px solid #000", // Añadir borde a la sección
    borderRadius: 5,
  },
  table: {
    display: "table",
    width: "auto",
    height: "auto",
    marginTop: "10",
    alignItems: "center",
    //border: "1px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  tableColHeader: {
    width: "20%", // Ajusta los anchos para 5 columnas
    backgroundColor: "#f2f2f2",
    padding: 8,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
    borderBottom: "2px solid #000", // Borde inferior más grueso
  },
  tableCol: {
    width: "20%", // Ajusta los anchos para 5 columnas
    padding: 10,
    textAlign: "center",
    fontSize: 8,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 12,
    color: "#777",
  },
  date: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 12,
  },
  total: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
    // Asegurarte de que este estilo se aplique a un <Text>
  },
});

// Cambia la desestructuración de las props para recibir asistencias, totalAsistentes y rangoFechas
const AsistenciaEvento = ({ asistencias, totalAsistentes }) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA;
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA;

  const formatDate = (dateString) => {
    // Asegúrate de que la fecha sea válida antes de formatear
    if (!dateString) return "N/A"; 
    const date = new Date(dateString);
    // Verificar si la fecha es inválida después de la creación
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day} - ${month} - ${year}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {/* <Image src={Logo} style={styles.logo} /> */}
          <Text style={styles.companyName}>
            {nombreEmpresa || "Nombre no disponible"}
          </Text>
          <Text style={styles.address}>
            {direccionEmpresa || "Dirección no disponible"}
          </Text>
          <Text style={styles.date}>
            Fecha de Generación: {new Date().toLocaleDateString('es-ES')} {/* Formato español */}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>
            Reporte de Miembros {/* Título ajustado al contenido */}
          </Text>
          

          <View style={styles.table}>
            <View style={styles.tableRow}>
              {/* Encabezados de tabla ajustados a los datos de eventos */}
              <Text style={styles.tableColHeader}>Cedula</Text>
              <Text style={styles.tableColHeader}>Nombre</Text>
              <Text style={styles.tableColHeader}>Direccion</Text>
              <Text style={styles.tableColHeader}>Telefono</Text>
              <Text style={styles.tableColHeader}>Fecha de Nacimiento</Text>
            </View>
            {/* Aquí 'asistencias' es el array de eventos */}
            {asistencias && Array.isArray(asistencias) && asistencias.length > 0 ? (
              asistencias.map((miembro, index) => ( // Renombra 'item' a 'evento' para claridad
                <View key={miembro.cedula_mie || index} style={styles.tableRow}> {/* Usar codigo_eve como key */}
                  <Text style={styles.tableCol}>{miembro.cedula_mie}</Text>
                  <Text style={styles.tableCol}>{miembro.nombre_mie}</Text>
                  <Text style={styles.tableCol}>{miembro.direccion_mie}</Text>
                  <Text style={styles.tableCol}>
                    {miembro.telefono_mie}
                  </Text>
                  <Text style={styles.tableCol}>{formatDate(miembro.fechanacimiento_mie)}</Text>
                </View>
              ))
            ) : (
                <View style={styles.tableRow}>
                    <Text style={{ ...styles.tableCol, width: "100%", textAlign: "center" }}>
                        No se encontraron eventos en el período seleccionado.
                    </Text>
                </View>
            )}
          </View>
          {/* Mover el total fuera del View de la tabla, pero dentro de la sección */}
          {asistencias && asistencias.length > 0 && (
            <Text style={styles.total}>
              Total de Eventos: {totalAsistentes} {/* Usa totalAsistentes */}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default AsistenciaEvento;