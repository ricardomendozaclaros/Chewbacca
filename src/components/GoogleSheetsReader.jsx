import React, { useEffect, useState, useMemo, useRef } from 'react';
import { googleSheetsService } from '../utils/googleSheetsService';
import sheetsConfig from '../resources/TOCs/sheetsConfig.json';
import { v4 as uuidv4 } from 'uuid';
import TransactionTable from "../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../components/Dashboard/TotalsCardComponent.jsx";

/**
 * Componente para leer datos de Google Sheets usando TransactionTable
 */
const GoogleSheetsReader = ({
  configName = 'recursosHumanos',
  onDataLoaded,
  className = '',
  height,
  showTotal = false,
  dateRange = [null, null], // Prop para recibir el rango de fechas
  filterByDate = false     // Prop para indicar si se debe filtrar por fecha
}) => {
  // Estados del componente
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const dataLoadedRef = useRef(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      // Evitar cargar múltiples veces
      if (dataLoadedRef.current) return;
      console.log("Iniciando carga de datos desde Google Sheets...");
      
      try {
        // Buscar configuración
        const sheetConfig = sheetsConfig.sheets.find(sheet => sheet.name === configName);
        
        if (!sheetConfig) {
          throw new Error(`Configuración "${configName}" no encontrada`);
        }
        
        const { url, tabs } = sheetConfig;
        console.log(`Cargando datos de ${url} con pestañas:`, tabs);
        
        // Cargar datos
        const result = await googleSheetsService.getAllTabsData(url, tabs, {
          autoTypeConversion: true,
          skipEmptyRows: true
        });
        
        if (!isMounted) return;
        
        // Preparar datos
        const processedData = {};
        
        Object.entries(result.results).forEach(([tabName, tabData]) => {
          // Extraer encabezados del primer objeto si no están disponibles
          const headers = tabData.headers || 
            (tabData.data.length > 0 ? Object.keys(tabData.data[0]) : []);
          
          // Añadir id único a cada fila
          const dataWithIds = tabData.data.map(row => ({
            ...row,
            uniqueId: uuidv4()
          }));
          
          processedData[tabName] = {
            records: dataWithIds.length,
            columns: headers,
            data: dataWithIds
          };
        });
        
        console.log("Datos procesados:", processedData);
        
        // Actualizar estados
        setData(processedData);
        setLoading(false);
        dataLoadedRef.current = true;
        
        // Establecer la primera pestaña como activa
        if (Object.keys(processedData).length > 0) {
          const firstTab = Object.keys(processedData)[0];
          setActiveTab(firstTab);
          console.log(`Estableciendo pestaña activa: ${firstTab}`);
        }
        
        // Notificar al componente padre
        if (onDataLoaded) {
          console.log("Notificando datos cargados al componente padre");
          onDataLoaded(processedData);
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [configName, onDataLoaded]);

  // Función para formatear valores
  const parseValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    // Para fechas
    if (field.toLowerCase().includes('fecha') && typeof value === 'string' && value.includes('-')) {
      return value; // Mantener formato de fecha
    }
    
    // Para valores numéricos monetarios
    if (
      ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio', 'recarga'].some(term => 
        field.toLowerCase().includes(term)
      ) && typeof value === 'number'
    ) {
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return String(value);
  };

  // Generar columnas para la tabla actual
  const tableColumns = useMemo(() => {
    if (!activeTab || !data[activeTab]) return [];
    
    return data[activeTab].columns.map(column => [
      column.charAt(0).toUpperCase() + column.slice(1), // Header
      column, // Field
      { // Config
        align: ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio', 'recarga']
          .some(term => column.toLowerCase().includes(term)) ? 'right' : 'left'
      }
    ]);
  }, [activeTab, data]);
  
  // Aplicar filtro de fechas a los datos
  const filteredData = useMemo(() => {
    if (!activeTab || !data[activeTab]) return [];
    
    let result = [...data[activeTab].data];
    console.log(`Filtrando datos para pestaña ${activeTab}, filterByDate: ${filterByDate}`);
    
    // Aplicar filtro de fechas si está habilitado
    if (filterByDate && dateRange[0] !== null) {
      const [startDate, endDate] = dateRange;
      console.log(`Aplicando filtro de fechas: ${startDate} - ${endDate}`);
      
      result = result.filter(item => {
        // Buscar la primera columna que contiene una fecha
        const dateColumns = data[activeTab].columns.filter(col => 
          col.toLowerCase().includes('fecha') || col.toLowerCase().includes('date')
        );
        
        if (dateColumns.length === 0) return true; // Si no hay columnas de fecha, incluir todas las filas
        
        const dateField = dateColumns[0];
        const itemDate = new Date(item[dateField]);
        
        // Si la fecha no es válida, incluir la fila
        if (isNaN(itemDate.getTime())) return true;
        
        // Filtrar por rango de fechas
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        
        return true;
      });
      
      console.log(`Datos filtrados: ${result.length} de ${data[activeTab].data.length}`);
    }
    
    return result;
  }, [activeTab, data, dateRange, filterByDate]);

  // Calcular el total de recargas
const totalRecargas = useMemo(() => {
  if (!filteredData.length) return 0;
  
  // Buscar la columna de recarga - ahora insensible a mayúsculas/minúsculas
  const recargaField = Object.keys(filteredData[0]).find(
    key => key.toLowerCase().includes('recarga')
  );
  
  if (!recargaField) {
    console.warn('No se encontró columna de recarga:', Object.keys(filteredData[0]));
    return 0;
  }
  
  console.log('Columna de recarga encontrada:', recargaField);
  console.log('Valores de recarga:', filteredData.map(item => item[recargaField]));
  
  // Sumar los valores de recarga
  let total = 0;
  filteredData.forEach(item => {
    const value = item[recargaField];
    if (value) {
      // Manejar valores que pueden ser strings con formato "$100.000,00"
      if (typeof value === 'string') {
        const numericValue = value.replace(/[^\d.,]/g, '')  // Quitar símbolos como $ y espacios
                            .replace(/\./g, '')            // Quitar puntos de miles
                            .replace(',', '.');            // Cambiar coma por punto para decimales
        total += parseFloat(numericValue) || 0;
      } else {
        total += parseFloat(value) || 0;
      }
    }
  });
  
  console.log('Total calculado:', total);
  return total;
}, [filteredData]);

  

  console.log("Estado de renderizado:", {
    loading,
    error,
    dataLength: Object.keys(data).length,
    activeTab,
    filteredDataLength: filteredData.length
  });

  // Renderizado con estructura simplificada
  return (
    <div className={`google-sheets-reader ${className}`}>
      {loading ? (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 mb-4">
          <h3 className="font-semibold mb-1">Error al cargar datos</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="card">
          {/* Tarjeta de totales */}
          <div className="row g-1 mb-3">
            <div className="col-md-4">
              <TotalsCardComponent
                data={totalRecargas}
                title="Total Recargas"
                subTitle="COP"
                description="Suma total de recargas en los registros mostrados"
                icon="bi bi-currency-dollar"
                iconBgColor="#e1f5fe"
                unknown={false}
              />
            </div>
          </div>
          
          {/* Pestañas */}
          {Object.keys(data).length > 0 && (
            <div className="row g-1">
              <div className="col-sm-12">
                <ul className="nav nav-tabs" role="tablist">
                  {Object.entries(data).map(([tabName, tabData]) => (
                    <li key={tabName} className="nav-item" role="presentation">
                      <button
                        className={`nav-link ${activeTab === tabName ? "active" : ""}`}
                        onClick={() => setActiveTab(tabName)}
                      >
                        {tabName} ({
                          filterByDate 
                            ? filteredData.length
                            : tabData.records
                        })
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content mt-3">
                  {activeTab && data[activeTab] && (
                    <div className="tab-pane fade show active">
                      <TransactionTable
                        data={filteredData}
                        title=""
                        subTitle=""
                        description=""
                        columns={tableColumns}
                        height={height}
                        pagination={true}
                        rowsPerPage={15}
                        groupByOptions={[]}
                        showTotal={showTotal}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsReader;