export const GetSignatureProcessDetail = async (id) => {
    try {
      const response = await fetch(
        `https://ghzesn7x9c.execute-api.us-east-1.amazonaws.com/prod/getsignatureprocesses/detail/${id}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching signature process detail:', error);
      throw error;
    }
  };