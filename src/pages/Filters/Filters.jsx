import { useState, useMemo, useEffect, useCallback } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale';
import Select from 'react-select';
import { GetSignatureProcesses } from '../../api/signatureProcess.js';
import AreaChart from '../../components/Filtros/AreaChart.jsx';
import { Search } from 'lucide-react';

export default function Filters() {
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
    const uniquePlans = [...new Set(allData.map(item => item.plan))];
    return [
      { value: 'all', label: 'Todos los planes' },
      ...uniquePlans.map(plan => ({
        value: plan,
        label: plan.charAt(0).toUpperCase() + plan.slice(1)
      }))
    ];
  }, [allData]);

  // Función memoizada para filtrar datos
  const filterData = useCallback(() => {
    let result = [...allData];
    const [startDate, endDate] = dateRange;
    
    if (startDate) {
      result = result.filter(item => 
        new Date(item.date) >= startDate
      );
    }
    
    if (endDate) {
      result = result.filter(item => 
        new Date(item.date) <= endDate
      );
    }

    if (selectedPlans.length > 0 && !selectedPlans.find(p => p.value === 'all')) {
      result = result.filter(item =>
        selectedPlans.some(plan => plan.value === item.plan)
      );
    }

    setFilteredData(result);
  }, [allData, dateRange, selectedPlans]);

  const handlePlanChange = useCallback((selected) => {
    if (!selected) {
      setSelectedPlans([]);
      return;
    }
    
    if (selected.find(option => option.value === 'all')) {
      setSelectedPlans([{ value: 'all', label: 'Todos los planes' }]);
    } else {
      setSelectedPlans(selected.filter(option => option.value !== 'all'));
    }
  }, []);

  return (
    <div className="p-4">
      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Rango de Fechas</label>
            <div className="flex gap-2">
              <DatePicker
                selectsRange={true}
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={setDateRange}
                locale={es}
                isClearable={true}
                placeholderText="Filtrar por rango de fechas"
                className="border rounded p-2 w-full"
                disabled={isLoading}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
              <button
                onClick={filterData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Planes</label>
            <Select
              isMulti
              options={planOptions}
              value={selectedPlans}
              onChange={handlePlanChange}
              placeholder="Filtrar por planes"
              className="w-full"
              classNamePrefix="select"
              isClearable={true}
              isDisabled={isLoading}
            />
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

      {/* Gráfico */}
      {!isLoading && !error && filteredData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <AreaChart
            data={filteredData}
            xAxis="date"
            yAxis="quantity"
            groupBy="description"
            title="Firmas por mecanismo de validación"
          />
        </div>
      )}
    </div>
  );
}