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
      'Authorization': `Basic ${this.credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async fetchSignatureProcesses(startDate, endDate) {
    const headers = this.getHeaders();
    console.log('Request URL:', `${this.baseUrl}/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}`);
    console.log('Headers:', headers);
    
    const response = await fetch(
      `${this.baseUrl}/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}`,
      {
        headers
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  }

  //Aqui se iran agregando los diferentes EndPoints que vayamos a necesitar

  async fetchUsersByDateRange(startDate, endDate) {
    const headers = this.getHeaders();
    console.log('Request URL:', `${this.baseUrl}/User/DateRange?startDate=${startDate}&endDate=${endDate}`);
    console.log('Headers:', headers);

    const response = await fetch(
      `${this.baseUrl}/User/DateRange?startDate=${startDate}&endDate=${endDate}`, // Corregido DataRange a DateRange
      {
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  }
}

export const apiService = new ApiService();