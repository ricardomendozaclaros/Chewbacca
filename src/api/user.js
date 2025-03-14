// api/signatureProcess.js
const formatDateToISOString = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const getDefaultDateRange = () => {
  const today = new Date();
  const defaultStart = new Date(today);
  defaultStart.setDate(today.getDate() - 20);
  
  return {
    startDate: formatDateToISOString(defaultStart),
    endDate: formatDateToISOString(today)
  };
};

const GetUsers = async (dates = null) => {
  try {
    let startDate, endDate;

    if (dates?.startDate || dates?.endDate) {
      startDate = formatDateToISOString(dates.startDate || dates.endDate);
      endDate = formatDateToISOString(dates.endDate || dates.startDate);
    } else {
      ({ startDate, endDate } = getDefaultDateRange());
    }

    console.log(`Consultando usuarios desde ${startDate} hasta ${endDate}`);
    const startTime = performance.now();

    // Primero intenta obtener los datos de Redis
    const redisResponse = await fetch(
      `/api/User/DataRange?startDate=${startDate}&endDate=${endDate}`
    );

    if (!redisResponse.ok) {
      throw new Error(`HTTP error! Status: ${redisResponse.status}`);
    }

    const redisData = await redisResponse.json();

    const endTime = performance.now();
    console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
    return redisData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export { GetUsers };