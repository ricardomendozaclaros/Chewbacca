import { useMemo } from "react";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import { es } from 'date-fns/locale';
import { Calendar, Search } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

const DateColumnFilter = ({ 
  data, 
  dateRange, 
  onDateRangeChange,
  selectedColumn,
  onColumnChange,
  selectedValues,
  onValueChange,
  searchText,        // Nuevo prop para el texto de búsqueda
  onSearchChange,    // Nuevo prop para manejar cambios en la búsqueda
  filteredCount,
  totalCount
}) => {
  const [startDate, endDate] = dateRange;

  const columnOptions = useMemo(() => {
    if (!data.length) return [];
    
    const sampleObject = data[0];
    const excludedColumns = ['date', 'id'];
    
    return Object.keys(sampleObject)
      .filter(key => !excludedColumns.includes(key))
      .map(key => ({
        value: key,
        label: key.charAt(0).toUpperCase() + key.slice(1)
          .replace(/([A-Z])/g, ' $1')
          .trim()
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const valueOptions = useMemo(() => {
    if (!selectedColumn || !data.length) return [];
    
    const uniqueValues = [...new Set(data.map(item => item[selectedColumn.value]))];
    return uniqueValues
      .filter(value => value)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(value => ({
        value: value,
        label: String(value)
      }));
  }, [selectedColumn, data]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-white shadow-sm mb-4">
      <div className="flex flex-wrap gap-4">
        {/* Filtro de texto global */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en todos los campos..."
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={onDateRangeChange}
            locale={es}
            isClearable={true}
            placeholderText="Seleccionar rango de fechas"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="dd/MM/yyyy"
          />
        </div>
      </div>

      {/* Filtros de columnas */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select
            placeholder="Seleccionar columna"
            value={selectedColumn}
            onChange={(option) => {
              onColumnChange(option);
              onValueChange([]);
            }}
            options={columnOptions}
            isClearable
            className="text-sm"
          />
        </div>

        <div className="flex-1">
          <Select
            isMulti
            placeholder="Seleccionar valores"
            value={selectedValues}
            onChange={onValueChange}
            options={valueOptions}
            isDisabled={!selectedColumn}
            isClearable
            className="text-sm"
            closeMenuOnSelect={false}
          />
        </div>
      </div>

      {/* Contador de registros */}
      {filteredCount !== totalCount && (
        <span className="text-xs text-gray-500">
          Mostrando {filteredCount.toLocaleString()} de {totalCount.toLocaleString()} registros
        </span>
      )}
    </div>
  );
};

export default DateColumnFilter;