const GetSignatureProcesses = async () => {
  const username = "test@test.com";
  const password = "123456";

  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch(
      "/api/apicerticamara/SignatureProcesses/DateRange?startDate=2024-10-10&endDate=2024-11-11",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export { GetSignatureProcesses };
