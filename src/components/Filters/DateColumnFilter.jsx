import { useMemo, useEffect } from "react";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import { es } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";
import './DateColumnFilter.css';

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: '38px',
    height: 'auto',
    minWidth: '250px',
    maxWidth: '400px'
  }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: '80px',
    overflow: 'auto',
    flexWrap: 'wrap'
  }),
  multiValue: (base) => ({
    ...base,
    margin: '2px',
  }),
  placeholder: (base) => ({
    ...base,
    whiteSpace: 'nowrap'
  })
};

const DateColumnFilter = ({
  data,
  dateRange,
  onDateRangeChange,
  selectedColumn,
  onColumnChange,
  selectedValues,
  onValueChange,
  searchText,
  onSearchChange,
  filteredCount,
  totalCount
}) => {
  const [startDate, endDate] = dateRange;

  const handleDateChange = (update) => {
    if (!update[0] && !update[1]) {
      onDateRangeChange([null, null]);
      return;
    }

    const [newStart, newEnd] = update;
    
    // Si se selecciona la misma fecha dos veces
    if (newStart && newEnd && newStart.getTime() === newEnd.getTime()) {
      const startOfDay = new Date(newStart);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(newStart);
      endOfDay.setHours(23, 59, 59, 999);
      
      onDateRangeChange([startOfDay, endOfDay]);
      return;
    }

    onDateRangeChange(update);
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 2);
      handleDateChange([start, end]);
    }
  }, []);

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
    const sortedValues = uniqueValues
      .filter(value => value)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(value => ({
        value: value,
        label: String(value)
      }));

    return [
      {
        value: '*',
        label: 'Seleccionar todos'
      },
      ...sortedValues
    ];
  }, [selectedColumn, data]);

  const handleValueChange = (selected) => {
    if (!selected) {
      onValueChange([]);
      return;
    }

    // Si se selecciona "Seleccionar todos"
    if (selected.some(option => option.value === '*')) {
      const allOptions = valueOptions.filter(option => option.value !== '*');
      onValueChange(allOptions);
      return;
    }

    onValueChange(selected);
  };

  const formatSelectedValues = (selected) => {
    if (!selected || selected.length === 0) return '';
    if (selected.length === valueOptions.length - 1) return 'Todos seleccionados';
    if (selected.length > 3) return `${selected.length} seleccionados`;
    return selected.map(v => v.label).join(', ');
  };

  return (
    <div className="filters-container">
      <div className="filters-wrapper">
        {/* Búsqueda */}
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
          />
        </div>

        {/* Selector de columna */}
        <div className="select-container">
          <Select
            placeholder="Columna"
            value={selectedColumn}
            onChange={(option) => {
              onColumnChange(option);
              onValueChange([]);
            }}
            options={columnOptions}
            isClearable
            styles={selectStyles}
            classNamePrefix="select"
          />
        </div>

        {/* Selector de valores */}
        <div className="select-container">
          <Select
            isMulti
            placeholder="Valores"
            value={selectedValues}
            onChange={handleValueChange}
            options={valueOptions}
            isDisabled={!selectedColumn}
            isClearable
            styles={selectStyles}
            closeMenuOnSelect={false}
            classNamePrefix="select"
            formatGroupLabel={formatSelectedValues}
          />
        </div>

        {/* Selector de fechas */}
        <div className="date-picker-container">
          <i className="bi bi-calendar3"></i>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
            locale={es}
            isClearable={true}
            placeholderText="Rango de fechas"
            dateFormat="dd/MM/yyyy"
          />
          {(startDate || endDate) && (
            <button 
              className="date-clear-button"
              onClick={() => handleDateChange([null, null])}
              type="button"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {/* Contador */}
        <div className="records-counter">
          <i className="bi bi-database"></i>
          <span>
            {filteredCount.toLocaleString()}
            {filteredCount !== totalCount && (
              <> / {totalCount.toLocaleString()}</>
            )} registros
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateColumnFilter;