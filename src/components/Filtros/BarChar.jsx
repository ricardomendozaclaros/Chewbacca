import { useEffect, useRef, useMemo } from "react";
import { useParseValue } from '../../hooks/useParseValue';
import _ from 'lodash';

const BarChart = ({
  data,
  xAxis,
  yAxis,
  groupBy,
  title,
  subTitle,
  description,
  height = "400"
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { parseValue } = useParseValue();

  // Paleta de colores diversa y profesional
  const colors = [
    '#2D61D3',  // Azul corporativo (2024)
    '#34C759',  // Verde manzana (2025)
    '#FF9500',  // Naranja
    '#AF52DE',  // Púrpura
    '#FF3B30',  // Rojo
    '#5856D6',  // Índigo
    '#FF2D55',  // Rosa
    '#007AFF'   // Azul brillante
  ];

  const processedData = useMemo(() => {
    if (!data?.length) return { xAxisData: [], series: [], groupValues: [] };

    // Filtrar para obtener solo los últimos 12 meses y excluir fechas futuras
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const filteredData = data.filter(item => {
      const itemDate = new Date(item[xAxis]);
      return itemDate >= twelveMonthsAgo && itemDate <= today;
    });

    // Extraer año de la fecha para agrupar por año
    const enhancedData = filteredData.map(item => {
      const itemDate = new Date(item[xAxis]);
      return {
        ...item,
        year: itemDate.getFullYear().toString() // Agregar el año como propiedad
      };
    });

    // Agrupar por fecha formateando correctamente
    const groupedData = _.groupBy(enhancedData, item => {
      if (xAxis === "date") {
        const date = new Date(item[xAxis]);
        // Guardar la fecha completa como clave para mantener el orden
        return date.toISOString().split('T')[0];
      }
      return item[xAxis];
    });

    // Si groupBy es el año, usar esa propiedad; de lo contrario, usar la propiedad original
    const actualGroupBy = groupBy === "year" ? "year" : groupBy;
    
    // Obtener años únicos para la leyenda
    const years = _.uniq(enhancedData.map(item => item.year)).sort();
    
    // Usar años como groupValues si groupBy es "year"
    const groupValues = actualGroupBy === "year" 
      ? years 
      : _.uniq(enhancedData.map(item => item[actualGroupBy]));
    
    // Ordenar las fechas correctamente
    const xAxisData = _.keys(groupedData).sort((a, b) => {
      if (xAxis === "date") {
        return new Date(a) - new Date(b);
      }
      return a.localeCompare(b);
    });

    // Crear series basadas en el agrupamiento
    const series = groupValues.map((groupValue, index) => {
      // Determinar el color basado en el año si es agrupado por año
      const colorIndex = actualGroupBy === "year" && groupValue >= "2024" 
        ? (groupValue === "2024" ? 0 : 1) // Usar índice 0 para 2024, 1 para 2025
        : index % colors.length;
      
      return {
        name: actualGroupBy === "year" ? groupValue : parseValue(actualGroupBy, groupValue),
        type: "bar",
        itemStyle: {
          color: colors[colorIndex]
        },
        emphasis: { 
          focus: "series"
        },
        data: xAxisData.map(xValue => {
          const itemsInGroup = groupedData[xValue];
          // Filtrar por el criterio de agrupación
          return _.sumBy(
            actualGroupBy === "year"
              ? itemsInGroup?.filter(item => item.year === groupValue)
              : itemsInGroup?.filter(item => item[actualGroupBy] === groupValue),
            item => Number(item[yAxis]) || 0
          );
        })
      };
    });

    return { 
      xAxisData, 
      series, 
      groupValues: actualGroupBy === "year" 
        ? groupValues // Años tal cual 
        : groupValues.map(val => parseValue(actualGroupBy, val)),
      years,
      // Guardar la versión formateada de las fechas para mostrar en el eje X
      formattedDates: xAxis === "date" ? xAxisData.map(date => {
        const d = new Date(date);
        return {
          original: date,
          formatted: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
        };
      }) : null
    };
  }, [data, xAxis, yAxis, groupBy]);

  useEffect(() => {
    if (!window.echarts || !chartRef.current) return;

    const initChart = () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      chartInstance.current = window.echarts.init(chartRef.current);
      
      const { xAxisData, series, groupValues, formattedDates, years } = processedData;

      // Crear items de leyenda personalizados para años si están presentes
      const legendItems = years && years.length > 0 && groupBy === "year"
        ? years.map((year, index) => ({
            name: year,
            icon: 'rect',
            itemStyle: {
              color: year === "2024" ? colors[0] : 
                     year === "2025" ? colors[1] : 
                     colors[index % colors.length]
            }
          }))
        : undefined;

      const option = {
        color: colors,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: function(params) {
            let tooltip = `<div style="margin: 0px 0 0; line-height:1;">${xAxis === "date" 
              ? new Date(params[0].axisValue).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
              : params[0].axisValue}</div>`;
            
            params.forEach((param) => {
              tooltip += `<div style="margin: 10px 0 0; line-height:1;">
                <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>
                ${param.seriesName}: ${param.value}
              </div>`;
            });
            
            return tooltip;
          }
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          top: 25,
          left: 'center',
          pageButtonPosition: 'end',
          pageButtonGap: 5,
          pageButtonItemGap: 5,
          pageIconColor: '#2d61d3',
          pageIconInactiveColor: '#aaa',
          pageIconSize: 12,
          pageTextStyle: {
            color: '#666'
          },
          textStyle: {
            color: '#333'  // Asegurar que el texto de la leyenda sea visible
          },
          // Usar ítems de leyenda personalizados si existen
          data: legendItems || groupValues.map((name, index) => ({
            name: name,
            icon: 'rect',
            itemStyle: {
              color: colors[index % colors.length]
            }
          }))
        },
        toolbox: {
          right: 10,
          feature: {
            saveAsImage: {
              pixelRatio: 2
            }
          }
        },
        grid: {
          top: 80,
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [{
          type: "category",
          data: xAxisData,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666',
            rotate: xAxisData.length > 6 ? 30 : 0,
            formatter: function(value, index) {
              if (xAxis === "date") {
                // Usar las fechas formateadas que preparamos
                if (formattedDates && formattedDates[index]) {
                  return formattedDates[index].formatted;
                }
                // Fallback por si algo falla
                const date = new Date(value);
                return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
              }
              return value;
            }
          }
        }],
        yAxis: [{
          type: "value",
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        }],
        series
      };

      if (xAxisData.length > 0) {
        chartInstance.current.setOption(option);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [processedData]);

  useEffect(() => {
    const handleResize = _.debounce(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="card">
      <div className="px-2">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ""}</span>
        </h5>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: `${height}px`,
          }}
        />
        <p className="card-text">{description}</p>
      </div>
    </div>
  );
};

export default BarChart;