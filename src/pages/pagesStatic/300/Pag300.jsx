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
import BarChart from "../../../components/Dashboard/BarChart.jsx";

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

      // Para formato ISO (2025-03-29)
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // Ajustamos el mes (0-11)
      }

      // Para formato español (1-ene-2025)
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
    
    // Agrupar configuraciones por shortName
    const clientGroups = apiConfigData
      .filter(item => item.State === "PROD")
      .reduce((acc, item) => {
        if (!acc[item.shortName]) {
          acc[item.shortName] = {
            shortName: item.shortName,
            configs: []
          };
        }
        acc[item.shortName].configs.push(item);
        return acc;
      }, {});

    // Convertir a array y ordenar por shortName
    return Object.values(clientGroups)
      .sort((a, b) => a.shortName.toLowerCase().localeCompare(b.shortName.toLowerCase()))
      .map(group => ({
        value: group.shortName,    // Usamos shortName como value
        label: group.shortName,    // Mostramos shortName como label
        configs: group.configs     // Guardamos todas las configuraciones
      }));
  }, [apiConfigData]);

  // Modificar la función prepareChartData
  const prepareChartData = (signingFiltered = [], mplFiltered = [], promissoryFiltered = []) => {
    // Obtener todas las fechas únicas
    const allDates = new Set([
      ...signingFiltered.map(row => row.Date),
      ...mplFiltered.map(row => row.Date),
      ...promissoryFiltered.map(row => row.Date)
    ]);

    // Convertir a array y ordenar
    const categories = Array.from(allDates).sort();

    // Preparar los datos de las series sumando los Count por fecha
    const series = {
      'API Firma': categories.map(date => 
        signingFiltered
          .filter(row => row.Date === date)
          .reduce((sum, row) => sum + (Number(row.Count) || 0), 0)
      ),
      'API Carga Masiva': categories.map(date => 
        mplFiltered
          .filter(row => row.Date === date)
          .reduce((sum, row) => sum + (Number(row.Count) || 0), 0)
      ),
      'API Pagaré': categories.map(date => 
        promissoryFiltered
          .filter(row => row.Date === date)
          .reduce((sum, row) => sum + (Number(row.Count) || 0), 0)
      )
    };

    return { categories, series };
  };

  // Modificar el handleClientChange para incluir los datos del gráfico
  const handleClientChange = async (selected) => {
    setSelectedClient(selected);

    const newTotals = {
      firma: "?",
      preguntaReto: "?",
      opt: "?",
      otpVerificado: "?",
      biometriaFacial: "?",
      cargaMasiva: "?",
      pagare: "?"
    };

    let chartData = { categories: [], series: {} };

    if (selected) {
      try {
        const clientConfigs = apiConfigData.filter(
          item => item.shortName === selected.value && item.State === "PROD"
        );

        let startDate = dateRange[0];
        let endDate = dateRange[1];
        
        if (!startDate) {
          const today = new Date();
          startDate = new Date(today);
          startDate.setDate(today.getDate() - daysAgo);
          endDate = today;
        }

        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);

        let signingFiltered = [];
        let mplFiltered = [];
        let promissoryFiltered = [];

        for (const config of clientConfigs) {
          switch (config.API) {
            case 'SIGNINGCORE':
              signingFiltered = signingCoreData.filter(row => {
                const rowDate = parseSpanishDate(row.Date);
                if (!rowDate) return false;
                const normalizedRowDate = new Date(
                  rowDate.getFullYear(),
                  rowDate.getMonth(),
                  rowDate.getDate(),
                  0, 0, 0
                );
                return row.ClientId === config.client_id &&
                       normalizedRowDate >= startDate &&
                       normalizedRowDate <= endDate;
              });
              newTotals.firma = signingFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
              break;

            case 'MPL':
              mplFiltered = api2Data.filter(row => {
                const rowDate = parseSpanishDate(row.Date);
                if (!rowDate) return false;
                const normalizedRowDate = new Date(
                  rowDate.getFullYear(),
                  rowDate.getMonth(),
                  rowDate.getDate(),
                  0, 0, 0
                );
                return row.ClientId === config.client_id &&
                       normalizedRowDate >= startDate &&
                       normalizedRowDate <= endDate;
              });
              newTotals.cargaMasiva = mplFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
              break;

            case 'PROMISSORYNOTE':
              promissoryFiltered = api3Data.filter(row => {
                const rowDate = parseSpanishDate(row.Date);
                if (!rowDate) return false;
                const normalizedRowDate = new Date(
                  rowDate.getFullYear(),
                  rowDate.getMonth(),
                  rowDate.getDate(),
                  0, 0, 0
                );
                return row.ClientId === config.client_id &&
                       normalizedRowDate >= startDate &&
                       normalizedRowDate <= endDate;
              });
              newTotals.pagare = promissoryFiltered.reduce((sum, row) => sum + (Number(row.Count) || 0), 0);
              break;
          }
        }

        // Preparar datos para el gráfico
        chartData = prepareChartData(signingFiltered, mplFiltered, promissoryFiltered);

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
    setChartData(chartData);
  };

  // Agregar el estado para los datos del gráfico
  const [chartData, setChartData] = useState({ categories: [], series: {} });

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
                options={clientOptions}
                value={selectedClient}
                onChange={handleClientChange}
                placeholder="Seleccionar cliente..."
                isDisabled={isLoading}
                styles={customStyles}
                isClearable={true}
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
                description={`Cliente: ${selectedClient?.label || '?'}`}
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
                description={`Cliente: ${selectedClient?.label || '?'}`}
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
                description={`Cliente: ${selectedClient?.label || '?'}`}
                icon="bi bi-file-earmark-text"
                iconBgColor="#e1fdff"
                unknown={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Histograma */}
      <div className="mt-1">
        <BarChart
          data={chartData}
          title="Consumo de APIs por Fecha"
          subTitle={`Cliente: ${selectedClient?.label || '?'}`}
          description="Distribución por Fecha"
          height={400}
          series={[
            {
              name: 'API Firma',
              type: 'bar',
              itemStyle: { color: '#5470c6' }
            },
            {
              name: 'API Carga Masiva',
              type: 'bar',
              itemStyle: { color: '#91cc75' }
            },
            {
              name: 'API Pagaré',
              type: 'bar',
              itemStyle: { color: '#fac858' }
            }
          ]}
          xAxis={{
            axisLabel: {
              rotate: 45
            }
          }}
        />
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
