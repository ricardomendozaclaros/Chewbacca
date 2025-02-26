const formatDateToISOString = (date) => {
  return date.toISOString().split("T")[0];
};

const getQuarterDates = (date) => {
  const currentQuarter = Math.floor(date.getMonth() / 3);
  const startDate = new Date(date.getFullYear(), currentQuarter * 3, 1);
  const endDate = new Date(date.getFullYear(), (currentQuarter + 1) * 3, 0);

  return {
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate),
  };
};

const GetSignatureProcesses = async (dateRange = null) => {
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    try {
      console.log(`Consultando firmas desde ${startDate} hasta ${endDate}`);
      const startTime = performance.now();

      const response = await fetch(
        `/api/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}`
      );

      const endTime = performance.now();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  // Si no hay dateRange, obtener el trimestre actual
  return await GetSignatureProcesses(getQuarterDates(new Date()));
};

// Función para cargar datos por trimestre
const fetchQuarterData = async (year, quarter) => {
  const startDate = new Date(year, quarter * 3, 1);
  const endDate = new Date(year, (quarter + 1) * 3, 0);
  return GetSignatureProcesses({
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate),
  });
};

export { GetSignatureProcesses, fetchQuarterData, formatDateToISOString };
