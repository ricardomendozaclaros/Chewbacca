// Función para obtener el conteo de SigningCore
export const GetCountSigningCore = async (clientId, startDate, endDate) => {
  try {
    const response = await fetch(
      `/api/signature/GetCountSigningCore?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SigningCore count:', error);
    throw error;
  }
};

// Función para obtener el conteo de MPL
export const GetCountMPL = async (clientId, startDate, endDate) => {
  try {
    const response = await fetch(
      `/api/signature/GetCountMPL?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching MPL count:', error);
    throw error;
  }
};

// Función para obtener el conteo de PromissoryNote
export const GetCountPromissoryNote = async (clientId, startDate, endDate) => {
  try {
    const response = await fetch(
      `/api/signature/GetCountPromissoryNote?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching PromissoryNote count:', error);
    throw error;
  }
};

// Función helper para formatear fechas
export const formatDateForAPI = (date, isStartDate = true) => {
  if (!date) return null;
  
  const d = new Date(date);
  
  if (isStartDate) {
    // Para fecha inicial: establecer a 00:00:00
    d.setHours(0, 0, 0, 0);
  } else {
    // Para fecha final: establecer a 23:59:59
    d.setHours(23, 59, 59, 999);
  }
  
  // Retornar timestamp en milisegundos
  return d.getTime();
};
