import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

// Define la cantidad de ítems que deseas por cada hoja
const ITEMS_PER_PAGE = 20; // Ajustado para familias

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
  table: {
    display: "table",
    width: "auto",
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
  // Estilos de cabecera de columna para familias
  tableColHeaderNombreFamilia: {
    width: "20%",
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableColHeaderJefeFamilia: {
    width: "18%",
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableColHeaderMiembros: {
    width: "30%",
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableColHeaderDireccion: {
    width: "20%",
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableColHeaderTelefono: {
    width: "10%",
    padding: 6,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 8,
  },

  // Estilos de celda de contenido para familias
  tableColNombreFamilia: {
    width: "20%",
    padding: 6,
    textAlign: "center",
    fontSize: 7,
  },
  tableColJefeFamilia: {
    width: "18%",
    padding: 6,
    textAlign: "center",
    fontSize: 7,
  },
  tableColMiembros: {
    width: "30%",
    padding: 6,
    textAlign: "left",
    fontSize: 6,
  },
  tableColDireccion: {
    width: "20%",
    padding: 6,
    textAlign: "center",
    fontSize: 7,
  },
  tableColTelefono: {
    width: "10%",
    padding: 6,
    textAlign: "center",
    fontSize: 7,
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

const ReporteFamilias = ({ familias, totalFamilias }) => {
  const nombreEmpresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA;
  const direccionEmpresa = process.env.NEXT_PUBLIC_DIRECCION_EMPRESA;

  const getPaginatedFamilias = (data, itemsPerPage) => {
    const pages = [];
    for (let i = 0; i < data.length; i += itemsPerPage) {
      pages.push(data.slice(i, i + itemsPerPage));
    }
    if (pages.length === 0) {
      pages.push([]);
    }
    return pages;
  };

  const paginatedFamilias = getPaginatedFamilias(familias, ITEMS_PER_PAGE);

  return (
    <Document>
      {paginatedFamilias.map((pageFamilias, pageIndex) => (
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
            <Text>Reporte de Familias</Text>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={styles.tableColHeaderNombreFamilia}>Nombre de Familia</Text>
              <Text style={styles.tableColHeaderJefeFamilia}>Jefe de Familia</Text>
              <Text style={styles.tableColHeaderMiembros}>Miembros de la Familia</Text>
              <Text style={styles.tableColHeaderDireccion}>Dirección</Text>
              <Text style={styles.tableColHeaderTelefono}>Teléfono</Text>
            </View>

            {pageFamilias && pageFamilias.length > 0 ? (
              pageFamilias.map((familia, index) => (
                <View key={familia.id_fam || `${pageIndex}-${index}`} style={styles.tableRow}>
                  <Text style={styles.tableColNombreFamilia}>{familia.nombre_fam}</Text>
                  <Text style={styles.tableColJefeFamilia}>{familia.jefe_nombre}</Text>
                  <Text style={styles.tableColMiembros}>
                    {familia.miembros && familia.miembros.length > 0
                      ? familia.miembros.map(miembro => `${miembro.nombre} (${miembro.parentesco})`).join('\n')
                      : 'Sin miembros adicionales'
                    }
                  </Text>
                  <Text style={styles.tableColDireccion}>{familia.jefe_direccion}</Text>
                  <Text style={styles.tableColTelefono}>{familia.jefe_telefono}</Text>
                </View>
              ))
            ) : (
              pageIndex === 0 && familias.length === 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.noData}>
                    No se encontraron familias registradas.
                  </Text>
                </View>
              )
            )}
          </View>

          {pageIndex === paginatedFamilias.length - 1 && familias.length > 0 && (
            <View>
              <Text style={styles.total}>
                Total de Familias: {totalFamilias}
              </Text>
            </View>
          )}

          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} fixed />
        </Page>
      ))}
    </Document>
  );
};

export default ReporteFamilias;
