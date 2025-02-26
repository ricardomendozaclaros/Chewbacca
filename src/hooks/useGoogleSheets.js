import { useState, useEffect, useRef } from 'react';
import { googleSheetsService } from '../utils/googleSheetsService';
import sheetsConfig from '../resources/TOCs/sheetsConfig.json';

/**
 * Hook personalizado para cargar datos de Google Sheets según la configuración
 *
 * @param {string} configName Nombre de la configuración en sheetsConfig.json
 * @param {Object} options Opciones para la obtención de datos
 * @returns {Object} Estado con los datos, errores y estado de carga
 */
export function useSheetsConfig(configName, options = {}) {
  const [state, setState] = useState({
    data: {},
    loading: true,
    error: null,
    meta: null
  });
  
  // Usar un ref para evitar múltiples solicitudes
  const requestInProgressRef = useRef(false);
  const optionsRef = useRef(options);
  
  // Actualizar la referencia de opciones sin disparar el efecto
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    let isMounted = true;
    
    const loadSheetData = async () => {
      // Evitar múltiples solicitudes simultáneas
      if (requestInProgressRef.current) return;
      requestInProgressRef.current = true;
      
      try {
        if (isMounted) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }
        
        console.log("Cargando configuración:", configName);
        
        // Buscar la configuración en el archivo JSON
        const sheetConfig = sheetsConfig.sheets.find(sheet => sheet.name === configName);
        
        if (!sheetConfig) {
          throw new Error(`Configuración "${configName}" no encontrada en sheetsConfig.json`);
        }
        
        const { url, tabs } = sheetConfig;
        
        // Mostrar feedback de carga
        console.log(`Cargando datos de ${tabs.length} pestañas desde Google Sheets...`);
        
        // Intentar cargar los datos con manejo de errores mejorado
        const result = await googleSheetsService.getAllTabsData(url, tabs, optionsRef.current);
        
        // No actualizar el estado si el componente se desmontó
        if (!isMounted) {
          requestInProgressRef.current = false;
          return;
        }
        
        // Comprobar si tenemos al menos algunos datos
        if (Object.keys(result.results).length === 0) {
          console.warn('No se pudieron cargar datos de ninguna pestaña.');
          if (result.errors.length > 0) {
            throw new Error('No se pudieron cargar datos. ' + result.errors[0].error);
          }
        }
        
        // Registrar datos en consola de forma más controlada
        console.log(`Datos de hojas de cálculo "${configName}" cargados. Tabs: ${Object.keys(result.results).join(', ')}`);
        
        // Preprocesamos los datos para asegurarnos que cada pestaña tiene sus encabezados disponibles
        const processedData = {};
        
        Object.entries(result.results).forEach(([tabName, tabData]) => {
          processedData[tabName] = {
            ...tabData,
            // Si no existen headers, intentamos extraerlos del primer objeto
            headers: tabData.headers || (tabData.data.length > 0 ? Object.keys(tabData.data[0]) : [])
          };
        });
        
        // Actualizar el estado con los datos obtenidos
        setState({
          data: processedData,
          loading: false,
          error: result.errors.length > 0 ? result.errors : null,
          meta: result.meta
        });
        
        // Restablecer el flag de solicitud en progreso
        requestInProgressRef.current = false;
        
        return result;
      } catch (error) {
        const errorMessage = error.message || 'Error desconocido al cargar datos';
        console.error('Error al cargar configuración de hojas:', errorMessage);
        
        // No actualizar el estado si el componente se desmontó
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage
          }));
        }
        
        // Restablecer el flag de solicitud en progreso
        requestInProgressRef.current = false;
        
        return { error: errorMessage };
      }
    };
    
    if (configName && !requestInProgressRef.current) {
      loadSheetData();
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [configName]); // Eliminamos options de las dependencias
  
  return state;
}