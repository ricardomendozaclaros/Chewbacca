import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import TransactionTable from "../../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent.jsx";
import BarChart from "../../../components/Filtros/BarChar.jsx";
import { googleSheetsService } from "../../../utils/googleSheetsService.js";
import sheetsConfig from "../../../resources/TOCs/sheetsConfig.json";
import PieChart from "../../../components/Filtros/PirChart.jsx";

// Estilos personalizados para el DatePicker
const customDatePickerStyles = {
  datepickerWrapper: {
    position: "relative",
    zIndex: 1000, // Asegura que el DatePicker esté por encima de otros elementos
  },
  datepickerInput: {
    width: "100%",
  },
};

// Estilos para ser inyectados en el head del documento
const injectGlobalStyles = () => {
  // Si ya existe el estilo, no lo volvemos a crear
  if (document.getElementById("datepicker-custom-styles")) return;

  const styleEl = document.createElement("style");
  styleEl.id = "datepicker-custom-styles";
  styleEl.innerHTML = `
    .react-datepicker-popper {
      z-index: 1050 !important; /* Mayor z-index para asegurar que aparezca encima */
    }
    .react-datepicker-wrapper {
      display: block;
      width: 100%;
    }
    .react-datepicker__input-container {
      width: 100%;
    }
  `;
  document.head.appendChild(styleEl);
};

export default function Pag701() {
  // Inyectar estilos globales al montar el componente
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  // Datos originales (sin filtrar)
  const [nominaData, setNominaData] = useState({ data: [], columns: [] });
  const [plantillasData, setPlantillasData] = useState({
    data: [],
    columns: [],
  });

  // Datos filtrados
  const [filteredNominaData, setFilteredNominaData] = useState({
    data: [],
    columns: [],
  });
  const [filteredPlantillasData, setFilteredPlantillasData] = useState({
    data: [],
    columns: [],
  });

  // Agregar nuevo estado para Prestamos después de los estados existentes
  const [prestamosData, setPrestamosData] = useState({
    data: [],
    columns: [],
  });

  const [filteredPrestamosData, setFilteredPrestamosData] = useState({
    data: [],
    columns: [],
  });

  // Modificar el estado activeTab para incluir Prestamos
  const [activeTab, setActiveTab] = useState("Plantillas");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filterActive, setFilterActive] = useState(false);
  const dataLoadedRef = useRef(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (dataLoadedRef.current) return;

      try {
        setIsLoading(true);
        console.log("Cargando datos desde Google Sheets...");

        const sheetConfig = sheetsConfig.sheets.find(
          (sheet) => sheet.name === "recursosHumanos"
        );

        if (!sheetConfig) {
          throw new Error(`Configuración no encontrada`);
        }

        const { url, tabs } = sheetConfig;
        const result = await googleSheetsService.getAllTabsData(url, tabs, {
          autoTypeConversion: true,
          skipEmptyRows: true
        });

        console.log("Datos recibidos:", result);

        // Process Prestamos data
        if (result.results?.Prestamos?.data?.length) {
          const prestamos = result.results.Prestamos.data;
          console.log("Datos de préstamos crudos:", prestamos);

          // Filtrar filas vacías o inválidas
          const prestamosValidos = prestamos.filter(row => 
            Object.values(row).some(value => value !== null && value !== '')
          );

          const prestamosWithIds = prestamosValidos.map((row) => ({
            ...row,
            uniqueId: uuidv4(),
          }));

          setPrestamosData({
            data: prestamosWithIds,
            columns: Object.keys(prestamosValidos[0] || {}),
          });

          setFilteredPrestamosData({
            data: prestamosWithIds,
            columns: Object.keys(prestamosValidos[0] || {}),
          });

          console.log("Datos de préstamos procesados:", prestamosWithIds.length);
        }

        // Process Nomina data
        if (result.results?.Nomina?.data?.length) {
          const nomina = result.results.Nomina.data;
          const nominaWithIds = nomina.map((row) => ({
            ...row,
            uniqueId: uuidv4(),
          }));

          setNominaData({
            data: nominaWithIds,
            columns: Object.keys(nomina[0] || {}),
          });

          setFilteredNominaData({
            data: nominaWithIds,
            columns: Object.keys(nomina[0] || {}),
          });

          console.log("Datos de nómina procesados:", nominaWithIds.length);
        }

        // Process Plantillas data
        if (result.results?.Plantilla?.data?.length) {
          const plantillas = result.results.Plantilla.data;
          const plantillasWithIds = plantillas.map((row) => ({
            ...row,
            uniqueId: uuidv4(),
          }));

          setPlantillasData({
            data: plantillasWithIds,
            columns: Object.keys(plantillas[0] || {}),
          });

          setFilteredPlantillasData({
            data: plantillasWithIds,
            columns: Object.keys(plantillas[0] || {}),
          });

          console.log(
            "Datos de plantillas procesados:",
            plantillasWithIds.length
          );
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
      setFilteredPrestamosData(prestamosData);
      setFilterActive(false);
      return;
    }

    // Buscar la columna de fecha en cada dataset
    const findDateColumn = (columns) => {
      return columns.find(
        (col) =>
          col.toLowerCase().includes("fecha") ||
          col.toLowerCase().includes("date") ||
          col.toLowerCase() === "fech"
      );
    };

    // Filtrar datos de nómina
    if (nominaData.data.length > 0) {
      const dateColumn = findDateColumn(nominaData.columns);
      console.log("Columna de fecha en nómina:", dateColumn);

      let filteredData = [...nominaData.data];

      if (dateColumn) {
        filteredData = filteredData.filter((item) => {
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
        data: filteredData,
      });

      console.log(
        `Nómina filtrada: ${filteredData.length} de ${nominaData.data.length}`
      );
    }

    // Filtrar datos de plantillas
    if (plantillasData.data.length > 0) {
      const dateColumn = findDateColumn(plantillasData.columns);
      console.log("Columna de fecha en plantillas:", dateColumn);

      let filteredData = [...plantillasData.data];

      if (dateColumn) {
        filteredData = filteredData.filter((item) => {
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
        data: filteredData,
      });

      console.log(
        `Plantillas filtradas: ${filteredData.length} de ${plantillasData.data.length}`
      );
    }

    // Filtrar datos de prestamos
    if (prestamosData.data.length > 0) {
      const dateColumn = findDateColumn(prestamosData.columns);
      console.log("Columna de fecha en préstamos:", dateColumn);

      let filteredData = [...prestamosData.data];

      if (dateColumn) {
        filteredData = filteredData.filter((item) => {
          const itemDate = new Date(item[dateColumn]);
          if (isNaN(itemDate.getTime())) return true;
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          return true;
        });
      }

      setFilteredPrestamosData({
        ...prestamosData,
        data: filteredData,
      });

      console.log(
        `Prestamos filtrados: ${filteredData.length} de ${prestamosData.data.length}`
      );
    }

    setFilterActive(true);
  }, [dateRange, nominaData, plantillasData, prestamosData]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setDateRange([null, null]);
    setFilteredNominaData(nominaData);
    setFilteredPlantillasData(plantillasData);
    setFilteredPrestamosData(prestamosData);
    setFilterActive(false);
    console.log("Filtros limpiados");
  }, [nominaData, plantillasData, prestamosData]);

  // Get active data based on current tab
  const activeData = useMemo(() => {
    switch (activeTab) {
      case "Nomina":
        return filteredNominaData.data;
      case "Prestamos":
        return filteredPrestamosData.data;
      default:
        return filteredPlantillasData.data;
    }
  }, [
    activeTab,
    filteredNominaData,
    filteredPlantillasData,
    filteredPrestamosData,
  ]);

  const PLANTILLAS_COLUMNS = [
    "nombre",
    "cargo",
    "fecha ingreso",
    "sueldo neto",
    "sueldo bruto",
  ];

  // Definir las columnas específicas para Préstamos
  const PRESTAMOS_COLUMNS = [
    "fecha",
    "nombre",
    "cantidad",
    "plazo",
    "cuota mensaul",
    "saldo"
  ];

  // Get columns for active tab
  const tableColumns = useMemo(() => {
    let currentData;
    switch (activeTab) {
      case "Nomina":
        currentData = filteredNominaData;
        break;
      case "Prestamos":
        currentData = filteredPrestamosData;
        break;
      default:
        currentData = filteredPlantillasData;
    }

    if (!currentData?.columns?.length) return [];

    const monetaryFields = [
      "sueldo",
      "bruto",
      "neto",
      "descuentos",
      "bonos",
      "total",
      "precio",
      "cantidad",
      "cuota",
      "saldo"
    ];

    let columnsToShow = currentData.columns;

    if (activeTab === "Plantillas") {
      columnsToShow = currentData.columns.filter((column) =>
        PLANTILLAS_COLUMNS.includes(column.toLowerCase())
      );
    } else if (activeTab === "Prestamos") {
      columnsToShow = currentData.columns.filter((column) =>
        PRESTAMOS_COLUMNS.includes(column.toLowerCase())
      );
    }

    return columnsToShow.map((column) => [
      // Capitalizar primera letra y manejar casos especiales
      column.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
      column,
      {
        align: monetaryFields.some((term) =>
          column.toLowerCase().includes(term)
        )
          ? "right"
          : "left",
      },
    ]);
  }, [activeTab, filteredNominaData, filteredPlantillasData, filteredPrestamosData]);

  // Obtener datos para el gráfico de área de nómina
  const nominaChartData = useMemo(() => {
    // Si no hay datos de nómina, retornamos un array vacío
    if (!filteredNominaData?.data?.length) return [];

    // Verificar si tenemos las columnas necesarias
    const hasRequiredColumns =
      filteredNominaData.columns.some(
        (col) => col.toLowerCase() === "año" || col.toLowerCase() === "year"
      ) &&
      filteredNominaData.columns.some(
        (col) =>
          col.toLowerCase() === "mens" ||
          col.toLowerCase() === "mes" ||
          col.toLowerCase() === "month"
      ) &&
      filteredNominaData.columns.some(
        (col) =>
          col.toLowerCase() === "planilla" || col.toLowerCase() === "payroll"
      );

    if (!hasRequiredColumns) {
      console.log("No se encontraron las columnas necesarias para el gráfico");
      return [];
    }

    // Encontrar las columnas exactas
    const yearCol = filteredNominaData.columns.find(
      (col) => col.toLowerCase() === "año" || col.toLowerCase() === "year"
    );
    const monthCol = filteredNominaData.columns.find(
      (col) =>
        col.toLowerCase() === "mens" ||
        col.toLowerCase() === "mes" ||
        col.toLowerCase() === "month"
    );
    const payrollCol = filteredNominaData.columns.find(
      (col) =>
        col.toLowerCase() === "planilla" || col.toLowerCase() === "payroll"
    );

    // Preparar datos para el gráfico
    const chartData = filteredNominaData.data.map((item) => ({
      // Usar año y mes para el eje X
      date: `${item[yearCol]}-${item[monthCol]}`,
      // Valor de planilla para el eje Y
      Planilla: parseFloat(item[payrollCol]) || 0,
      // Usar año como grupo
      year: item[yearCol],
    }));

    return chartData;
  }, [filteredNominaData]);

  // First, add this calculation after your existing useMemo hooks
  const inactivePlantillasStats = useMemo(() => {
    const totalRecords = filteredPlantillasData?.data?.length || 0;
    const inactiveRecords =
      filteredPlantillasData?.data?.filter(
        (item) => item.estado?.toLowerCase() === "inactivo"
      )?.length || 0;

    return {
      total: totalRecords,
      inactive: inactiveRecords,
      text: `${inactiveRecords}/${totalRecords}`,
    };
  }, [filteredPlantillasData]);

  // Calcular métricas para las tarjetas de Plantillas
  const plantillaMetrics = useMemo(() => {
    if (!filteredPlantillasData?.data?.length)
      return {
        lastEmployee: { name: "N/A", date: "N/A" },
        totalBonuses: 0,
        totalPayroll: 0,
      };

    // Buscar las columnas necesarias
    const nombreColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("nombre")
    );

    const fechaColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("fecha")
    );

    const bonosColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("bono")
    );

    const totalColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("total percibido")
    );

    // Ordenar por fecha para encontrar el último empleado contratado
    let lastEmployee = { name: "No disponible", date: "N/A" };

    if (nombreColumn && fechaColumn) {
      // Filtrar solo los que tienen fecha válida
      const validEmployees = filteredPlantillasData.data
        .filter(
          (item) =>
            item[fechaColumn] &&
            new Date(item[fechaColumn]).toString() !== "Invalid Date"
        )
        .sort((a, b) => new Date(b[fechaColumn]) - new Date(a[fechaColumn]));

      if (validEmployees.length > 0) {
        const latest = validEmployees[0];
        lastEmployee = {
          name: latest[nombreColumn] || "N/A",
          date: latest[fechaColumn] || "N/A",
        };
      }
    }

    // Calcular el total de bonos
    let totalBonuses = 0;
    if (bonosColumn) {
      totalBonuses = filteredPlantillasData.data.reduce((sum, item) => {
        const value = item[bonosColumn];
        if (!value) return sum;

        // Convertir a número si es string
        const numValue =
          typeof value === "string"
            ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."))
            : parseFloat(value);

        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
    }

    // Calcular el total de la planilla
    let totalPayroll = 0;
    if (totalColumn) {
      totalPayroll = filteredPlantillasData.data.reduce((sum, item) => {
        const value = item[totalColumn];
        if (!value) return sum;

        // Convertir a número si es string
        const numValue =
          typeof value === "string"
            ? parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."))
            : parseFloat(value);

        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
    }

    return {
      lastEmployee,
      totalBonuses,
      totalPayroll,
    };
  }, [filteredPlantillasData]);

  // Agregar este nuevo useMemo para calcular el total de préstamos
  const prestamosMetrics = useMemo(() => {
    if (!filteredPrestamosData?.data?.length) return {
      totalAmount: 0
    };

    const cantidadColumn = filteredPrestamosData.columns.find(col => 
      col.toLowerCase() === 'cantidad'
    );

    let totalAmount = 0;
    if (cantidadColumn) {
      totalAmount = filteredPrestamosData.data.reduce((sum, item) => {
        const value = item[cantidadColumn];
        if (!value) return sum;

        // Convertir a número si es string (maneja formatos como "1.000.000,00")
        const numValue = typeof value === 'string'
          ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
          : parseFloat(value);

        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
    }

    return {
      totalAmount
    };
  }, [filteredPrestamosData]);

  // Formatear valores monetarios
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Add some CSS for tab styling
  const tabStyles = {
    active: "nav-link active text-primary",
    inactive: "nav-link text-secondary",
  };

  // Add this new memo to process department data
  const departmentStats = useMemo(() => {
    if (!filteredPlantillasData?.data?.length) return [];

    // Find the department column
    const depColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("departamento")
    );

    if (!depColumn) return [];

    // Count occurrences of each department
    const depCount = filteredPlantillasData.data.reduce((acc, item) => {
      const dept = item[depColumn] || "No Asignado";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format required by PieChart
    return Object.entries(depCount).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredPlantillasData]);

  // Add this new memo after departmentStats
  const workplaceStats = useMemo(() => {
    if (!filteredPlantillasData?.data?.length) return [];

    // Find the workplace column
    const workplaceColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("lugar de trabajo")
    );

    if (!workplaceColumn) return [];

    // Count occurrences of each workplace
    const workplaceCount = filteredPlantillasData.data.reduce((acc, item) => {
      const workplace = item[workplaceColumn] || "No Asignado";
      acc[workplace] = (acc[workplace] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format required by PieChart
    return Object.entries(workplaceCount).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredPlantillasData]);

  // Agregar estos nuevos useMemo para los cálculos de edades y profesiones
  const ageDistributionData = useMemo(() => {
    if (!filteredPlantillasData?.data?.length) return [];

    const fechaNacColumn = filteredPlantillasData.columns.find((col) =>
      col.toLowerCase().includes("fecha nacimiento")
    );

    if (!fechaNacColumn) return [];

    const ageRanges = {
      "Menores de 20": 0,
      "20-30": 0,
      "30-40": 0,
      "40-50": 0,
      "Mayores de 50": 0,
    };

    filteredPlantillasData.data.forEach((person) => {
      const birthDate = new Date(person[fechaNacColumn]);
      if (isNaN(birthDate.getTime())) return;

      const age = new Date().getFullYear() - birthDate.getFullYear();

      if (age < 20) ageRanges["Menores de 20"]++;
      else if (age < 30) ageRanges["20-30"]++;
      else if (age < 40) ageRanges["30-40"]++;
      else if (age < 50) ageRanges["40-50"]++;
      else ageRanges["Mayores de 50"]++;
    });

    return Object.entries(ageRanges).map(([range, count]) => ({
      "Rango de Edad": range,
      Cantidad: count,
    }));
  }, [filteredPlantillasData]);

  const professionDistributionData = useMemo(() => {
    if (!filteredPlantillasData?.data?.length) return [];

    const professionColumn = filteredPlantillasData.columns.find(
      (col) => col[6]
    );

    if (!professionColumn) return [];

    // Crear un objeto para contar las ocurrencias de cada profesión
    const professionCount = filteredPlantillasData.data.reduce(
      (acc, person) => {
        const profession =
          person[professionColumn]?.trim() || "No especificado";
        acc[profession] = (acc[profession] || 0) + 1;
        return acc;
      },
      {}
    );

    // Convertir el objeto a un array y ordenar por cantidad descendente
    return Object.entries(professionCount)
      .map(([profession, count]) => ({
        Profesión: profession,
        Cantidad: count,
      }))
      .sort((a, b) => b.Cantidad - a.Cantidad); // Ordenar por cantidad descendente
  }, [filteredPlantillasData]);

  // Configuración de columnas para las nuevas tablas
  const ageTableColumns = [
    ["Rango de Edad", "Rango de Edad", { align: "left" }],
    ["Cantidad", "Cantidad", { align: "right" }],
  ];

  const professionTableColumns = [
    ["Profesión", "Profesión", { align: "left" }],
    ["Cantidad", "Cantidad", { align: "right" }],
  ];

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Recursos Humanos</h4>
          </div>

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div
              className="mx-2"
              style={{ position: "relative", width: "300px" }}
            >
              <label className="block text-sm font-medium mb-1">Periodo</label>
              <div className="d-flex align-items-center">
                <div style={customDatePickerStyles.datepickerWrapper}>
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
                    className="form-control rounded"
                    style={customDatePickerStyles.datepickerInput}
                    disabled={isLoading}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="auto"
                    popperModifiers={{
                      preventOverflow: {
                        enabled: true,
                        escapeWithReference: false,
                        boundariesElement: "viewport",
                      },
                      offset: {
                        enabled: true,
                        offset: "0, 10", // desplaza hacia abajo para evitar superposición
                      },
                    }}
                  />
                </div>
                <button
                  onClick={applyFilters}
                  disabled={
                    isLoading ||
                    (dateRange[0] === null && dateRange[1] === null)
                  }
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

      {/* Gráfico de área para nómina */}
      {!isLoading && !error && activeTab === "Nomina" && (
        <div className="card mb-4">
          <div className="p-3">
            <div className="row">
              <div className="col-12">
                <BarChart
                  data={nominaChartData}
                  xAxis="date"
                  yAxis="Planilla"
                  groupBy="year"
                  title="Evolución de la Nómina"
                  subTitle="Por mes"
                  description="Tendencia de los costos de nómina por período"
                  height="300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas para plantillas */}
      {!isLoading && !error && activeTab === "Plantillas" && (
        <div className="card">
          <div className="p-1">
            {/* fila 1 */}
            <div className="row g-1">
              <div className="col-sm-3">
                <TotalsCardComponent
                  data={plantillaMetrics.lastEmployee.name}
                  title="Último empleado contratado"
                  subTitle={plantillaMetrics.lastEmployee.date}
                  description="Empleado más reciente en la planilla"
                  icon="bi bi-person"
                  iconBgColor="#e6fbef"
                  unknown={false}
                  format="string"
                />
              </div>
              <div className="col-sm-3">
                <TotalsCardComponent
                  data={plantillaMetrics.totalBonuses}
                  title="Total Bonos"
                  subTitle="COP"
                  description="Suma total de bonos pagados"
                  icon="bi bi-award"
                  iconBgColor="#fff4e6"
                  unknown={false}
                />
              </div>
              <div className="col-sm-3">
                <TotalsCardComponent
                  data={plantillaMetrics.totalPayroll}
                  title="Total Planilla"
                  subTitle="COP"
                  description="Suma total de todos los pagos (Total Percibido)"
                  icon="bi bi-cash-stack"
                  iconBgColor="#e1f5fe"
                  unknown={false}
                />
              </div>
              <div className="col-sm-3">
                <TotalsCardComponent
                  data={inactivePlantillasStats.text}
                  title="Plantillas Inactivas"
                  subTitle="Total inactivos / Total registros"
                  description="Proporción de plantillas en estado inactivo"
                  icon="bi bi-person-x"
                  iconBgColor="#fee2e2"
                  unknown={false}
                  format={"string"}
                />
              </div>
            </div>

            {/* fila 2 */}
            <div className="row g-1">
              <div className="col-sm-3">
                <PieChart
                  data={departmentStats}
                  title="Distribución por Departamento"
                  subTitle={`Total: ${filteredPlantillasData.data.length}`}
                  description="Cantidad de empleados por departamento"
                  valueField="value"
                  nameField="name"
                  height="250"
                />
              </div>
              <div className="col-sm-3">
                <PieChart
                  data={workplaceStats}
                  title="Distribución por Lugar de Trabajo"
                  subTitle={`Total: ${filteredPlantillasData.data.length}`}
                  description="Cantidad de empleados por lugar de trabajo"
                  valueField="value"
                  nameField="name"
                  height="250"
                />
              </div>
              <div className="col-sm-3">
                <TransactionTable
                  data={ageDistributionData}
                  title="Distribución por Edad"
                  subTitle=""
                  description=""
                  columns={ageTableColumns}
                  height={200}
                  pagination={false}
                />
              </div>
              <div className="col-sm-3">
                  <TransactionTable
                    data={professionDistributionData}
                    title="Distribución por Profesión"
                    subTitle=""
                    description=""
                    columns={professionTableColumns}
                    height={200}
                    pagination={false}
                  />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agregar el totalizador para préstamos */}
      {!isLoading && !error && activeTab === "Prestamos" && (
        <div className="card">
          <div className="p-1">
            <div className="row g-1">
              <div className="col-sm-3">
                <TotalsCardComponent
                  data={prestamosMetrics.totalAmount}
                  title="Total Préstamos"
                  subTitle="COP"
                  description="Suma total de préstamos otorgados"
                  icon="bi bi-cash"
                  iconBgColor="#e1f5fe"
                  unknown={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs y Tablas */}
      {!isLoading && !error && (
        <div className="card">
          <div className="p-1">
            {/* Ultima fila */}
            <div className="row g-1">
              <div className="col-sm-12">
                <div className="card">
                  <div className="p-1">
                    <div className="row g-1">
                      <div className="col-sm-12">
                        <ul className="nav nav-tabs" role="tablist">
                          <li className="nav-item" role="presentation">
                            <button
                              className={
                                activeTab === "Plantillas"
                                  ? tabStyles.active
                                  : tabStyles.inactive
                              }
                              onClick={() => setActiveTab("Plantillas")}
                            >
                              Plantillas (
                              {filteredPlantillasData?.data?.length || 0})
                            </button>
                          </li>
                          <li className="nav-item" role="presentation">
                            <button
                              className={
                                activeTab === "Nomina"
                                  ? tabStyles.active
                                  : tabStyles.inactive
                              }
                              onClick={() => setActiveTab("Nomina")}
                            >
                              Nómina ({filteredNominaData?.data?.length || 0})
                            </button>
                          </li>
                          <li className="nav-item" role="presentation">
                            <button
                              className={
                                activeTab === "Prestamos"
                                  ? tabStyles.active
                                  : tabStyles.inactive
                              }
                              onClick={() => setActiveTab("Prestamos")}
                            >
                              Préstamos (
                              {filteredPrestamosData?.data?.length || 0})
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
