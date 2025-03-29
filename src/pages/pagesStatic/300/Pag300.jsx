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

  // Cargar datos de configuración de API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
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
        console.log("there", apiConfigData)
      } catch (error) {
        console.error("Error loading API config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Opciones de clientes
  const clientOptions = useMemo(() => {
    if (!apiConfigData || !apiConfigData.length) return [];
    
    const uniqueClients = Array.from(new Set(
      apiConfigData
        .filter(item => item.State === "PROD")
        .map(item => item.shortName)
    ))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    return uniqueClients.map(shortName => ({
      value: shortName,
      label: shortName
    }));
  }, [apiConfigData]);

  // Manejar cambio de cliente
  const handleClientChange = async (selected) => {
    setSelectedClient(selected || []);
    
    let startDate = dateRange[0];
    let endDate = dateRange[1];
    
    if (!startDate) {
      const today = new Date();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysAgo);
      endDate = today;
    }

    const startEpoch = formatDateForAPI(startDate, true);
    const endEpoch = formatDateForAPI(endDate, false);

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
          const clientConfigs = apiConfigData.filter(
            item => item.shortName === client.value && item.State === "PROD"
          );

          for (const config of clientConfigs) {
            const clientId = config.client_id;

            switch (config.API) {
              case 'MPL':
                const mplCount = await GetCountMPL(clientId, startEpoch, endEpoch);
                newTotals.cargaMasiva = mplCount;
                break;
              
              case 'SIGNINGCORE':
                const signingCount = await GetCountSigningCore(clientId, startEpoch, endEpoch);
                newTotals.firma = signingCount;
                break;
              
              case 'PROMISSORYNOTE':
                const promissoryCount = await GetCountPromissoryNote(clientId, startEpoch, endEpoch);
                newTotals.pagare = promissoryCount;
                break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching API counts:', error);
        await Swal.fire({
          title: 'Error',
          text: 'Error al obtener los conteos de API',
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
                description={`Cliente ID: ${selectedClient.find(c => c.label.toUpperCase().includes('SIGNINGCORE-PROD'))?.value || '?'}`}
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
                description={`Cliente ID: ${selectedClient.find(c => c.label.toUpperCase().includes('MPL-PROD'))?.value || '?'}`}
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
                description={`Cliente ID: ${selectedClient.find(c => c.label.toUpperCase().includes('PROMISSORYNOTE-PROD'))?.value || '?'}`}
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
