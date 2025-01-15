// api/signatureProcess.js
const formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
};

const getLastTwoWeeksDates = () => {
  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14); // Retroceder 14 días
  
  return {
    startDate: formatDateToISOString(twoWeeksAgo),
    endDate: formatDateToISOString(today)
  };
};

const GetSignatureProcesses = async (dateRange = null) => {
  try {
    let startDate, endDate;
    
    if (dateRange) {
      ({ startDate, endDate } = dateRange);
    } else {
      ({ startDate, endDate } = getLastTwoWeeksDates());
    }

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
};

export { GetSignatureProcesses, formatDateToISOString };