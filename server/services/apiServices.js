import { Buffer } from 'buffer';
import { config } from '../config/default.js';

class ApiService {
  constructor() {
    const { username, password } = config.api.credentials;
    this.credentials = Buffer.from(`${username}:${password}`).toString('base64');
    this.baseUrl = config.api.baseUrl;
  }

  getHeaders() {
    return {
      Authorization: `Basic ${this.credentials}`,
      "Content-Type": "application/json",
    };
  }

  async fetchSignatureProcesses(startDate, endDate) {
    const response = await fetch(
      `${this.baseUrl}/apicerticamara/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: this.getHeaders()
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  }

  //Aqui se iran agregando los diferentes EndPoints que vayamos a necesitar

  async fetchUsersByDateRange(startDate , endDate){
    const response = await fetch(
      `${this.baseUrl}/apicerticamara/User/DataRange?startDate=${startDate}&endDate=${endDate}`,{
        headers:this.getHeaders()
      }
    );

    if(!response.ok){
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return await response.json();

  }
}

export const apiService = new ApiService();