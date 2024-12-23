const epochToISOString = (epochMillis) => {
    return new Date(Number(epochMillis)).toISOString().split('T')[0];
  };
  
  const GetAccountingMovements = async (dateRange = null, concept = "RECARGA DE SALDO") => {
    if (dateRange) {
      const { startDate, endDate } = dateRange;
      try {
        console.log(`Consultando movimientos desde ${epochToISOString(startDate)} hasta ${epochToISOString(endDate)}`);
        const startTime = performance.now();
       
        const response = await fetch(
          `/api/AccountingMovement?startDate=${startDate}&endDate=${endDate}&concept=${encodeURIComponent(concept)}`
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
        console.error("Error fetching accounting movements:", error);
        return [];
      }
    }
  
    // Si no hay dateRange, obtener último mes
    const endDate = Date.now();
    const startDate = endDate - (30 * 24 * 60 * 60 * 1000); // 30 días atrás
    
    return await GetAccountingMovements({
      startDate,
      endDate
    }, concept);
  };
  
  const fetchMonthData = async (year, month, concept = "RECARGA DE SALDO") => {
    const startDate = new Date(year, month, 1).getTime();
    const endDate = new Date(year, month + 1, 0).getTime();
    return GetAccountingMovements({
      startDate,
      endDate
    }, concept);
  };
  
  export { GetAccountingMovements, fetchMonthData, epochToISOString };