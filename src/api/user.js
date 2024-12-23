const formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
};

const getQuarterDates = (date) => {
  const currentQuarter = Math.floor(date.getMonth() / 3);
  const startDate = new Date(date.getFullYear(), currentQuarter * 3, 1);
  const endDate = new Date(date.getFullYear(), (currentQuarter + 1) * 3, 0);
  return {
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate)
  };
};

const GetUser = async (dateRange = null) => {
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    try {
      console.log(`Consultando usuarios desde ${startDate} hasta ${endDate}`);
      const startTime = performance.now();
     
      const response = await fetch(
        `/api/User/DateRange?startDate=${startDate}&endDate=${endDate}`
      );
     
      const endTime = performance.now();
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
     
      const result = await response.json();
      console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return [];
    }
  }
  // Si no hay dateRange, obtener el trimestre actual
  return await GetUser(getQuarterDates(new Date()));
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