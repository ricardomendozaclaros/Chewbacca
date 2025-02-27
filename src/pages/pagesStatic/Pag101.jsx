import { useState, useMemo, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid'; // Add this import
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import { GetSignatureProcessesCertifirma } from "../../api/signatureProcessCertifirma.js";
import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../components/Dashboard/TotalsCardComponent.jsx";
import { ImageOff, Search } from "lucide-react";
import ExportButton from "../../components/BtnExportar.jsx";
import { googleSheetsService } from '../../utils/googleSheetsService';
import sheetsConfig from '../../resources/TOCs/sheetsConfig.json';

export default function Pag101() {
  // Separate states for each data type
  const [nominaData, setNominaData] = useState({ data: [], columns: [] });
  const [plantillasData, setPlantillasData] = useState({ data: [], columns: [] });
  const [activeTab, setActiveTab] = useState('Nomina');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const sheetConfig = sheetsConfig.sheets.find(sheet => sheet.name === "recursosHumanos");
        
        if (!sheetConfig) {
          throw new Error(`Configuración no encontrada`);
        }
        
        const { url, tabs } = sheetConfig;
        const result = await googleSheetsService.getAllTabsData(url, tabs, {
          autoTypeConversion: true,
          skipEmptyRows: true
        });

        // Process Nomina data
        if (result.results?.Nomina?.data?.length) {
          const nomina = result.results.Nomina.data;
          setNominaData({
            data: nomina.map(row => ({ ...row, uniqueId: uuidv4() })),
            columns: Object.keys(nomina[0] || {})
          });
        }

        // Process Plantillas data
        if (result.results?.Plantilla?.data?.length) {
          const plantillas = result.results.Plantilla.data;
          setPlantillasData({
            data: plantillas.map(row => ({ ...row, uniqueId: uuidv4() })),
            columns: Object.keys(plantillas[0] || {})
          });
        }

      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Get active data based on current tab
  const activeData = useMemo(() => 
    activeTab === 'Nomina' ? nominaData.data : plantillasData.data, 
    [activeTab, nominaData, plantillasData]
  );

  // Get columns for active tab
  const tableColumns = useMemo(() => {
    const currentData = activeTab === 'Nomina' ? nominaData : plantillasData;
    if (!currentData?.columns?.length) return [];
    
    const monetaryFields = ['sueldo', 'bruto', 'neto', 'descuentos', 'bonos', 'total', 'precio'];
    
    return currentData.columns.map(column => [
      column.charAt(0).toUpperCase() + column.slice(1),
      column,
      {
        align: monetaryFields.some(term => 
          column.toLowerCase().includes(term)) ? 'right' : 'left'
      }
    ]);
  }, [activeTab, nominaData, plantillasData]);

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

          {/* Filtro de tipos de firmas */}

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div className="mx-2">
              <label className="block text-sm font-medium mb-1">Periodo</label>
              <div className="d-flex align-items-center">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={setDateRange}
                  locale={es}
                  isClearable={true}
                  placeholderText="Filtrar por rango de fechas"
                  className="form-control rounded p-2"
                  disabled={isLoading}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <button
                  onClick={() => console.log("dateRange")}
                  disabled={isLoading}
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
                      Plantillas ({plantillasData?.data?.length || 0})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                  <button
                      className={activeTab === "Nomina" ? tabStyles.active : tabStyles.inactive}
                      onClick={() => setActiveTab("Nomina")}
                    >
                      Nómina ({nominaData?.data?.length || 0})
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
