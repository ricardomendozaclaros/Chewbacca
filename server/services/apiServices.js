import { Buffer } from 'buffer';
import { config } from '../config/default.js';

class ApiService {
  constructor() {
    const { username, password } = config.api.credentials;
    this.credentials = Buffer.from(`${username}:${password}`).toString('base64');
    this.baseUrl = config.api.baseUrl;
    this.timeout = 300000; // 5 minutos
    this.maxRetries = 3;  // Número máximo de intentos
  }

  getHeaders() {
    return {
      'Authorization': `Basic ${this.credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    };
  }

  // Método para hacer fetch con timeout y reintentos
  async fetchWithRetries(url, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`📡 Intento ${attempt} de ${this.maxRetries} - ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error en intento ${attempt}:`, errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log(`✅ Intento ${attempt} exitoso`);
        return response;

      } catch (error) {
        console.error(`❌ Error en intento ${attempt}:`, error.message);
        lastError = error;
        
        if (attempt < this.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  async fetchSignatureProcesses(startDate, endDate) {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}&pageSize=10000000&pageNumber=1`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/SignatureProcesses/DateRange?startDate=${startDate}&endDate=${endDate}&pageSize=10000000&pageNumber=1`,
      { headers }
    );
    
    return await response.json();
  }

  async fetchUsersByDateRange(startDate, endDate) {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/User/DataRange?startDate=${startDate}&endDate=${endDate}`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/User/DataRange?startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    
    return await response.json();
  }

  async fetchEnterprises() {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/Enterprise/GetEnterprises`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/Enterprise/GetEnterprises`,
      { headers }
    );

    return await response.json();
  }

  async fetchAccountingMovements(startDate, endDate, concept) {
    const headers = this.getHeaders();
    console.log('Request URL:', `${this.baseUrl}/AccountingMovement?startDate=${startDate}&endDate=${endDate}&concept=${encodeURIComponent(concept)}`);
    console.log('Headers:', headers);

    const response = await this.fetchWithRetries(
      `${this.baseUrl}/AccountingMovement?startDate=${startDate}&endDate=${endDate}&concept=${encodeURIComponent(concept)}`,
      { headers }
    );

    return await response.json();
  }

  async fetchCustomerAccounts(limit = 4000) {
    const headers = this.getHeaders();
    console.log('Request URL:', `${this.baseUrl}/CustomerAccount?limit=${limit}`);
    console.log('Headers:', headers);
   
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/CustomerAccount?limit=${limit}`,
      { headers }
    );
   
    return await response.json();
}

  async fetchCountSigningCore(clientId, startDate, endDate) {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/SignatureProcesses/GetCountSingingCore?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/SignatureProcesses/GetCountSingingCore?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    
    return await response.json();
  }

  async fetchCountMPL(clientId, startDate, endDate) {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/SignatureProcesses/GetCountMPL?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/SignatureProcesses/GetCountMPL?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    
    return await response.json();
  }

  async fetchCountPromissoryNote(clientId, startDate, endDate) {
    const headers = this.getHeaders();
    console.log('🔄 Request URL:', `${this.baseUrl}/SignatureProcesses/GetCountPromissoryNote?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`);
    
    const response = await this.fetchWithRetries(
      `${this.baseUrl}/SignatureProcesses/GetCountPromissoryNote?clientID=${clientId}&startDate=${startDate}&endDate=${endDate}`,
      { headers }
    );
    
    return await response.json();
  }
}

export const apiService = new ApiService();