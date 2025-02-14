import { useState, useMemo, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import { GetSignatureProcessesCertifirma } from "../../api/signatureProcessCertifirma.js";
import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";
import { useParseValue } from "../../hooks/useParseValue.js";
import { ImageOff, Search } from "lucide-react";
import ExportButton from "../../components/BtnExportar.jsx";

export default function Pag201() {
  const { parseValue } = useParseValue();
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState([]);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [signatureTypes, setSignatureTypes] = useState([]); // Tipos de firmas únicos

  

  // Cargar datos iniciales (solo una vez al montar el componente)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await GetSignatureProcessesCertifirma();
        setOriginalData(result); // Almacenar datos originales

        // Extraer tipos de firmas únicos y traducirlos
        const uniqueSignatureTypes = [
          ...new Set(result.map((item) => item.description)),
        ];
        const translatedSignatureTypes = uniqueSignatureTypes.map((type) => ({
          value: type, // Valor original (sin traducir)
          label: parseValue("description", type), // Etiqueta traducida
        }));

        setSignatureTypes(translatedSignatureTypes);

        // Transformar y establecer datos iniciales
        transformAndSetData(result);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // Sin dependencias: solo se ejecuta una vez al montar el componente

  const exportData = [
    {
      name: "Resumen de Consumos",
      data: Object.entries(
        filteredData.reduce((acc, item) => {
          Object.keys(item).forEach((key) => {
            if (!["nit", "enterpriseName", "date"].includes(key) && item[key] > 0) {
              acc[key] = (acc[key] || 0) + item[key];
            }
          });
          return acc;
        }, {})
      ).map(([type, count]) => ({
        Firma: type,
        Cantidad: count,
      })),
    },
    {
      name: "Por cuentas",
      data: filteredData.map((item) => {
        const row = {
          NIT: item.nit,
          Nombre: item.enterpriseName,
        };
        Object.keys(item).forEach((key) => {
          if (!["nit", "enterpriseName", "date"].includes(key)) {
            row[parseValue("description", key)] = item[key];
          }
        });
        return row;
      }),
    },
    {
      name: "Todos los datos",
      data: originalData,
    },
  ];

  // Función para transformar y establecer datos
  const transformAndSetData = useCallback((data) => {
    const signatureTypes = [...new Set(data.map((item) => item.description))];

    const transformedData = Object.values(
      data.reduce((acc, item) => {
        const key = `${item.enterpriseId}-${item.enterpriseName}`;

        if (!acc[key]) {
          acc[key] = {
            nit: item.enterpriseId,
            enterpriseName: item.enterpriseName,
            date: item.date,
            ...Object.fromEntries(signatureTypes.map((type) => [type, 0])),
          };
        }

        acc[key][item.description]++;
        return acc;
      }, {})
    );

    setAllData(transformedData);
    setFilteredData(transformedData);
  }, []);

  // Función para filtrar datos
  const filterData = useCallback(async () => {
    let [startDate, endDate] = dateRange;
    console.log(dateRange)
    // Si dateRange es nulo o vacío, usar el rango de los últimos 14 días
    if (!startDate || !endDate || dateRange === null) {
      const today = new Date();
      const twoWeeksAgo = new Date(today);
      twoWeeksAgo.setDate(today.getDate() - 14);
  
      startDate = twoWeeksAgo;
      endDate = today;
  
      console.log(
        "No se seleccionaron fechas. Usando rango por defecto (últimos 14 días):",
        startDate,
        endDate
      );
    } else {
      console.log("Fechas seleccionadas:", startDate, endDate);
    }
  
    // Verificar si las fechas seleccionadas están dentro del rango de originalData
    const hasDataForRange = originalData.some(
      (item) =>
        new Date(item.date) >= startDate && new Date(item.date) <= endDate
    );
  
    if (!hasDataForRange) {
      console.log(
        "Las fechas seleccionadas NO están en la data actual. Realizando nueva consulta a Redis..."
      );
  
      // Si no hay datos para el rango seleccionado, realizar una nueva llamada
      try {
        setIsLoading(true);
        const newData = await GetSignatureProcessesCertifirma({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });
  
        console.log("Nuevos datos obtenidos de Redis:", newData);
  
        // Actualizar originalData con los nuevos datos
        setOriginalData((prevData) => [...prevData, ...newData]);
  
        // Transformar y establecer los nuevos datos
        transformAndSetData([...originalData, ...newData]);
      } catch (error) {
        console.error("Error fetching new data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log(
        "Las fechas seleccionadas SÍ están en la data actual. Usando caché..."
      );
  
      // Si los datos ya están disponibles, aplicar el filtro
      let filtered = [...originalData];
  
      // Filtrar por rango de fechas
      if (startDate) {
        filtered = filtered.filter((item) => new Date(item.date) >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter((item) => new Date(item.date) <= endDate);
      }
  
      // Filtrar por tipos de firmas seleccionados
      if (selectedPlans.length > 0) {
        const selectedTypes = selectedPlans.map((plan) => plan.value);
        filtered = filtered.filter((item) =>
          selectedTypes.includes(item.description)
        );
      }
  
      console.log("Datos filtrados desde caché:", filtered);
  
      transformAndSetData(filtered);
    }
  }, [dateRange, originalData, selectedPlans, transformAndSetData]);

  // Manejar cambios en la selección de tipos de firmas
  const handlePlanChange = useCallback((selected) => {
    if (!selected) {
      setSelectedPlans([]);
      return;
    }

    // Si se selecciona "Todos los planes"
    if (selected.find((option) => option.value === "all")) {
      setSelectedPlans([{ value: "all", label: "Todos los planes" }]);
    } else {
      setSelectedPlans(selected.filter((option) => option.value !== "all"));
    }
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

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Por Cuentas</h4>
          </div>

          {/* Filtro de tipos de firmas */}

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div className="mx-2 w-50">
              <label className="block text-sm font-medium mb-2">
                Tipo de Firma
              </label>
              <Select
                isMulti
                options={signatureTypes} // Usar las opciones traducidas
                value={selectedPlans}
                onChange={handlePlanChange}
                placeholder="Tipos de firmas..."
                closeMenuOnSelect={false}
                isDisabled={isLoading}
                styles={customStyles} // Aplicar estilos personalizados
              />
            </div>
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
              <div className="col-sm-4 mx-auto">
                <TransactionTable
                  data={Object.entries(
                    filteredData.reduce((acc, item) => {
                      Object.keys(item).forEach((key) => {
                        if (
                          !["nit", "enterpriseName", "date"].includes(key) &&
                          item[key] > 0
                        ) {
                          acc[key] = (acc[key] || 0) + item[key];
                        }
                      });
                      return acc;
                    }, {})
                  ).map(([type, count]) => ({
                    signatureType: type,
                    total: count,
                  }))}
                  title="Resumen de Consumos"
                  subTitle=""
                  description=""
                  showTotal={false}
                  height={250}
                  columns={[
                    ["Firma", "signatureType"],
                    ["Cantidad", "total"],
                  ]}
                />
              </div>
            </div>

            {/* Fila 2 - Tabla por cuentas */}
            <div className="row g-1">
              <div className="col-sm-12">
                <TransactionTable
                  data={filteredData}
                  title="Por cuentas"
                  subTitle=""
                  description=""
                  showTotal={false}
                  height={450}
                  columns={[
                    ["NIT", "nit"],
                    ["Nombre", "enterpriseName"],
                    ...Object.keys(filteredData[0] || {})
                      .filter(
                        (key) =>
                          !["nit", "enterpriseName", "date"].includes(key)
                      )
                      .map((key) => [parseValue("description", key), key]),
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
