import React, { useState, useMemo } from 'react';
import Bar from '../../components/Filtros/Bar.jsx';
import Donut from '../../components/Filtros/Donut.jsx';
import Gauge from '../../components/Filtros/Gauge.jsx';
import MapChart from '../../components/Filtros/MapChart.jsx';
import data from "../../utils/exampledata.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale';
import Select from 'react-select';

export default function Filters() {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedPlans, setSelectedPlans] = useState([]);

  // Obtener todos los planes únicos
  const planOptions = useMemo(() => {
    const uniquePlans = [...new Set(data.map(item => item.plan))];
    return [
      { value: 'all', label: 'Todos los planes' },
      ...uniquePlans.map(plan => ({
        value: plan,
        label: plan.charAt(0).toUpperCase() + plan.slice(1)
      }))
    ];
  }, []);

  // Función para filtrar datos según el rango de fechas y planes
  const getFilteredData = () => {
    let filteredData = [...data];
    
    // Filtro de fechas
    if (startDate) {
      filteredData = filteredData.filter(item =>
        new Date(item.date) >= startDate
      );
    }
    
    if (endDate) {
      filteredData = filteredData.filter(item =>
        new Date(item.date) <= endDate
      );
    }

    // Filtro de planes
    if (selectedPlans.length > 0 && !selectedPlans.find(p => p.value === 'all')) {
      filteredData = filteredData.filter(item =>
        selectedPlans.some(plan => plan.value === item.plan)
      );
    }
   // console.log(filteredData)
    return filteredData;
  };

  const handlePlanChange = (selected) => {
    if (!selected) {
      setSelectedPlans([]);
      return;
    }
    
    if (selected.find(option => option.value === 'all')) {
      setSelectedPlans([{ value: 'all', label: 'Todos los planes' }]);
    } else {
      setSelectedPlans(selected.filter(option => option.value !== 'all'));
    }
  };

  return (
    <div className="p-4">
      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rango de Fechas</label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              locale={es}
              isClearable={true}
              placeholderText="Seleccionar rango de fechas"
              className="border rounded p-2 w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Planes</label>
            <Select
              isMulti
              options={planOptions}
              value={selectedPlans}
              onChange={handlePlanChange}
              placeholder="Seleccionar planes..."
              className="w-full"
              classNamePrefix="select"
              isClearable={true}
            />
          </div>
        </div>
      </div>

      {/* Contenedor de Gráficos */}
      <div className="space-y-6">
        {/* Primera fila: Barras y Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Valores por Empresa</h3>
            <Bar data={getFilteredData()} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Distribución por Plan</h3>
            <Donut data={getFilteredData()} />
          </div>
        </div>

        {/* Segunda fila: Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Eficiencia del Valor Unitario</h3>
            <Gauge data={getFilteredData()} type="unitValue" />
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Eficiencia de Cantidad</h3>
            <Gauge data={getFilteredData()} type="quantity" />
          </div>
        </div>

        {/* Tercera fila: Mapa */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribución Geográfica</h3>
          <MapChart data={getFilteredData()} />
        </div>
      </div>
    </div>
  );
}