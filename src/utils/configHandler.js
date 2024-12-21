const API_URL = "http://localhost:3001/api/config"; // Cambia al host de tu servidor si es necesario

/**
 * Carga la configuración de una página desde el backend.
 * @param {string} page - El nombre de la página (ejemplo: "Page2").
 * @returns {Promise<Object[]>} - Retorna el layout cargado.
 */
export const loadConfig = async (page) => {
  try {
    const response = await fetch(`${API_URL}/${page}`);
    if (!response.ok) {
      throw new Error("Error al cargar la configuración.");
    }
    const data = await response.json();
    return data.layout || [];
  } catch (error) {
    console.error(`Error al cargar la configuración de ${page}:`, error);
    return [];
  }
};

/**
 * Guarda la configuración de una página en el backend.
 * @param {string} page - El nombre de la página (ejemplo: "Page2").
 * @param {Object[]} layout - El layout que se guardará.
 * @returns {Promise<void>}
 */
export const saveConfig = async (page, layout) => {
  try {
    const response = await fetch(`${API_URL}/${page}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ layout }),
    });

    if (!response.ok) {
      throw new Error("Error al guardar la configuración.");
    }

    console.log(`Configuración de ${page} guardada exitosamente.`);
  } catch (error) {
    console.error(`Error al guardar la configuración de ${page}:`, error);
  }
};
