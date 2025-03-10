import { useState, useMemo, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import { GetSignatureProcessesCertifirma } from "../../api/signatureProcessCertifirma.js";
import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../components/Dashboard/TotalsCardComponent.jsx";
import { useParseValue } from "../../hooks/useParseValue.js";
import { Bold, ImageOff, Search } from "lucide-react";
import ExportButton from "../../components/BtnExportar.jsx";
import { GetEnterprises } from "../../api/enterprise.js";
import { googleSheetsService } from "../../utils/googleSheetsService";
import sheetsConfig from "../../resources/TOCs/sheetsConfig.json";

export default function Pag201() {
  const { parseValue } = useParseValue();
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("resumen");
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);
  const [rechargesData, setRechargesData] = useState([]);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);

  const daysAgo = 20; // Número de días para el rango de fechas
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

  // Cargar datos iniciales (solo una vez al montar el componente)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);

        const result = await GetSignatureProcessesCertifirma({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });

        //trayendo de googlesheet
        const sheetConfig = sheetsConfig.sheets.find(
          (sheet) => sheet.name === "recargasDirectas"
        );

        if (!sheetConfig) {
          throw new Error(`Configuración no encontrada`);
        }

        const { url, tabs } = sheetConfig;
        const sheetResult = await googleSheetsService.getAllTabsData(
          url,
          tabs,
          {
            autoTypeConversion: true,
            skipEmptyRows: true,
          }
        );

        if (sheetResult?.results?.DirectRecharges?.data) {
          setRechargesData(
            sheetResult.results.DirectRecharges.data.map((item) => ({
              ...item,
              id: crypto.randomUUID(),
            }))
          );
        }

        transformAndSetData(result);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Sin dependencias: solo se ejecuta una vez al montar el componente

  useEffect(() => {
    const loadEnterprises = async () => {
      try {
        const result = await GetEnterprises();
        // Filter only pospago enterprises and format for Select
        const pospagos = result
          .filter((emp) => emp.plan === "pospago")
          .map((emp) => ({
            value: emp.enterpriseId,
            label: emp.enterpriseName,
          }));
        setEnterprises(pospagos);
      } catch (error) {
        console.error("Error loading enterprises:", error);
      }
    };

    loadEnterprises();
  }, []);

  const filteredRechargesData = useMemo(() => {
    if (!rechargesData.length) return [];

    // Get default dates if no dateRange is selected
    let startDate, endDate;
    if (!dateRange[0]) {
      const today = new Date();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysAgo);
      endDate = today;
    } else {
      startDate = dateRange[0];
      endDate = dateRange[1] || dateRange[0];
    }

    return rechargesData.filter((item) => {
      const rechargeDate = parseSpanishDate(item["FECHA DE LA RECARGA"]);
      if (!rechargeDate) return false;

      return rechargeDate >= startDate && rechargeDate <= endDate;
    });
  }, [rechargesData, dateRange, daysAgo]);

  // Simplified filterData function
  const filterData = useCallback(async () => {
    try {
      setIsLoading(true);
      let [startDate, endDate] = dateRange;

      if (!startDate) {
        // If no dates selected, use default range (today - 20 days)
        const today = new Date();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);
        endDate = today;
      } else {
        // If only startDate is selected, use it as endDate too
        endDate = endDate || startDate;
      }

      const result = await GetSignatureProcessesCertifirma({
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });

      transformAndSetData(result);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  // Memoize the summarized data for the first table and total records
  // For the first table - only grouped by signature type
  const summarizedData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      const key = item.description;
      if (!acc[key]) {
        acc[key] = {
          signatureType: item.description,
          total: 0,
        };
      }
      acc[key].total += item.quantity || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) =>
      a.signatureType.localeCompare(b.signatureType)
    );
  }, [filteredData]);

  // For the second table - grouped by both signature type and price
  const detailedSummarizedData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      const key = `${item.description}-${item.unitValue}`;
      if (!acc[key]) {
        acc[key] = {
          signatureType: item.description,
          unitValue: item.unitValue || 0,
          total: 0,
        };
      }
      acc[key].total += item.quantity || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      if (a.signatureType === b.signatureType) {
        return b.unitValue - a.unitValue;
      }
      return a.signatureType.localeCompare(b.signatureType);
    });
  }, [filteredData]);

  const totalRechargeValue = useMemo(() => {
    const total = filteredRechargesData.reduce((sum, item) => {
      const valueStr = item["VALOR DE LA RECARGA"];

      const cleanStr = valueStr
        .replace("$", "")
        .replace(/\./g, "")
        .replace(/\s/g, "")
        .replace(",", ".");

      const numericValue = parseFloat(cleanStr) || 0;

      return sum + numericValue;
    }, 0);

    return total;
  }, [filteredRechargesData]);

  // Memoize the grouped data for the resumen table
  const groupedData = useMemo(() => {
    const grouped = filteredData.reduce((acc, item) => {
      const key = `${item.enterpriseId}-${item.enterpriseName}`;
      if (!acc[key]) {
        acc[key] = {
          nit: item.enterpriseId,
          enterpriseName: item.enterpriseName,
          ...Object.fromEntries(
            [...new Set(filteredData.map((i) => i.description))].map((type) => [
              type,
              0,
            ])
          ),
        };
      }
      // Sum quantity instead of incrementing
      acc[key][item.description] += item.quantity || 0;
      return acc;
    }, {});

    return Object.values(grouped);
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

  // Memoize table components
  const ResumenTable = useMemo(
    () => (
      <TransactionTable
        data={groupedData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={true} // Enable pagination
        rowsPerPage={15} // Set rows per page
        columns={[
          ["NIT", "nit"],
          ["Nombre", "enterpriseName"],
          ...Object.keys(groupedData[0] || {})
            .filter((key) => !["nit", "enterpriseName"].includes(key))
            .map((key) => [parseValue("description", key), key]),
        ]}
        groupByOptions={[]}
      />
    ),
    [groupedData]
  );

  // Update DetalleTable to use raw filtered data
  const DetalleTable = useMemo(
    () => (
      <TransactionTable
        data={filteredData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={true} // Enable pagination
        rowsPerPage={15} // Set rows per page
        columns={[
          ["ID", "id"],
          ["Fecha", "date"],
          ["Firma", "description"],
          ["Cantidad", "quantity"],
          ["Valor unitario", "unitValue"],
          ["Total", "totalValue"],
          ["NIT", "enterpriseId"],
          ["Nombre", "enterpriseName"],
          ["Email", "email"],
        ]}
        groupByOptions={[]}
      />
    ),
    [filteredData]
  );

  const RechargesTable = useMemo(
    () => (
      <TransactionTable
        data={rechargesData}
        title=""
        subTitle=""
        description=""
        showTotal={false}
        height={450}
        pagination={false}
        rowsPerPage={15}
        columns={[
          ["Consecutivo", "CONSECUTIVO", { width: "10%" }],
          ["Razón Social", "RAZON SOCIAL", { width: "30%" }],
          ["NIT", "NIT", { width: "15%" }],
          [
            "Valor",
            "VALOR DE LA RECARGA",
            {
              align: "right",
              width: "15%",
            },
          ],
          ["Fecha", "FECHA DE LA RECARGA", { width: "15%" }],
          ["Plan", "PLAN", { width: "15%" }],
        ]}
        groupByOptions={[]}
      />
    ),
    [rechargesData]
  );

  // Simplify totalRecords to just show filteredData length
  const totalRecords = useMemo(() => {
    return filteredData.length;
  }, [filteredData]);

  const totalSumQuantity = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [filteredData]);

  // Función para transformar y establecer datos
  const transformAndSetData = useCallback(
    (data) => {
      if (selectedEnterprises.length > 0) {
        const filtered = data.filter((item) =>
          selectedEnterprises.some(
            (enterprise) => enterprise.value === item.enterpriseId
          )
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(data);
      }
    },
    [selectedEnterprises]
  );

  const handleEnterpriseChange = useCallback((selected) => {
    setSelectedEnterprises(selected || []);
  }, []);

  // Estilos personalizados para el combobox
  const customStyles = {
    multiValue: (base) => ({
      ...base,
      maxWidth: "200px", // Ancho máximo de cada elemento seleccionado
      whiteSpace: "nowrap", // Evitar que el texto se divida en varias líneas
      overflow: "hidden", // Ocultar el desbordamiento
      textOverflow: "ellipsis", // Mostrar puntos suspensivos si el texto es demasiado largo
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: "40px", // Altura máxima del contenedor de valores seleccionados
      overflowX: "auto", // Scroll horizontal
      flexWrap: "nowrap", // Evitar que los elementos se apilen
      display: "flex", // Mostrar elementos en una sola línea
      alignItems: "center", // Centrar verticalmente los elementos
    }),
  };

  // Add this helper function for date formatting
  const formatDateRange = (dateRange) => {
    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    if (!dateRange[0]) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysAgo);
      return `Del ${formatDate(startDate)} - ${formatDate(today)}`;
    }

    const start = new Date(dateRange[0]);
    const end = dateRange[1] ? new Date(dateRange[1]) : start;
    return `Del ${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">
              Consumos Certicamara
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
                  onClick={filterData}
                  disabled={isLoading}
                  className="btn btn-primary p-2 border-0 mx-1"
                >
                  <Search className="w-75" />
                </button>
              </div>
            </div>
            <div className="mx-2">
              <ExportButton
                data={exportData}
                fileName="reporte_pag201.xlsx"
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
            {/* Fila 1 - Summary Table */}
            <div className="row g-1 mb-3">
              <div className="col-sm-3">
                <TransactionTable
                  data={summarizedData}
                  title="Autenticaciones:"
                  subTitle={formatDateRange(dateRange)}
                  description=""
                  showTotal={false}
                  height={250}
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
              <div className="col-sm-4">
                <TransactionTable
                  data={detailedSummarizedData}
                  title="Autenticaciones por precio"
                  subTitle={formatDateRange(dateRange)}
                  description="."
                  showTotal={false}
                  height={250}
                  columns={[
                    ["Firma", "signatureType", { width: "50%" }],
                    ["Precio", "unitValue", { align: "right", width: "25%" }],
                    ["Cantidad", "total", { align: "right", width: "25%" }],
                  ]}
                  groupByOptions={["signatureType"]}
                />
              </div>
              <div className="col-sm-5">
                <div className="row g-1">
                  <div className="col-sm-6">
                    <TotalsCardComponent
                      data={totalSumQuantity}
                      trend={{ value: totalRecords, text: " Registros" }}
                      title="Total"
                      subTitle="Autenticación "
                      description="Autenticación registradas"
                      icon="bi bi-key"
                      unknown={false}
                    />
                  </div>
                  <div className="col-sm-6">
                    <TotalsCardComponent
                      data={totalSumQuantity}
                      trend={{ value: totalRecords, text: "registros" }}
                      title="API"
                      subTitle="Total"
                      description="Consumo por el servicio de API"
                      icon="bi bi-cloudy"
                      iconBgColor="#e1fdff"
                      unknown={true}
                    />
                  </div>
                </div>
                <div className="row g-1">
                  <div className="col-sm-6">
                    <TotalsCardComponent
                      data={totalRechargeValue}
                      title="Recargas directas"
                      subTitle={formatDateRange(dateRange)}
                      description="Suma total de recargas en el período"
                      icon="bi bi-currency-dollar"
                      format="number"
                      trend={{
                        value: filteredRechargesData.length,
                        text: "Recargas",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* New Tabs Section */}
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
                      Recargas directas
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
          </div>
        </div>
      )}
    </div>
  );
}
