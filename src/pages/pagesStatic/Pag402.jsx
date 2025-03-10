import { useState, useCallback, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import GoogleSheetsReader from "../../components/GoogleSheetsReader";

export default function Pag402() {
  const [isLoading, setIsLoading] = useState(true); // Iniciamos en true para mostrar carga inicial
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filterActive, setFilterActive] = useState(false);
  const dataLoadedRef = useRef(false);
  const componentMounted = useRef(true);

  // Asegurarnos de limpiar el estado al desmontar
  useEffect(() => {
    // Establecer como montado
    componentMounted.current = true;
    
    // Limpiar al desmontar
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Manejador para cuando se cargan los datos de Google Sheets
  const handleDataLoaded = useCallback((data) => {
    console.log("handleDataLoaded llamado con datos:", Object.keys(data));
    
    // Solo actualizar el estado si el componente sigue montado
    if (componentMounted.current && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      setIsLoading(false);
    }
  }, []);

  // Función para aplicar el filtro de fechas
  const applyDateFilter = useCallback(() => {
    console.log("Aplicando filtro de fechas:", dateRange);
    setFilterActive(true);
  }, [dateRange]);

  // Función para limpiar filtros
  const clearFilter = useCallback(() => {
    console.log("Limpiando filtros");
    setDateRange([null, null]);
    setFilterActive(false);
  }, []);
  
  console.log("Renderizando Pag100. Estado:", { isLoading, dateRange, filterActive });

  return (
    <div className="pag100-container">
      {/* Filtros */}
      <div className="card p-2 mb-4">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">General</h4>
          </div>
          <div className="col-sm-6">
            <label className="block text-sm font-medium mb-1">Periodo</label>
            <div className="d-flex align-items-center">
              <DatePicker
                selectsRange={true}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => {
                  console.log("DatePicker onChange:", update);
                  setDateRange(update);
                  if (update[0] === null && update[1] === null) {
                    setFilterActive(false);
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
                onClick={applyDateFilter}
                disabled={isLoading || (dateRange[0] === null && dateRange[1] === null)}
                className="btn bg-secondary text-white p-2 border-0 mx-1"
              >
                <Search className="w-75" />
              </button>
              {filterActive && (
                <button
                  onClick={clearFilter}
                  className="btn btn-outline-danger p-2 border-0 mx-1"
                >
                  ×
                </button>
              )}
            </div>
            {filterActive && dateRange[0] && (
              <div className="mt-2 text-sm text-muted">
                Filtrando desde {dateRange[0]?.toLocaleDateString()} 
                {dateRange[1] ? ` hasta ${dateRange[1]?.toLocaleDateString()}` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estados de carga y error */}
      {isLoading && !error && (
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

      {/* GoogleSheetsReader */}
      <div className="card p-4">
        <GoogleSheetsReader
          key="sheets-reader"
          configName="nuevaHoja"
          onDataLoaded={handleDataLoaded}
          height={500}
          showTotal={true}
          dateRange={dateRange}
          filterByDate={filterActive}
        />
      </div>
    </div>
  );


}