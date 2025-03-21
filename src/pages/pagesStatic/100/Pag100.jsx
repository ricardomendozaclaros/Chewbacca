import { useState, useCallback, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { GetUsers } from '../../../api/user.js'
import { Search } from "lucide-react";
import ExportButton from "../../../components/BtnExportar.jsx";
import TransactionTable from "../../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent.jsx";
import { formatDateRange } from "../../../utils/dateUtils.js";

export default function Pag100() {
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  const daysAgo = 20;

  // Transform and set data function
  const transformAndSetData = useCallback((data) => {
    if (!data) return;
    setFilteredData(data);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysAgo);

        const result = await GetUsers({
          startDate: startDate.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        });

        transformAndSetData(result);
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [transformAndSetData]);

  // Filter data function
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

      const result = await GetUsers({
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
  }, [dateRange, transformAndSetData]);

  //for calculate Time of table
  const calculateDaysDifference = (dateTime) => {
    const today = new Date();
    const itemDate = new Date(dateTime);
    const diffTime = Math.abs(today - itemDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  //For table where count users by time
  const getTimeRangeStats = (data) => {
    const ranges = [
      { label: "30 días", max: 30 },
      { label: "60 días", max: 60 },
      { label: "90 días", max: 90 },
      { label: "180 días", max: 180 },
      { label: "360 días", max: 360 },
      { label: ">360 días", max: Infinity },
    ];

    const stats = ranges.map((range) => ({
      timeRange: range.label,
      count: data.filter((item) => {
        const days = calculateDaysDifference(item.dateTime);
        if (range.max === Infinity) {
          return days > 360;
        }
        const prevMax =
          ranges[ranges.findIndex((r) => r.max === range.max) - 1]?.max || 0;
        return days > prevMax && days <= range.max;
      }).length,
    }));

    return stats;
  };

  // Primero, agregamos los memoized values para los datos calculados
  const processedData = useMemo(() => {
    if (!filteredData.length) return [];

    // Procesar los datos una sola vez con los tiempos calculados
    return filteredData.map((item) => ({
      ...item,
      tiempoDias: calculateDaysDifference(item.dateTime),
    }));
  }, [filteredData]);

  // Memoizar el resumen por tema
  const themeSummary = useMemo(() => {
    if (!processedData.length) return [];

    return Object.entries(
      processedData.reduce((acc, item) => {
        acc[item.theme] = (acc[item.theme] || 0) + 1;
        return acc;
      }, {})
    ).map(([theme, count]) => ({
      theme,
      count,
    }));
  }, [processedData]);

  // Memoizar el resumen por tiempo
  const timeRangeSummary = useMemo(() => {
    if (!processedData.length) return [];
    return getTimeRangeStats(processedData);
  }, [processedData]);

  // Memoizar los datos de exportación
  const exportData = useMemo(
    () => [
      {
        name: "Resumen por Tema",
        data: themeSummary.map(({ theme, count }) => ({
          Tema: theme,
          Cantidad: count,
        })),
      },
      {
        name: "Tiempo sin Servicio",
        data: timeRangeSummary.map(({ timeRange, count }) => ({
          "Rango de Tiempo": timeRange,
          Cantidad: count,
        })),
      },
      {
        name: "Detalle de Usuarios",
        data: processedData.map((item) => ({
          Email: item.email,
          Nombre: item.firstName,
          Apellido: item.lastName,
          Empresa: item.enterpriseName,
          Fecha: item.dateTime,
          Plan: item.plan,
          "Tiempo (días)": item.tiempoDias,
        })),
      },
    ],
    [processedData, themeSummary, timeRangeSummary]
  );

  //set format date for subtitle charts
  let formatDate = formatDateRange(dateRange, daysAgo)

  return (
    <div className="">
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">100</h4>
          </div>

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
                fileName="reporte_usuarios.xlsx"
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

      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {!isLoading && !error && filteredData.length > 0 && (
        <div className="card">
          <div className="p-1">
            <div className="row g-1">
              <div className="col-sm-3">
                <TransactionTable
                  data={themeSummary}
                  title="Resumen por Tema"
                  subTitle={formatDate}
                  description=""
                  showTotal={{
                    show: true,
                    columns: [{ field: "count", fixedDecimals: false }],
                  }}
                  height={160}
                  pagination={false}
                  columns={[
                    ["Tema", "theme"],
                    ["Cantidad", "count"],
                  ]}
                  groupByOptions={[]}
                />
              </div>
              <div className="col-sm-3">
                <TransactionTable
                  data={timeRangeSummary}
                  title="Tiempo sin Servicio"
                  subTitle={formatDate}
                  description=""
                  height={160}
                  pagination={false}
                  columns={[
                    ["Rango", "timeRange"],
                    ["Cantidad", "count"],
                  ]}
                  groupByOptions={[]}
                />
              </div>
              <div className="col-sm-6">
                <div className="row g-1 mb-3">
                  <div className="col-sm-6">
                    <TotalsCardComponent
                      data={20}
                      trend={{ value: filteredData.length, text: "Registros" }}
                      title="Usuarios nuevos"
                      subTitle={formatDate}
                      description=""
                      icon="bi bi-person"
                      iconBgColor="red"
                      unknown={false}
                    />
                  </div>
                  <div className="col-sm-6">
                    <TotalsCardComponent
                      data={20}
                      trend={{ value: filteredData.length, text: "Registros" }}
                      title="Usuarios con primera recarga"
                      subTitle={formatDate}
                      description=""
                      icon="bi bi-person"
                      iconBgColor="red"
                      unknown={false}
                    />
                    <TotalsCardComponent
                      data={`${20} %`}
                      trend={{ value: filteredData.length, text: "Registros" }}
                      title="Usuarios con primera recarga"
                      subTitle={formatDate}
                      description=""
                      icon="bi bi-person"
                      iconBgColor="red"
                      unknown={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-1 mb-3">
              <div className="col-sm-12">
                <TransactionTable
                  data={processedData}
                  title=""
                  subTitle=""
                  description=""
                  showTotal={false}
                  height={450}
                  pagination={true}
                  rowsPerPage={15}
                  columns={[
                    ["Email", "email"],
                    ["Nombre", "firstName"],
                    ["Apellido", "lastName"],
                    ["Empresa", "enterpriseName"],
                    ["Fecha", "dateTime"],
                    ["Plan", "plan"],
                    ["Tiempo", "tiempoDias"],
                  ]}
                  groupByOptions={[]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
