// api/signatureProcess.js
const formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
};

const getLastTwoWeeksDates = () => {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 30); // Retroceder 14 días
  
  return {
    startDate: formatDateToISOString(twoWeeksAgo),
    endDate: formatDateToISOString(today)
  };
};

const GetSignatureProcessesCertifirma = async (dateRange = null) => {
  try {
    let startDate, endDate;

    if (dateRange) {
      ({ startDate, endDate } = dateRange);
    } else {
      const { startDate: defaultStart, endDate: defaultEnd } = getLastTwoWeeksDates();
      startDate = defaultStart;
      endDate = defaultEnd;
    }

    console.log(`Consultando firmas desde ${startDate} hasta ${endDate}`);
    const startTime = performance.now();

    // Primero intenta obtener los datos de Redis
    const redisResponse = await fetch(
      `/api/SignatureProcessesCertifirma/DateRange?startDate=${startDate}&endDate=${endDate}`
    );

    if (!redisResponse.ok) {
      throw new Error(`HTTP error! Status: ${redisResponse.status}`);
    }

    const redisData = await redisResponse.json();

    // Verifica si los datos de Redis son válidos o si están vacíos
    if (redisData.length === 0 || !redisData) {
      console.log("Datos no encontrados en Redis, consultando base de datos...");

      // Si no hay datos en Redis, llama a la base de datos
      const dbResponse = await fetch(
        `/api/SignatureProcessesCertifirma/Database?startDate=${startDate}&endDate=${endDate}`
      );

      if (!dbResponse.ok) {
        throw new Error(`HTTP error! Status: ${dbResponse.status}`);
      }

      const dbData = await dbResponse.json();

      const endTime = performance.now();
      console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
      return dbData;
    }

    const endTime = performance.now();
    console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
    return redisData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export { GetSignatureProcessesCertifirma, formatDateToISOString };