import { useState, useMemo, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import { GetSignatureProcesses } from "../../../api/signatureProcess.js";
import { GetEnterprises } from "../../../api/enterprise.js";
import TransactionTable from "../../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent.jsx";
import { useParseValue } from "../../../hooks/useParseValue.js";
import { Search } from "lucide-react";
import ExportButton from "../../../components/BtnExportar.jsx";
import { formatDateRange } from "../../../utils/dateUtils.js";
import ProcessModal from "../../../components/ProcessModal";
import { googleSheetsService } from "../../../utils/googleSheetsService.js";
import sheetsConfig from "../../../resources/TOCs/sheetsConfig.json";
import Swal from "sweetalert2";

export default function Pag200() {
  const { parseValue } = useParseValue();
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resumen");

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  // Agregar nuevo estado para empresas filtradas
  const [availableEnterprises, setAvailableEnterprises] = useState([]);

  const daysAgo = 20; // Número de días para el rango de fechas

  // Añadir estos estados después de los otros estados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  // Agregar estos nuevos estados
  const [rechargesData, setRechargesData] = useState([]);
  const [filteredRechargesData, setFilteredRechargesData] = useState([]);

  // Modificar el useEffect inicial para incluir la carga de datos de Google Sheets
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);

        // Cargar datos de firmas
        const result = await GetSignatureProcesses({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });

        // Obtener empresas únicas del resultado inicial
        const uniqueEnterprises = Array.from(
          new Set(result.map(item => item.enterpriseId))
        );
        
        // Establecer empresas disponibles inicialmente
        setAvailableEnterprises(
          enterprises.filter(enterprise => 
            uniqueEnterprises.includes(enterprise.value)
          )
        );

        // Modificar para usar la configuración de wompi
        const wompiConfig = sheetsConfig.sheets.find(
          (sheet) => sheet.name === "wompi"
        );

        // Obtener datos de ambas hojas
        const [wompiResult] = await Promise.all([
          wompiConfig
            ? googleSheetsService.getAllTabsData(
                wompiConfig.url,
                wompiConfig.tabs,
                {
                  autoTypeConversion: true,
                  skipEmptyRows: true,
                }
              )
            : null,
        ]);

        // Procesar datos de wompi
        if (wompiResult?.results?.PasarelaPagosWompi?.data) {
          const initialWompiData =
            wompiResult.results.PasarelaPagosWompi.data.map((item) => ({
              ...item,
              id: crypto.randomUUID(),
            }));
          setRechargesData(initialWompiData);

          const filteredWompi = initialWompiData.filter((item) => {
            const rechargeDate = parseSpanishDate(item["FECHA DE LA RECARGA"]);
            if (!rechargeDate) return false;
            return rechargeDate >= startDate && rechargeDate <= today;
          });
          setFilteredRechargesData(filteredWompi);
        }

        transformAndSetData(result);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (enterprises.length > 0) {
      loadData();
    }
  }, [enterprises, daysAgo]);

  // Asegurar que el loadEnterprises ordene alfabéticamente
  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        const result = await GetEnterprises();
        // Usar Map para eliminar duplicados basados en enterpriseId
        const uniqueEnterprises = Array.from(
          new Map(
            result
              .filter((emp) => emp.plan === "pospago")
              .map((emp) => [emp.enterpriseId, emp])
          ).values()
        );

        // Formatear y ordenar alfabéticamente por enterpriseName
        const pospagos = uniqueEnterprises
          .map((emp) => ({
            value: emp.enterpriseId,
            label: `${emp.enterpriseId} - ${emp.enterpriseName}`,
            sortName: emp.enterpriseName, // Añadimos esta propiedad para ordenar
          }))
          .sort((a, b) =>
            a.sortName.toLowerCase().localeCompare(b.sortName.toLowerCase())
          );

        setEnterprises(pospagos);
      } catch (error) {
        console.error("Error loading enterprises:", error);
      }
    };

    loadEnterprises();
  }, []);

  // Modificar transformAndSetData
  const transformAndSetData = useCallback(
    (data) => {
      if (!data) return;

      // Guardar los datos sin filtrar primero
      setFilteredData(data);

      // Luego aplicar el filtro de empresas si hay alguna seleccionada
      if (selectedEnterprises.length > 0) {
        const filtered = data.filter((item) =>
          selectedEnterprises.some(
            (enterprise) => enterprise.value === item.enterpriseId
          )
        );
        setFilteredData(filtered);
      }
    },
    [selectedEnterprises]
  );

  // Modificar handleEnterpriseChange para que solo guarde la selección
  const handleEnterpriseChange = useCallback((selected) => {
    setSelectedEnterprises(selected || []);
  }, []);

  // Modificar filterData para actualizar las empresas disponibles
  const filterData = useCallback(async () => {
    try {
      setIsLoading(true);
      let [startDate, endDate] = dateRange;

      if (!startDate) {
        const today = new Date();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);
        endDate = today;
      } else {
        endDate = endDate || startDate;
      }

      // Obtener datos por fecha
      const result = await GetSignatureProcesses({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      // Obtener empresas únicas del resultado filtrado
      const uniqueEnterprises = Array.from(
        new Set(result.map(item => item.enterpriseId))
      );
      
      // Filtrar la lista completa de empresas para mostrar solo las que tienen datos
      const filteredEnterprises = enterprises.filter(enterprise => 
        uniqueEnterprises.includes(enterprise.value)
      );
      
      setAvailableEnterprises(filteredEnterprises);

      // Actualizar selectedEnterprises para mantener solo las empresas que siguen disponibles
      setSelectedEnterprises(prev => 
        prev.filter(selected => 
          filteredEnterprises.some(enterprise => enterprise.value === selected.value)
        )
      );

      // Filtrar recargas
      const filteredRecharges = rechargesData.filter((item) => {
        const rechargeDate = parseSpanishDate(item["FECHA DE LA RECARGA"]);
        if (!rechargeDate) return false;
        return rechargeDate >= startDate && rechargeDate <= endDate;
      });

      let filteredByEnterprise = result;

      // Aplicar filtros de empresa si existen
      if (selectedEnterprises.length > 0) {
        filteredByEnterprise = result.filter((item) =>
          selectedEnterprises.some(
            (enterprise) => enterprise.value === item.enterpriseId
          )
        );
      }

      // Verificar si hay datos después de aplicar los filtros
      if (filteredByEnterprise.length === 0) {
        let title = "No hay datos disponibles";
        let message = "";

        if (selectedEnterprises.length > 0 && dateRange[0]) {
          message =
            "No se encontraron registros para la empresa y el rango de fechas seleccionados.";
        } else if (selectedEnterprises.length > 0) {
          message = "No se encontraron registros para la empresa seleccionada.";
        } else if (dateRange[0]) {
          message =
            "No se encontraron registros para el rango de fechas seleccionado.";
        }

        await Swal.fire({
          title,
          text: message,
          icon: "info",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        });

        // Resetear filtros y recargar datos iniciales
        setSelectedEnterprises([]);
        setDateRange([null, null]);

        // Recargar datos iniciales
        const today = new Date();
        const initialStartDate = new Date(today);
        initialStartDate.setDate(today.getDate() - daysAgo);

        const initialResult = await GetSignatureProcesses({
          startDate: initialStartDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });

        // Actualizar empresas disponibles con los datos iniciales
        const initialUniqueEnterprises = Array.from(
          new Set(initialResult.map(item => item.enterpriseId))
        );
        
        setAvailableEnterprises(
          enterprises.filter(enterprise => 
            initialUniqueEnterprises.includes(enterprise.value)
          )
        );

        setFilteredData(initialResult);
        setFilteredRechargesData(
          rechargesData.filter((item) => {
            const rechargeDate = parseSpanishDate(item["FECHA DE LA RECARGA"]);
            if (!rechargeDate) return false;
            return rechargeDate >= initialStartDate && rechargeDate <= today;
          })
        );
      } else {
        // Si hay datos, actualizar el estado
        setFilteredData(filteredByEnterprise);
        setFilteredRechargesData(filteredRecharges);
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#3085d6",
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, rechargesData, selectedEnterprises, daysAgo, enterprises]);

  // Añadir esta función después de los otros handlers
  const handleRowClick = (row) => {
    setSelectedProcess(row);
    setIsModalOpen(true);
  };

  // Optimizar summarizedData
  const summarizedData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const grouped = new Map();
    
    for (const item of filteredData) {
      const key = item.description;
      if (!grouped.has(key)) {
        grouped.set(key, {
          signatureType: key,
          total: 0
        });
      }
      grouped.get(key).total += item.quantity || 0;
    }
    
    return Array.from(grouped.values()).sort((a, b) => 
      a.signatureType.localeCompare(b.signatureType)
    );
  }, [filteredData]);

  // Optimizar detailedSummarizedData
  const detailedSummarizedData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const grouped = new Map();
    
    for (const item of filteredData) {
      const key = `${item.description}-${item.unitValue}${selectedEnterprises.length > 1 ? `-${item.enterpriseId}` : ''}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          enterpriseName: item.enterpriseName,
          signatureType: item.description,
          unitValue: item.unitValue || 0,
          total: 0
        });
      }
      grouped.get(key).total += item.quantity || 0;
    }
    
    return Array.from(grouped.values()).sort((a, b) => {
      if (selectedEnterprises.length > 1) {
        // Primero ordenar por enterpriseName
        const nameCompare = a.enterpriseName.localeCompare(b.enterpriseName);
        if (nameCompare !== 0) return nameCompare;
      }
      // Luego por signatureType
      if (a.signatureType !== b.signatureType) {
        return a.signatureType.localeCompare(b.signatureType);
      }
      // Finalmente por unitValue
      return b.unitValue - a.unitValue;
    });
  }, [filteredData, selectedEnterprises.length]);

  // Optimizar groupedData
  const groupedData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const uniqueTypes = new Set(filteredData.map(i => i.description));
    const grouped = new Map();
    
    for (const item of filteredData) {
      const key = `${item.enterpriseId}-${item.enterpriseName}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          nit: item.enterpriseId,
          enterpriseName: item.enterpriseName,
          ...Object.fromEntries([...uniqueTypes].map(type => [type, 0]))
        });
      }
      grouped.get(key)[item.description] += item.quantity || 0;
    }
    
    return Array.from(grouped.values());
  }, [filteredData]);

  const exportData = useMemo(
    () => [
      {
        name: "Resumen Simple",
        data: summarizedData.map((item) => ({
          Firma: item.signatureType,
          Cantidad: item.total,
        })),
      },
      {
        name: "Resumen Detallado",
        data: detailedSummarizedData.map((item) => ({
          Firma: item.signatureType,
          "Valor unitario": item.unitValue,
          Cantidad: item.total,
        })),
      },
      {
        name: "Por cuentas",
        data: groupedData.map((item) => ({
          NIT: item.nit,
          Nombre: item.enterpriseName,
          ...Object.fromEntries(
            Object.entries(item).filter(
              ([key]) => !["nit", "enterpriseName"].includes(key)
            )
          ),
        })),
      },
      {
        name: "Todos los datos",
        data: filteredData.map(
          ({ plan, role, documentType, source, ...rest }) => rest
        ),
      },
    ],
    [filteredData]
  );

  //set format date for subtitle charts
  let formatDate = formatDateRange(dateRange, daysAgo);

  // Memoize table components
  const ResumenTable = useMemo(() => {
    if (!groupedData.length) return null;
    
    const tableColumns = [
      ["NIT", "nit"],
      ["Nombre", "enterpriseName"],
      ...Object.keys(groupedData[0] || {})
        .filter(key => !["nit", "enterpriseName"].includes(key))
        .map(key => [parseValue("description", key), key])
    ];

    return (
      <TransactionTable
        data={groupedData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={true}
        rowsPerPage={15}
        columns={tableColumns}
        groupByOptions={[]}
      />
    );
  }, [groupedData]);

  // Optimizar DetalleTable
  const DetalleTable = useMemo(() => {
    if (!filteredData.length) return null;

    return (
      <TransactionTable
        data={filteredData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={true}
        rowsPerPage={15}
        onRowClick={handleRowClick}
        columns={[
          ["ID", "id", { width: "10%" }],
          ["Fecha", "date"],
          ["Firma", "description"],
          ["Cantidad", "quantity"],
          ["Valor unitario", "unitValue"],
          ["Total", "totalValue"],
          ["NIT", "enterpriseId"],
          ["Nombre", "enterpriseName"],
          ["Email", "email"]
        ]}
        groupByOptions={[]}
      />
    );
  }, [filteredData, handleRowClick]);

  // Simplify totalRecords to just show filteredData length
  const totalRecords = useMemo(() => {
    return filteredData.length;
  }, [filteredData]);

  const totalSumQuantity = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [filteredData]);

  // Agregar cálculo del total de recargas
  const totalRechargeValue = useMemo(() => {
    return filteredRechargesData.reduce((sum, item) => {
      const value = item["VALOR DE LA RECARGA"];
      if (!value) return sum;
      if (typeof value === "number") return sum + value;
      if (typeof value === "string") {
        const cleanStr = value
          .replace(/[$\s]/g, "")
          .replace(/\./g, "")
          .replace(/,/g, ".");
        const numericValue = parseFloat(cleanStr);
        return sum + (isNaN(numericValue) ? 0 : numericValue);
      }
      return sum;
    }, 0);
  }, [filteredRechargesData]);

  // Primero, agregar una función de comparación para verificar si las tablas son iguales
  const areTablesEqual = useMemo(() => {
    if (!summarizedData.length || !detailedSummarizedData.length) return false;

    // Si tienen diferente número de filas, definitivamente son diferentes
    if (summarizedData.length !== detailedSummarizedData.length) return false;

    // Crear un mapa de los datos resumidos para comparación fácil
    const summaryMap = new Map(
      summarizedData.map(item => [item.signatureType, item.total])
    );

    // Verificar si cada tipo de firma en detailedSummarizedData tiene el mismo total
    return detailedSummarizedData.every(detail => {
      const summaryTotal = summaryMap.get(detail.signatureType);
      return summaryTotal === detail.total;
    });
  }, [summarizedData, detailedSummarizedData]);

  // Modificar los estilos personalizados para el combobox
  const customStyles = {
    container: (base) => ({
      ...base,
      width: "100%", // Asegura que el contenedor ocupe todo el espacio disponible
      minWidth: "200px", // Ancho mínimo para evitar que se haga demasiado pequeño
    }),
    multiValue: (base) => ({
      ...base,
      maxWidth: "200px", // Ancho máximo de cada elemento seleccionado
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

  // Modificar el RechargesTable para mostrar los datos de Wompi
  const RechargesTable = useMemo(
    () => (
      <TransactionTable
        data={filteredRechargesData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={true}
        rowsPerPage={15}
        columns={[
          ["Consecutivo", "CONSECUTIVO", { width: "15%" }],
          ["Pasarela de pagos", "Pasarela de pagos Wompi", { width: "30%" }],
          ["NIT", "NIT", { width: "15%" }],
          [
            "Valor de la recarga",
            "VALOR DE LA RECARGA",
            {
              align: "right",
              width: "20%",
              format: "currency",
            },
          ],
          ["Fecha de la recarga", "FECHA DE LA RECARGA", { width: "20%" }],
        ]}
        groupByOptions={[]}
      />
    ),
    [filteredRechargesData]
  );

  // Agregar esta función helper
  const parseSpanishDate = (dateStr) => {
    const months = {
      ene: "01",
      feb: "02",
      mar: "03",
      abr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      ago: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dic: "12",
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12",
    };

    try {
      const parts = dateStr.toLowerCase().split(/[-\s]+/);
      const day = parts[0].padStart(2, "0");
      const month = months[parts[1]] || "01";
      const year =
        parts[2]?.length === 2
          ? `20${parts[2]}`
          : new Date().getFullYear().toString();
      return new Date(`${year}-${month}-${day}`);
    } catch (error) {
      console.error("Error parsing date:", dateStr);
      return null;
    }
  };

  const totals = useMemo(() => {
    if (!filteredData.length) return {
      records: 0,
      quantity: 0,
      rechargeValue: 0,
      rechargeCount: 0
    };

    return {
      records: filteredData.length,
      quantity: filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0),
      rechargeValue: filteredRechargesData.reduce((sum, item) => {
        const value = item["VALOR DE LA RECARGA"];
        if (!value) return sum;
        if (typeof value === "number") return sum + value;
        if (typeof value === "string") {
          const cleanStr = value
            .replace(/[$\s]/g, "")
            .replace(/\./g, "")
            .replace(/,/g, ".");
          const numericValue = parseFloat(cleanStr);
          return sum + (isNaN(numericValue) ? 0 : numericValue);
        }
        return sum;
      }, 0),
      rechargeCount: filteredRechargesData.length
    };
  }, [filteredData, filteredRechargesData]);

  // Componente para la lista de empresas seleccionadas
  const SelectedEnterprisesList = ({ enterprises }) => (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <span className="fw-bold text-muted">Empresas:</span>
      {enterprises.map((enterprise) => (
        <span
          key={enterprise.value}
          className="badge bg-light text-dark border d-flex align-items-center p-2"
          style={{
            fontSize: '0.9rem',
            fontWeight: 'normal',
            borderRadius: '4px'
          }}
        >
          <i className="bi bi-building me-2"></i>
          {enterprise.label}
        </span>
      ))}
    </div>
  );

  // Componente para cuando no hay empresas seleccionadas
  const NoEnterprisesSelected = () => (
    <div className="text-muted fst-italic">
      <i className="bi bi-info-circle me-2"></i>
      No hay empresas seleccionadas
    </div>
  );

  // Componente para la sección de tabs
  const TabsSection = ({ activeTab, setActiveTab, ResumenTable, DetalleTable, RechargesTable }) => (
    <div className="row g-1">
      <div className="col-sm-12">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "resumen" ? "active" : ""
              }`}
              onClick={() => setActiveTab("resumen")}
            >
              Por tipo firma
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "detalle" ? "active" : ""
              }`}
              onClick={() => setActiveTab("detalle")}
            >
              Procesos de firma
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${
                activeTab === "recargas" ? "active" : ""
              }`}
              onClick={() => setActiveTab("recargas")}
            >
              Pasarela Pagos
            </button>
          </li>
        </ul>

        <div className="tab-content mt-3">
          {activeTab === "resumen" && (
            <div className="tab-pane fade show active">
              {ResumenTable}
            </div>
          )}

          {activeTab === "detalle" && (
            <div className="tab-pane fade show active">
              {DetalleTable}
            </div>
          )}

          {activeTab === "recargas" && (
            <div className="tab-pane fade show active">
              {RechargesTable}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-5 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Consumos por Plataforma</h4>
          </div>

          {/* Filtro de tipos de firmas */}

          <div className="col-sm-7">
            <div className="row">
              {/* Empresas */}
              <div
                className="col-sm-7"
                style={{ minWidth: "200px", zIndex: 10000 }}
              >
                <label className="block text-sm font-medium mb-2">
                  Empresas
                </label>
                <Select
                  isMulti
                  options={availableEnterprises}
                  value={selectedEnterprises}
                  onChange={handleEnterpriseChange}
                  placeholder="Empresas..."
                  closeMenuOnSelect={false}
                  isDisabled={isLoading}
                  styles={customStyles}
                />
              </div>
              {/* Periodo */}
              <div className="flex-grow-1 col-sm-4">
                <label className="block text-sm font-medium mb-1">
                  Periodo
                </label>
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
                    onClick={filterData}
                    disabled={isLoading}
                    className="btn btn-primary p-2 border-0 ms-2"
                  >
                    <Search className="w-75" />
                  </button>
                </div>
              </div>
              {/* Exportar */}
              <div className="col-sm-1">
                <ExportButton
                  data={exportData}
                  fileName="reporte_pag200.xlsx"
                  sheets={exportData}
                  startDate={
                    dateRange[0] ||
                    (() => {
                      const today = new Date();
                      const startDate = new Date(today);
                      startDate.setDate(today.getDate() - daysAgo);
                      return startDate;
                    })()
                  }
                  endDate={dateRange[1] || new Date()}
                />
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

      {/* Gráficos y tablas */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="card">
          <div className="p-1">
            {/* Empresas seleccionadas */}
            <div className="row px-4 pb-2">
              {selectedEnterprises.length > 0 ? (
                <SelectedEnterprisesList enterprises={selectedEnterprises} />
              ) : (
                <NoEnterprisesSelected />
              )}
            </div>

            {/* Tablas y cards */}
            <div className="row g-1 mb-3">
              {/* Solo mostrar la tabla Total si no son iguales */}
              {!areTablesEqual && (
                <div className={`col-sm-${selectedEnterprises.length > 1 ? '3' : '3'}`}>
                  <TransactionTable
                    data={summarizedData}
                    title="Total"
                    subTitle={formatDate}
                    description=""
                    showTotal={false}
                    height={230}
                    columns={[
                      ["Firma", "signatureType", { width: "60%" }],
                      [
                        "Cantidad",
                        "total",
                        {
                          align: "right",
                          width: "30%",
                          cellStyle: { fontWeight: "bold" },
                        },
                      ],
                    ]}
                    groupByOptions={[]}
                  />
                </div>
              )}
              <div className={`col-sm-${selectedEnterprises.length > 1 ? (areTablesEqual ? '9' : '6') : (areTablesEqual ? '7' : '4')}`}>
                <TransactionTable
                  data={detailedSummarizedData}
                  title="Desglosado de consumos"
                  subTitle={formatDate}
                  description=""
                  showTotal={false}
                  height={230}
                  columns={[
                    ...(selectedEnterprises.length > 1 
                      ? [["Empresa", "enterpriseName", { width: "30%" }]] 
                      : []),
                    ["Firma", "signatureType", { width: selectedEnterprises.length > 1 ? "30%" : "50%" }],
                    ["Precio", "unitValue", { align: "right", width: "20%" }],
                    ["Cantidad", "total", { align: "right", width: "20%" }],
                  ]}
                  groupByOptions={["signatureType"]}
                />
              </div>
              <div className={`col-sm-${selectedEnterprises.length > 1 ? '3' : '5'}`}>
                <div className="row g-1">
                  {selectedEnterprises.length > 1 ? (
                    // Cuando hay más de una empresa seleccionada
                    <>
                      <div className="col-12 mb-2">
                        <TotalsCardComponent
                          data={totalSumQuantity}
                          trend={{ value: totalRecords, text: " Registros" }}
                          title="Total"
                          subTitle="Firmas"
                          description="Firmas registradas"
                          icon="bi bi-key"
                          unknown={false}
                        />
                      </div>
                      <div className="col-12">
                        <TotalsCardComponent
                          data={totalRechargeValue}
                          title="Recargas directas"
                          subTitle={formatDate}
                          description="Suma total de recargas en el período"
                          icon="bi bi-currency-dollar"
                          format="number"
                          trend={{
                            value: filteredRechargesData.length,
                            text: "Recargas",
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    // Layout original cuando hay una o ninguna empresa seleccionada
                    <>
                      <div className="col-sm-6">
                        <TotalsCardComponent
                          data={totalSumQuantity}
                          trend={{ value: totalRecords, text: " Registros" }}
                          title="Total"
                          subTitle="Firmas"
                          description="Firmas registradas"
                          icon="bi bi-key"
                          unknown={false}
                        />
                      </div>
                      <div className="col-sm-6">
                        <TotalsCardComponent
                          data={totalRechargeValue}
                          title="Recargas directas"
                          subTitle={formatDate}
                          description="Suma total de recargas en el período"
                          icon="bi bi-currency-dollar"
                          format="number"
                          trend={{
                            value: filteredRechargesData.length,
                            text: "Recargas",
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <TabsSection
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              ResumenTable={ResumenTable}
              DetalleTable={DetalleTable}
              RechargesTable={RechargesTable}
            />
          </div>
        </div>
      )}

      {/* Añadir el modal aquí */}
      <ProcessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        processData={selectedProcess}
      />
    </div>
  );
}
