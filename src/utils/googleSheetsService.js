import axios from 'axios';

/**
 * Servicio para interactuar con hojas de cálculo de Google
 * Implementa el patrón Singleton para asegurar una única instancia en la aplicación
 */
class GoogleSheetsService {
  static instance = null;
  
  /**
   * Constructor privado para prevenir instanciación directa
   */
  constructor() {}
  
  /**
   * Obtiene la instancia única del servicio (patrón Singleton)
   */
  static getInstance() {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }
  
  /**
   * Extrae el ID de la hoja de cálculo de una URL de Google Sheets
   * @param {string} url URL completa de Google Sheets
   * @returns {string} ID de la hoja de cálculo
   * @throws {Error} si no se puede extraer el ID
   */
  extractSheetId(url) {
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /key=([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new Error('No se pudo extraer el ID de la hoja de cálculo de la URL proporcionada');
  }

  /**
   * Analiza una línea CSV respetando comillas y campos con comas
   * @param {string} line Línea CSV a analizar
   * @returns {Array<string>} Array de valores
   */
  parseCSVLine(line) {
    if (!line || line.trim() === '') return [];
    
    const values = [];
    let insideQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        // Cambiar estado de "dentro/fuera de comillas"
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        // Si encontramos una coma fuera de comillas, es un separador
        values.push(currentValue);
        currentValue = '';
      } else {
        // Cualquier otro carácter, añadirlo al valor actual
        currentValue += char;
      }
    }
    
    // Añadir el último valor
    values.push(currentValue);
    
    // Limpiar comillas y espacios en blanco
    return values.map(val => val.replace(/^"(.*)"$/, '$1').trim());
  }

  /**
   * Intenta convertir un string a su tipo más apropiado (número, booleano, etc.)
   * @param {string} value Valor a convertir
   * @returns {any} Valor convertido al tipo apropiado
   */
  convertValueType(value) {
    // Remover espacios en blanco y comillas
    const trimmedValue = value.trim().replace(/^"(.*)"$/, '$1');
    
    // Si está vacío, devolver null
    if (trimmedValue === '') {
      return null;
    }
    
    // Verificar si es un booleano
    if (['true', 'verdadero', 'sí', 'si', 'yes'].includes(trimmedValue.toLowerCase())) return true;
    if (['false', 'falso', 'no'].includes(trimmedValue.toLowerCase())) return false;
    
    // Verificar si es un número
    // Acepta enteros, decimales y números con comas como separadores de miles
    if (/^-?\s*\d+(\.\d+)?(,\d+)?$/.test(trimmedValue)) {
      // Reemplazar comas por puntos para manejar formatos numéricos internacionales
      const normalized = trimmedValue.replace(/,/g, '.');
      return parseFloat(normalized);
    }
    
    // Verificar si es una fecha en formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?Z?)?$/.test(trimmedValue)) {
      return trimmedValue; // Mantenemos como string para preservar el formato exacto
    }
    
    // Para cualquier otro caso, devolver como string
    return trimmedValue;
  }

  /**
   * Convierte datos CSV a formato JSON dinámico
   * @param {string} csv Datos en formato CSV
   * @param {Object} options Opciones de procesamiento
   * @returns {Object} Objeto con datos y encabezados
   */
  csvToJson(csv, options = {}) {
    const { 
      autoTypeConversion = true,
      skipEmptyRows = true 
    } = options;
    
    const lines = csv.split('\n');
    if (lines.length <= 1) {
      return { data: [], headers: [] };
    }
    
    // Procesar la primera línea como encabezados
    const headers = this.parseCSVLine(lines[0]).map(header => header.trim());
    
    const data = [];
    
    // Procesar cada línea restante como un registro
    for (let i = 1; i < lines.length; i++) {
      if (skipEmptyRows && (!lines[i] || lines[i].trim() === '')) continue;
      
      const values = this.parseCSVLine(lines[i]);
      const obj = {};
      
      // Asignar cada valor al campo correspondiente
      headers.forEach((header, index) => {
        // Si no hay un valor para este campo, asignar null
        const rawValue = index < values.length ? values[index] : '';
        obj[header] = autoTypeConversion ? this.convertValueType(rawValue) : rawValue;
      });
      
      data.push(obj);
    }
    
    return { data, headers };
  }

  /**
   * Obtiene los datos de una hoja específica de un archivo de Google Sheets
   * con manejo de CORS usando la URL pública publicada en la web 
   * @param {string} sheetUrl URL base de la hoja de cálculo de Google
   * @param {string} gid ID de la pestaña específica
   * @param {Object} options Opciones de obtención de datos
   * @returns {Promise<Object>} Promesa que resuelve con los datos y metadatos
   */
  async getSheetTabData(sheetUrl, gid, options = {}) {
    try {
      const startTime = performance.now();
      
      const sheetId = this.extractSheetId(sheetUrl);
      
      // URL para la versión publicada en la web (evita problemas de CORS)
      // Esta URL requiere que la hoja esté publicada en Archivo > Publicar en la web
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      
      // Usar fetch en lugar de axios para mayor compatibilidad con CORS
      const response = await fetch(csvUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error de red al obtener la hoja: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      
      // Procesar el CSV a JSON
      const { data, headers } = this.csvToJson(csvText, options);
      
      const endTime = performance.now();
      
      return {
        data,
        headers,
        meta: {
          sheetId,
          gid,
          rowCount: data.length,
          processingTime: endTime - startTime
        }
      };
    } catch (error) {
      console.error(`Error al obtener los datos de la pestaña ${gid}:`, error);
      throw new Error(`Error al obtener datos de la pestaña ${gid}: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene datos de todas las pestañas configuradas en un archivo de hojas de cálculo
   * @param {string} sheetUrl URL base de la hoja de cálculo
   * @param {Array<Object>} tabs Configuración de pestañas (nombre y gid)
   * @param {Object} options Opciones de obtención de datos
   * @returns {Promise<Object>} Datos y metadatos de todas las pestañas
   */
  async getAllTabsData(sheetUrl, tabs, options = {}) {
    const results = {};
    const errors = [];
    const startTime = performance.now();

    // Procesar cada pestaña secuencialmente para evitar problemas de CORS
    // Esto es más lento pero más confiable
    for (const tab of tabs) {
      try {
        console.log(`Cargando pestaña "${tab.name}" (gid: ${tab.gid})...`);
        const result = await this.getSheetTabData(sheetUrl, tab.gid, options);
        
        results[tab.name] = {
          data: result.data,
          headers: result.headers,
          meta: result.meta
        };
        
        console.log(`Pestaña "${tab.name}" cargada correctamente con ${result.data.length} registros.`);
      } catch (error) {
        console.error(`Error al cargar pestaña "${tab.name}":`, error);
        errors.push({ tab: tab.name, error: error.message });
      }
      
      // Agregar un pequeño retraso entre solicitudes para evitar limitaciones de tasa
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const endTime = performance.now();
    
    return {
      results,
      errors,
      meta: {
        tabCount: Object.keys(results).length,
        errorCount: errors.length,
        totalProcessingTime: endTime - startTime
      }
    };
  }

  /**
   * Comprueba si una hoja de cálculo es accesible públicamente
   * @param {string} sheetId ID de la hoja de cálculo
   * @returns {Promise<boolean>} Verdadero si es accesible, falso en caso contrario
   */
  async checkPublicAccess(sheetId) {
    try {
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error al verificar acceso público:', error);
      return false;
    }
  }
}

// Exportar la instancia única del servicio
export const googleSheetsService = GoogleSheetsService.getInstance();

// Exportar también la clase para casos de prueba o usos avanzados
export default GoogleSheetsService;