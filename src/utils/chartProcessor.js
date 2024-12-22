export const processChartData = (chartType, data, xAxisField, selectedField, processType, selectedValues = []) => {
  console.log(chartType)
  if (chartType === "pieChart") {
    return processPieChartData(data, selectedField, processType);
  } else if (chartType === "lineChart") {
    return processLineChartData(data, xAxisField, selectedField, processType);
  } else if (chartType === "totalsCard") {
    return processTotalsData(data, selectedField, processType, selectedValues) ;
  } else if (chartType === "transactionTable") {
    return processTableData(data, selectedField, selectedValues);
  }
  
  console.warn(`Tipo de gráfico desconocido: ${chartType}`);
  return { series: [], categories: [] };
};

// Procesar datos para tablas (filtros y selección de columnas)
export const processTableData = (data, selectedFields, selectedValues) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Filtrar por valores seleccionados (si aplica)
  const filteredData = selectedValues.length
    ? data.filter((item) =>
        selectedValues.some((selected) => selected === item[selectedFields])
      )
    : data;

  // Mapear solo las columnas seleccionadas
  const processedData = filteredData.map((item) => {
    let row = {};
    selectedFields.forEach((field) => {
      row[field] = item[field] || "-";
    });
    return row;
  });

  return processedData;
};


// Procesar datos para totalizadores (sum y count)
export const processTotalsData = (data, selectedFieldObj, operation) => {
  let processedResult = 0;
  const { field, subfields } = selectedFieldObj;

  // Filtrar data por los subfields seleccionados
  const filteredData = data.filter((item) => subfields.includes(item[field]));

  if (operation === "sum" && typeof filteredData[0]?.[field] === 'number') {
    processedResult = filteredData.reduce((acc, item) => acc + item[field], 0);
  } else if (operation === "count") {
    processedResult = filteredData.length;
  }

  return processedResult;
};

// Obtener valores únicos de un campo (para el filtro de subfields)
export const getUniqueValues = (data, selectedField) => {
  return Array.from(
    new Set(data.map((item) => item[selectedField]).filter((val) => val !== undefined))
  );
};

// Procesamiento para LineChart (tendencias en el tiempo)
export const processLineChartData = (data, xAxisField, selectedField, processType) => {
  let groupedData = {};
  let xaxis = [];
  let series = {};

  data.forEach((item) => {
    const key = item[xAxisField]?.split("T")[0];
    const yValue = item[selectedField];

    if (!groupedData[key]) {
      groupedData[key] = {};
    }

    if (!groupedData[key][yValue]) {
      groupedData[key][yValue] = 0;
    }

    if (processType === "count") {
      groupedData[key][yValue] += 1;
    } else if (processType === "sum") {
      groupedData[key][yValue] += item.unitValue || 0;
    }
  });

  xaxis = Object.keys(groupedData).sort();

  Object.keys(groupedData).forEach((date) => {
    Object.entries(groupedData[date]).forEach(([role, value]) => {
      if (!series[role]) {
        series[role] = [];
      }
      series[role].push(value);
    });
  });

  const formattedSeries = Object.entries(series).map(([role, values]) => ({
    name: role,
    data: values,
  }));

  return {
    categories: xaxis,
    series: formattedSeries,
  };
};

// Procesamiento para PieChart (proporciones por categoría)
export const processPieChartData = (data, selectedField, processType) => {
  let fieldMap = {};

  data.forEach((item) => {
    const key = item[selectedField];
    fieldMap[key] =
      (fieldMap[key] || 0) + (processType === "sum" ? item.unitValue || 0 : 1);
  });

  let processedData;
  if (processType === "percentage") {
    const total = Object.values(fieldMap).reduce((acc, val) => acc + val, 0);
    processedData = Object.entries(fieldMap).map(([name, value]) => ({
      name,
      value: ((value / total) * 100).toFixed(2),
    }));
  } else {
    processedData = Object.entries(fieldMap).map(([name, value]) => ({
      name,
      value,
    }));
  }
  return processedData;
};
