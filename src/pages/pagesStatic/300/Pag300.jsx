import { useState, useMemo, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import ExportButton from "../../../components/BtnExportar.jsx";
import { ImageOff, Search } from "lucide-react";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent.jsx";
import { formatDateRange } from "../../../utils/dateUtils.js";
import { googleSheetsService } from "../../../utils/googleSheetsService.js";
import sheetsConfig from "../../../resources/TOCs/sheetsConfig.json";
import Swal from 'sweetalert2';
import { 
  GetCountSigningCore, 
  GetCountMPL, 
  GetCountPromissoryNote,
  formatDateForAPI 
} from "../../../api/GetsAPI.js";

export default function Pag300() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [apiConfigData, setApiConfigData] = useState([]);
  const [selectedClient, setSelectedClient] = useState([]);
  const daysAgo = 14;

  // Estado para los totales de API
  const [apiTotals, setApiTotals] = useState({
    firma: "?",
    preguntaReto: "?",
    opt: "?",
    otpVerificado: "?",
    biometriaFacial: "?",
    cargaMasiva: "?",
    pagare: "?"
  });

  // Agregamos estados para guardar la data de cada pestaña
  const [signingCoreData, setSigningCoreData] = useState([]);
  const [api2Data, setApi2Data] = useState([]);
  const [api3Data, setApi3Data] = useState([]);

  // Agregar esta función al inicio del componente
  const parseSpanishDate = (dateStr) => {
    try {
      if (!dateStr) return null;
      
    const months = {
      'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
    };
    
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      
      const [day, month, year] = parts;
      const monthLower = month?.toLowerCase();
      
      if (!monthLower || !months.hasOwnProperty(monthLower)) return null;
      
      return new Date(parseInt(year), months[monthLower], parseInt(day));
    } catch (error) {
      console.error('Error parseando fecha:', dateStr, error);
      return null;
    }
  };

  // Función para cargar datos de las pestañas
  const loadApiMetricsData = async () => {
    try {
      setIsLoading(true);
      const apiMetricsConfig = sheetsConfig.sheets.find(
        (sheet) => sheet.name === "apiMetricsData"
      );

      if (apiMetricsConfig) {
        console.log('Configuración encontrada:', apiMetricsConfig);
        
        const result = await googleSheetsService.getAllTabsData(
          apiMetricsConfig.url,
          apiMetricsConfig.tabs,
          {
            autoTypeConversion: true,
            skipEmptyRows: true,
          }
        );

        // Guardamos la data de cada pestaña
        if (result?.results) {
          // Data de SIGNINGCORE
          const signingCore = result.results["SIGNINGCORE"]?.data || [];
          setSigningCoreData(signingCore);
          console.log('Data de SIGNINGCORE:', {
            totalRegistros: signingCore.length,
            columnas: signingCore[0] ? Object.keys(signingCore[0]) : [],
            muestra: signingCore.slice(0, 5)
          });

          // Data de API2
          const api2 = result.results["API2"]?.data || [];
          setApi2Data(api2);
          console.log('Data de API2:', {
            totalRegistros: api2.length,
            columnas: api2[0] ? Object.keys(api2[0]) : [],
            muestra: api2.slice(0, 5)
          });

          // Data de API3
          const api3 = result.results["API3"]?.data || [];
          setApi3Data(api3);
          console.log('Data de API3:', {
            totalRegistros: api3.length,
            columnas: api3[0] ? Object.keys(api3[0]) : [],
            muestra: api3.slice(0, 5)
          });
        }
      }
    } catch (error) {
      console.error("Error cargando datos de métricas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar configuración de API
        const apiConfig = sheetsConfig.sheets.find(
          (sheet) => sheet.name === "authorizationAPIConfigurations"
        );

        if (apiConfig) {
          const apiResult = await googleSheetsService.getAllTabsData(
            apiConfig.url,
            apiConfig.tabs,
            {
              autoTypeConversion: true,
              skipEmptyRows: true,
            }
          );

          if (apiResult?.results?.["Hoja 1"]?.data) {
            setApiConfigData(apiResult.results["Hoja 1"].data);
          }
        }

        // Cargar datos de métricas
        await loadApiMetricsData();

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Opciones de clientes
  const clientOptions = useMemo(() => {
    if (!apiConfigData || !apiConfigData.length) return [];
    
    // Filtrar items en PROD y crear array de objetos únicos
    const uniqueClients = Array.from(new Set(
      apiConfigData
        .filter(item => item.State === "PROD")
        .map(item => JSON.stringify({
          client_id: item.client_id,
          shortName: item.shortName
        }))
    ))
    .map(str => JSON.parse(str))
    .sort((a, b) => a.shortName.toLowerCase().localeCompare(b.shortName.toLowerCase()));
    
    return uniqueClients.map(client => ({
      value: client.client_id,    // Usamos client_id como value
      label: client.shortName     // Mantenemos shortName como label
    }));
  }, [apiConfigData]);

  // Manejar cambio de cliente
  const handleClientChange = async (selected) => {
    setSelectedClient(selected || []);
    console.log('Cliente(s) seleccionado(s):', selected);

    const newTotals = {
      firma: "?",
      preguntaReto: "?",
      opt: "?",
      otpVerificado: "?",
      biometriaFacial: "?",
      cargaMasiva: "?",
      pagare: "?"
    };

    if (selected && selected.length > 0) {
      try {
        for (const client of selected) {
          // Obtener las configuraciones del cliente seleccionado
          const clientConfigs = apiConfigData.filter(
            item => item.shortName === client.value && item.State === "PROD"
          );

          console.log('Configuraciones del cliente:', clientConfigs);

          // Obtener rango de fechas
          let startDate = dateRange[0];
          let endDate = dateRange[1];
          
          if (!startDate) {
            const today = new Date();
            startDate = new Date(today);
            startDate.setDate(today.getDate() - daysAgo);
            endDate = today;
          }

          // Procesar cada API según las configuraciones del cliente
          for (const config of clientConfigs) {
            switch (config.API) {
              case 'SIGNINGCORE':
                // Filtrar y sumar registros de SIGNINGCORE
                const signingFiltered = signingCoreData.filter(row => {
                  const rowDate = parseSpanishDate(row.Date);
                  return rowDate && 
                         row.ClientId === config.client_id &&
                         rowDate >= startDate &&
                         rowDate <= endDate;
                });
                
                const signingTotal = signingFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
                console.log('SIGNINGCORE filtrado:', {
                  clientId: config.client_id,
                  registrosEncontrados: signingFiltered.length,
                  total: signingTotal,
                  registros: signingFiltered
                });
                newTotals.firma = signingTotal;
                break;

              case 'MPL':
                // Filtrar y sumar registros de MPL
                const mplFiltered = api2Data.filter(row => {
                  const rowDate = parseSpanishDate(row.Date);
                  return rowDate && 
                         row.ClientId === config.client_id &&
                         rowDate >= startDate &&
                         rowDate <= endDate;
                });
                
                const mplTotal = mplFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
                console.log('MPL filtrado:', {
                  clientId: config.client_id,
                  registrosEncontrados: mplFiltered.length,
                  total: mplTotal,
                  registros: mplFiltered
                });
                newTotals.cargaMasiva = mplTotal;
                break;

              case 'PROMISSORYNOTE':
                // Agregar logs para debug
                console.log('Buscando en API3 (Pagaré):', {
                  clientId: config.client_id,
                  fechaInicio: startDate,
                  fechaFin: endDate,
                  totalRegistros: api3Data.length,
                  primerosRegistros: api3Data.slice(0, 5)
                });

                const promissoryFiltered = api3Data.filter(row => {
                  const rowDate = parseSpanishDate(row.Date);
                  const matches = rowDate && 
                         row.ClientId === config.client_id &&
                         rowDate >= startDate &&
                         rowDate <= endDate;
                  
                  // Log para cada registro que debería coincidir
                  if (row.ClientId === config.client_id) {
                    console.log('Registro encontrado para el ClientId:', {
                      fecha: row.Date,
                      fechaParseada: rowDate,
                      clientId: row.ClientId,
                      count: row.Count,
                      cumpleFiltroFecha: rowDate && rowDate >= startDate && rowDate <= endDate
                    });
                  }
                  
                  return matches;
                });
                
                const promissoryTotal = promissoryFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
                console.log('PROMISSORYNOTE resultado:', {
                  clientId: config.client_id,
                  registrosEncontrados: promissoryFiltered.length,
                  registrosFiltrados: promissoryFiltered,
                  total: promissoryTotal
                });
                newTotals.pagare = promissoryTotal;
                break;
            }
          }
        }
      } catch (error) {
        console.error('Error general:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Error al procesar los datos',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6'
        });
      }
    }

    setApiTotals(newTotals);
  };

  let formatDate = formatDateRange(dateRange, daysAgo);

  return (
    <div className="">
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-7 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Consumo de APIs</h4>
          </div>

          <div className="col-sm-5 d-flex align-items-center justify-content-end gap-2">
            <div className="flex-grow-1" style={{ minWidth: '200px', zIndex: 10000 }}>
              <label className="block text-sm font-medium mb-2">Clientes API</label>
              <Select
                isMulti
                options={clientOptions}
                value={selectedClient}
                onChange={handleClientChange}
                placeholder="Seleccionar clientes..."
                closeMenuOnSelect={false}
                isDisabled={isLoading}
                styles={customStyles}
              />
            </div>
            <div className="flex-grow-1" style={{ minWidth: '200px' }}>
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
                  className="form-control rounded p-2 w-100"
                  disabled={isLoading}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <button
                  onClick={() => handleClientChange(selectedClient)}
                  disabled={isLoading}
                  className="btn btn-primary p-2 border-0 ms-2"
                >
                  <Search className="w-75" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Cards */}
      <div className="card">
        <div className="p-1">
          <div className="row g-1">
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.firma}
                trend={{ text: "Consumo(s)" }}
                title="API Firma"
                subTitle={formatDate}
                description={`Cliente ID: ${selectedClient[0]?.value || '?'}`}
                icon="bi bi-pen"
                iconBgColor="#e1fdff"
                unknown={false}
              />
            </div>
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.preguntaReto}
                trend={{ text: "Consumo(s)" }}
                title="API Pregunta Reto"
                subTitle={formatDate}
                description="Sin implementar"
                icon="bi bi-question-circle"
                iconBgColor="red"
                unknown={false}
              />
            </div>
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.opt}
                trend={{ text: "Consumo(s)" }}
                title="API OPT"
                subTitle={formatDate}
                description="Sin implementar"
                icon="bi bi-shield-lock"
                iconBgColor="red"
                unknown={false}
              />
            </div>
          </div>
          <div className="row g-1">
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.otpVerificado}
                trend={{ text: "Consumo(s)" }}
                title="API OTP Verificado"
                subTitle={formatDate}
                description="Sin implementar"
                icon="bi bi-check-circle"
                iconBgColor="red"
                unknown={false}
              />
            </div>
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.biometriaFacial}
                trend={{ text: "Consumo(s)" }}
                title="API Biometria Facial"
                subTitle={formatDate}
                description="Sin implementar"
                icon="bi bi-person-badge"
                iconBgColor="red"
                unknown={false}
              />
            </div>
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.cargaMasiva}
                trend={{ text: "Consumo(s)" }}
                title="API Carga Masiva"
                subTitle={formatDate}
                description={`Cliente ID: ${selectedClient[0]?.value || '?'}`}
                icon="bi bi-cloud-upload"
                iconBgColor="#e1fdff"
                unknown={false}
              />
            </div>
          </div>
          <div className="row g-1">
            <div className="col-sm-4">
              <TotalsCardComponent
                data={apiTotals.pagare}
                trend={{ text: "Consumo(s)" }}
                title="API Pagaré"
                subTitle={formatDate}
                description={`Cliente ID: ${selectedClient[0]?.value || '?'}`}
                icon="bi bi-file-earmark-text"
                iconBgColor="#e1fdff"
                unknown={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const customStyles = {
  container: (base) => ({
    ...base,
    width: '100%',
    minWidth: '200px',
  }),
  multiValue: (base) => ({
    ...base,
    maxWidth: "200px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: "40px",
    overflowX: "auto",
    overflowY: "hidden",
    flexWrap: "nowrap",
    display: "flex",
    alignItems: "center",
    padding: "2px 8px",
  }),
  control: (base) => ({
    ...base,
    minHeight: "38px",
    height: "38px",
  }),
};
