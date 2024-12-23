const GetCustomerAccounts = async (limit = 4000) => {
    try {
      console.log(`Consultando cuentas de clientes (límite: ${limit})`);
      const startTime = performance.now();
     
      const response = await fetch(
        `/api/CustomerAccount?limit=${limit}`
      );
     
      const endTime = performance.now();
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
     
      const result = await response.json();
      console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`Total de cuentas recibidas: ${result.length}`);
      return result;
    } catch (error) {
      console.error("Error fetching customer accounts:", error);
      return [];
    }
  };
  
  export { GetCustomerAccounts };