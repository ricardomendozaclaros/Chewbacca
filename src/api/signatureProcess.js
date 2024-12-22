// src/api/signatureProcess.js

const formatDateToISOString = (date) => {
  return date.toISOString().split('T')[0];
};

const getYearDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 1);
  
  return {
    startDate: formatDateToISOString(startDate),
    endDate: formatDateToISOString(endDate)
  };
};

const GetSignatureProcesses = async (dateRange = null) => {
  const username = "test@test.com";
  const password = "123456";
  const credentials = btoa(`${username}:${password}`);
  
  // Usar el rango de fechas proporcionado o el predeterminado
  const { startDate, endDate } = dateRange || getYearDateRange();

  try {
    const startTime = performance.now();
    const response = await fetch(
      `/api/apicerticamara/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      }
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

export { GetSignatureProcesses };