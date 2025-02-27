import React, { useEffect, useState, useMemo } from 'react';
import { googleSheetsService } from '../utils/googleSheetsService';
import sheetsConfig from '../resources/TOCs/sheetsConfig.json';
import DataTable from 'react-data-table-component';
import { v4 as uuidv4 } from 'uuid';
import TransactionTable from "../components/Dashboard/TransactionTable.jsx";

/**
 * Componente para leer datos de Google Sheets usando react-data-table-component
 */
const GoogleSheetsReader = ({
  configName = 'recursosHumanos',
  onDataLoaded,
  className = '',
  height,
  showTotal = false
}) => {
  // Estados del componente
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Función para formatear valores
  const parseValue = (field, value) => {
    if (value === null || value === undefined) return '-';
    
    // Para fechas
    if (field.toLowerCase().includes('fecha') && typeof value === 'string' && value.includes('-')) {
      return value; // Mantener formato de fecha
    }
    
    // Para valores numéricos monetarios
    if (
      ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio'].some(term => 
        field.toLowerCase().includes(term)
      ) && typeof value === 'number'
    ) {
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return String(value);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    let isMounted = true;
    let dataLoaded = false;
    
    const loadData = async () => {
      if (dataLoaded) return;
      dataLoaded = true;
      
      try {
        // Buscar configuración
        const sheetConfig = sheetsConfig.sheets.find(sheet => sheet.name === configName);
        
        if (!sheetConfig) {
          throw new Error(`Configuración "${configName}" no encontrada`);
        }
        
        const { url, tabs } = sheetConfig;
        
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
        
        // Actualizar estados
        setData(processedData);
        setLoading(false);
        
        // Establecer la primera pestaña como activa
        if (Object.keys(processedData).length > 0) {
          setActiveTab(Object.keys(processedData)[0]);
        }
        
        // Notificar al componente padre
        if (onDataLoaded) {
          onDataLoaded(result.results);
        }
      } catch (err) {
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
  
  // Generar columnas para la tabla actual
  const tableColumns = useMemo(() => {
    if (!activeTab || !data[activeTab]) return [];
    
    return data[activeTab].columns.map(column => [
      column.charAt(0).toUpperCase() + column.slice(1), // Header
      column, // Field
      { // Config
        align: ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio']
          .some(term => column.toLowerCase().includes(term)) ? 'right' : 'left'
      }
    ]);
  }, [activeTab, data]);
  
  // Filtrar datos según el término de búsqueda
  const filteredData = useMemo(() => {
    if (!activeTab || !data[activeTab] || !searchTerm) {
      return data[activeTab]?.data || [];
    }
    
    return data[activeTab].data.filter(row => {
      return Object.entries(row).some(([field, value]) => {
        if (field === 'uniqueId') return false;
        const displayValue = parseValue(field, value);
        return String(displayValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [activeTab, data, searchTerm]);
  
  // Calcular total si es necesario
  const total = useMemo(() => {
    if (!showTotal || !activeTab || !data[activeTab]) return 0;
    
    const lastColumn = data[activeTab].columns[data[activeTab].columns.length - 1];
    
    return filteredData.reduce((sum, row) => {
      const value = Number(row[lastColumn]) || 0;
      return sum + value;
    }, 0).toFixed(2);
  }, [filteredData, showTotal, activeTab, data]);
  
  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={`google-sheets-reader ${className}`}>
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 mb-4">
          <h3 className="font-semibold mb-1">Error al cargar datos</h3>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && Object.keys(data).length > 0 && (
        <div className="card">
          {/* Updated Tabs Navigation */}
          <div className="row g-1">
            <div className="col-sm-12">
              <ul className="nav nav-tabs" role="tablist">
                {Object.entries(data).map(([tabName, tabData]) => (
                  <li key={tabName} className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === tabName ? "active" : ""}`}
                      onClick={() => setActiveTab(tabName)}
                    >
                      {tabName} ({tabData.records})
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
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsReader;