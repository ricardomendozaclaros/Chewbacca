const GetEnterprises = async () => {
    try {
      const startTime = performance.now();
     
      const response = await fetch('/api/Enterprise/GetEnterprises');
     
      const endTime = performance.now();
     
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
     
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching enterprises:", error);
      return [];
    }
  };
  
  export { GetEnterprises };