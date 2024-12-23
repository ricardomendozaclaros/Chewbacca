const GetEnterprises = async () => {
    try {
      console.log('Consultando lista de empresas');
      const startTime = performance.now();
     
      const response = await fetch('/api/Enterprise/GetEnterprises');
     
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
      console.error("Error fetching enterprises:", error);
      return [];
    }
  };
  
  export { GetEnterprises };