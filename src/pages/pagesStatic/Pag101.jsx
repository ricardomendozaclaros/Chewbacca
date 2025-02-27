import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../components/Dashboard/TotalsCardComponent.jsx";
import { googleSheetsService } from '../../utils/googleSheetsService';
import sheetsConfig from '../../resources/TOCs/sheetsConfig.json';

export default function Pag101() {
  // Datos originales (sin filtrar)
  const [nominaData, setNominaData] = useState({ data: [], columns: [] });
  const [plantillasData, setPlantillasData] = useState({ data: [], columns: [] });
  
  // Datos filtrados
  const [filteredNominaData, setFilteredNominaData] = useState({ data: [], columns: [] });
  const [filteredPlantillasData, setFilteredPlantillasData] = useState({ data: [], columns: [] });
  
  const [activeTab, setActiveTab] = useState('Nomina');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filterActive, setFilterActive] = useState(false);
  const dataLoadedRef = useRef(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      // Evitar cargas múltiples
      if (dataLoadedRef.current) return;
      
      try {
        setIsLoading(true);
        console.log("Cargando datos desde Google Sheets...");
        
        const sheetConfig = sheetsConfig.sheets.find(sheet => sheet.name === "recursosHumanos");
        
        if (!sheetConfig) {
          throw new Error(`Configuración no encontrada`);
        }
        
        const { url, tabs } = sheetConfig;
        const result = await googleSheetsService.getAllTabsData(url, tabs, {
          autoTypeConversion: true,
          skipEmptyRows: true
        });

        console.log("Datos recibidos:", result);

        // Process Nomina data
        if (result.results?.Nomina?.data?.length) {
          const nomina = result.results.Nomina.data;
          const nominaWithIds = nomina.map(row => ({ ...row, uniqueId: uuidv4() }));
          
          setNominaData({
            data: nominaWithIds,
            columns: Object.keys(nomina[0] || {})
          });
          
          setFilteredNominaData({
            data: nominaWithIds,
            columns: Object.keys(nomina[0] || {})
          });
          
          console.log("Datos de nómina procesados:", nominaWithIds.length);
        }

        // Process Plantillas data
        if (result.results?.Plantilla?.data?.length) {
          const plantillas = result.results.Plantilla.data;
          const plantillasWithIds = plantillas.map(row => ({ ...row, uniqueId: uuidv4() }));
          
          setPlantillasData({
            data: plantillasWithIds,
            columns: Object.keys(plantillas[0] || {})
          });
          
          setFilteredPlantillasData({
            data: plantillasWithIds,
            columns: Object.keys(plantillas[0] || {})
          });
          
          console.log("Datos de plantillas procesados:", plantillasWithIds.length);
        }

        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para aplicar filtros
  const applyFilters = useCallback(() => {
    const [startDate, endDate] = dateRange;
    console.log("Aplicando filtros con fechas:", startDate, endDate);
    
    if (!startDate && !endDate) {
      // Si no hay fechas seleccionadas, mostrar todos los datos
      setFilteredNominaData(nominaData);
      setFilteredPlantillasData(plantillasData);
      setFilterActive(false);
      return;
    }
    
    // Buscar la columna de fecha en cada dataset
    const findDateColumn = (columns) => {
      return columns.find(col => 
        col.toLowerCase().includes('fecha') || 
        col.toLowerCase().includes('date') || 
        col.toLowerCase() === 'fech'
      );
    };
    
    // Filtrar datos de nómina
    if (nominaData.data.length > 0) {
      const dateColumn = findDateColumn(nominaData.columns);
      console.log("Columna de fecha en nómina:", dateColumn);
      
      let filteredData = [...nominaData.data];
      
      if (dateColumn) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item[dateColumn]);
          // Si la fecha no es válida, incluir la fila
          if (isNaN(itemDate.getTime())) return true;
          
          // Aplicar filtro de fecha
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          
          return true;
        });
      }
      
      setFilteredNominaData({
        ...nominaData,
        data: filteredData
      });
      
      console.log(`Nómina filtrada: ${filteredData.length} de ${nominaData.data.length}`);
    }
    
    // Filtrar datos de plantillas
    if (plantillasData.data.length > 0) {
      const dateColumn = findDateColumn(plantillasData.columns);
      console.log("Columna de fecha en plantillas:", dateColumn);
      
      let filteredData = [...plantillasData.data];
      
      if (dateColumn) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item[dateColumn]);
          // Si la fecha no es válida, incluir la fila
          if (isNaN(itemDate.getTime())) return true;
          
          // Aplicar filtro de fecha
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          
          return true;
        });
      }
      
      setFilteredPlantillasData({
        ...plantillasData,
        data: filteredData
      });
      
      console.log(`Plantillas filtradas: ${filteredData.length} de ${plantillasData.data.length}`);
    }
    
    setFilterActive(true);
  }, [dateRange, nominaData, plantillasData]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setDateRange([null, null]);
    setFilteredNominaData(nominaData);
    setFilteredPlantillasData(plantillasData);
    setFilterActive(false);
    console.log("Filtros limpiados");
  }, [nominaData, plantillasData]);

  // Get active data based on current tab
  const activeData = useMemo(() => 
    activeTab === 'Nomina' ? filteredNominaData.data : filteredPlantillasData.data, 
    [activeTab, filteredNominaData, filteredPlantillasData]
  );

  const PLANTILLAS_COLUMNS = ['nombre', 'cargo', 'fecha ingreso', 'sueldo neto', 'sueldo bruto'];

  // Get columns for active tab
  const tableColumns = useMemo(() => {
    const currentData = activeTab === 'Nomina' ? filteredNominaData : filteredPlantillasData;
    if (!currentData?.columns?.length) return [];
    
    const monetaryFields = ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio'];
    let columnsToShow = currentData.columns;

    if (activeTab === 'Plantillas') {
      columnsToShow = currentData.columns.filter(column => 
        PLANTILLAS_COLUMNS.includes(column.toLowerCase())
      );
    }
    
    return columnsToShow.map(column => [
      column.charAt(0).toUpperCase() + column.slice(1),
      column,
      {
        align: monetaryFields.some(term => 
          column.toLowerCase().includes(term)) ? 'right' : 'left'
      }
    ]);
  }, [activeTab, filteredNominaData, filteredPlantillasData]);

  // Add some CSS for tab styling
  const tabStyles = {
    active: "nav-link active text-primary",
    inactive: "nav-link text-secondary"
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">
              Resumen de consumos Certicamara
            </h4>
          </div>

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div className="mx-2">
              <label className="block text-sm font-medium mb-1">Periodo</label>
              <div className="d-flex align-items-center">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => {
                    setDateRange(update);
                    if (update[0] === null && update[1] === null) {
                      clearFilters();
                    }
                  }}
                  locale={es}
                  isClearable={true}
                  placeholderText="Filtrar por rango de fechas"
                  className="form-control rounded p-2"
                  disabled={isLoading}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                />
                <button
                  onClick={applyFilters}
                  disabled={isLoading || (dateRange[0] === null && dateRange[1] === null)}
                  className="btn btn-primary p-2 border-0 mx-1"
                >
                  <Search className="w-75" />
                </button>
            
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Estados */}
      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Tabs y Tablas */}
      {!isLoading && !error && (
        <div className="card">
          <div className="p-1">
            <div className="row g-1">
              <div className="col-sm-12">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === "Plantillas" ? tabStyles.active : tabStyles.inactive}
                      onClick={() => setActiveTab("Plantillas")}
                    >
                      Plantillas ({filteredPlantillasData?.data?.length || 0})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={activeTab === "Nomina" ? tabStyles.active : tabStyles.inactive}
                      onClick={() => setActiveTab("Nomina")}
                    >
                      Nómina ({filteredNominaData?.data?.length || 0})
                    </button>
                  </li>
                </ul>

                <div className="tab-content mt-3">
                  <div className="tab-pane fade show active">
                    <TransactionTable
                      data={activeData}
                      title=""
                      subTitle=""
                      description=""
                      columns={tableColumns}
                      height={450}
                      groupByOptions={[]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}