import { useState, useMemo, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import { GetSignatureProcesses } from "../../api/signatureProcess.js";

import TransactionTable from "../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../components/Dashboard/TotalsCardComponent.jsx";

import { Search } from "lucide-react";

export default function Pag102() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedPlans, setSelectedPlans] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await GetSignatureProcesses();
        setAllData(result);
        setFilteredData(result);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Opciones de planes
  const planOptions = useMemo(() => {
    const uniquePlans = [...new Set(allData.map((item) => item.plan))];
    return [
      { value: "all", label: "Todos los planes" },
      ...uniquePlans.map((plan) => ({
        value: plan,
        label: plan.charAt(0).toUpperCase() + plan.slice(1),
      })),
    ];
  }, [allData]);

  // Función memoizada para filtrar datos
  const filterData = useCallback(() => {
    let result = [...allData];
    const [startDate, endDate] = dateRange;

    if (startDate) {
      result = result.filter((item) => new Date(item.date) >= startDate);
    }

    if (endDate) {
      result = result.filter((item) => new Date(item.date) <= endDate);
    }

    if (
      selectedPlans.length > 0 &&
      !selectedPlans.find((p) => p.value === "all")
    ) {
      result = result.filter((item) =>
        selectedPlans.some((plan) => plan.value === item.plan)
      );
    }

    setFilteredData(result);
  }, [allData, dateRange, selectedPlans]);

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
          <div className="col-sm-6 d-flex align-items-center">
            <h2 className="font-weight-bold mx-2">Postpago</h2>
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

          <div className="col-sm-3">
            <label className="block text-sm font-medium mb-1">Planes</label>
            <div className="d-flex align-items-center">
              <Select
                isMulti
                options={planOptions}
                value={selectedPlans}
                onChange={handlePlanChange}
                placeholder="Filtrar por planes"
                className="rounded"
                classNamePrefix="select"
                isClearable={true}
                isDisabled={isLoading}
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

      {/* Gráficos */}

      {!isLoading && !error && filteredData.length > 0 && (
        <div className="card">
          <div className="p-1">
            {/* Fila 1 */}
            <div className="row g-1">
              {/* Primera columna */}
              <div className="col-sm-2"></div>

              {/* Segunda columna */}
              <div className="col-sm-2"></div>

              {/* Tercera columna */}
              <div className="col-sm-8">
                <div className="row g-1 align-items-center">
                  <div className="col-sm-4">
                    <TotalsCardComponent
                      data={646}
                      title="Total usuarios nuevos registrados"
                      subTitle=""
                      description=""
                      icon="bi bi-currency-dollar"
                    />
                  </div>
                  <div className="col-sm-4">
                    <TotalsCardComponent
                      data={166}
                      title="Total usuarios nuevos con primera recarga"
                      subTitle=""
                      description=""
                    />
                  </div>
                  <div className="col-sm-4">
                    <TotalsCardComponent
                      data={812}
                      title="% Conversion de usuarios nuevos con primera recarga"
                      subTitle=""
                      description=""
                      icon="bi bi-credit-card"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2 */}
            <div className="row g-1">
              <div className="col-sm-12">
                <TransactionTable
                  data={filteredData}
                  title=""
                  subTitle=""
                  description="example"
                  showTotal={true}
                  columns={[
                    ["Tipo Firma", "description"],
                    ["Unitario", "unitValue"],
                    ["Transaccion", "totalValue"],
                  ]}
                  groupByOptions={[
                    { field: "description", operation: "group" },
                    { field: "unitValue", operation: "count" },
                    { field: "totalValue", operation: "sum" },
                  ]}
                />
              </div>
            </div>

            {/* Fila 3 */}
            <div className="row g-1">
              <div className="col-sm-12">
                <TransactionTable
                  data={filteredData}
                  title=""
                  subTitle=""
                  description="example"
                  showTotal={true}
                  columns={[
                    ["Tipo Firma", "description"],
                    ["Unitario", "unitValue"],
                    ["Transaccion", "totalValue"],
                  ]}
                  groupByOptions={[
                    { field: "description", operation: "group" },
                    { field: "unitValue", operation: "count" },
                    { field: "totalValue", operation: "sum" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
