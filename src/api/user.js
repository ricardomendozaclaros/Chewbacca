const formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
};


const GetUser = async (dateRange = null) => {
  if (!dateRange) {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dateRange = { startDate, endDate };
  }

  const { startDate, endDate } = dateRange;
  
  try {
    console.log(`📊 Consultando usuarios para el rango:`, { startDate, endDate });
    
    const response = await fetch(
      `/api/User/DataRange?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Intentar leer la respuesta y loguear su contenido
    const text = await response.text();
    console.log('Respuesta raw:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error parseando JSON:', e);
      console.log('Texto que causó el error:', text);
      return [];
    }

    console.log('Datos recibidos:', data);
    return data;
    
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};

const fetchUserQuarterData = async (year, quarter) => {
  const startDate = new Date(year, quarter * 3, 1);
  const endDate = new Date(year, (quarter + 1) * 3, 0);
  return GetUser({
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate)
  });
};

export { GetUser, fetchUserQuarterData, formatDateToISOString };