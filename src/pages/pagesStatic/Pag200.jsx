import { useState, useMemo, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { GetSignatureProcesses } from "../../api/signatureProcess.js";

import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";

import { useParseValue } from "../../hooks/useParseValue.js";

import { Search } from "lucide-react";

export default function Pag200() {
  const { parseValue } = useParseValue();
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalData, setOriginalData] = useState([]);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await GetSignatureProcesses();
        setOriginalData(result); // Store original data

        // Initial transform without filters
        transformAndSetData(result);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Add transform function
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


  // Función memoizada para filtrar datos
  const filterData = useCallback(() => {
    const [startDate, endDate] = dateRange;
    let filtered = [...originalData];

    if (startDate) {
      filtered = filtered.filter((item) => new Date(item.date) >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((item) => new Date(item.date) <= endDate);
    }

    transformAndSetData(filtered);
  }, [dateRange, originalData, transformAndSetData]);

  const handlePlanChange = useCallback((selected) => {
    if (!selected) {
      setSelectedPlans([]);
      return;
    }

    if (selected.find((option) => option.value === "all")) {
      setSelectedPlans([{ value: "all", label: "Todos los planes" }]);
    } else {
      setSelectedPlans(selected.filter((option) => option.value !== "all"));
    }
  }, []);

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-9 d-flex align-items-center">
            <h2 className="font-weight-bold mx-2">Por Cuentas</h2>
          </div>

          <div className="col-sm-3">
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
                className="btn bg-secondary p-2 border-0 mx-1"
              >
                <Search className="w-75" />
              </button>
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

      {/* Gráficos */}

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

            {/* Fila 2 */}
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
