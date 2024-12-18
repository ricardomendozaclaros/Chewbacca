// src/api/signatureProcess.js
const GetSignatureProcesses = async () => {
  const username = "test@test.com";
  const password = "123456";
  const credentials = btoa(`${username}:${password}`);
  try {
    const startTime = performance.now();
    const response = await fetch(
      "/api/apicerticamara/SignatureProcesses/DateRange?startDate=2024-01-01&endDate=2024-12-31",
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
    
    // Mostrar tiempo de respuesta
    console.log(`Tiempo de respuesta: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export { GetSignatureProcesses };