// utils/chartProcessor.js

export const processChartData = (chartType, data, xAxisField, selectedField, processType) => {
    if (chartType === "pieChart") {
      return processPieChartData(data, selectedField, processType);  // Solo devuelve la serie (sin categorías)
    } else if (chartType === "lineChart") {
      return processLineChartData(data, xAxisField, selectedField, processType);
    }
    return { series: [], categories: [] };  // Retornar vacío si el tipo no es reconocido
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
  
    // Calcular porcentaje si aplica
    if (processType === "percentage") {
      series = calculatePercentage(series);
    }
  
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
    console.log(data);
    console.log(selectedField, processType)
    // Agrupar data por el campo seleccionado
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
  
    return processedData;  // Solo devolver el array de objetos name, value
  };
  
  // Calcular porcentaje para LineChart
  const calculatePercentage = (series) => {
    let totalPerDay = {};
    let result = {};
  
    Object.entries(series).forEach(([role, data]) => {
      data.forEach((value, index) => {
        totalPerDay[index] = (totalPerDay[index] || 0) + value;
      });
    });
  
    Object.entries(series).forEach(([role, data]) => {
      result[role] = data.map((value, index) =>
        totalPerDay[index] ? ((value / totalPerDay[index]) * 100).toFixed(2) : 0
      );
    });
  
    return result;
  };
  