import axios from "axios";

export const loadFamilias = async () => {
  try {
    // CORRECCIÓN: Usar siempre la URL absoluta para las llamadas a la API en Componentes de Servidor.
    // Esto asegura que la llamada funcione durante el `build` y en producción.
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/familias`
    );
    return data.familias;
  } catch (error) {
    console.error("Error loading familias:", error);
    // Puedes retornar un array vacío o lanzar el error dependiendo de cómo quieras manejarlo
    return [];
  }
};
