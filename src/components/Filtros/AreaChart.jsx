// AreaChart.jsx
import { useEffect, useRef } from 'react';

const AreaChart = ({ 
  data,
  xAxis, // campo para el eje X (ej: 'date')
  yAxis, // campo para el valor (ej: 'quantity')
  groupBy, // campo para agrupar las series (ej: 'description')
  title = 'Gráfico de Área'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;
    
    const renderChart = () => {
      if (!window.echarts || !chartRef.current || !data.length) return;

      chart = window.echarts.init(chartRef.current);

      // Obtener fechas únicas para el eje X
      const xAxisData = [...new Set(data.map(item => 
        xAxis === 'date' 
          ? new Date(item[xAxis]).toLocaleDateString()
          : item[xAxis]
      ))].sort();

      // Obtener valores únicos para agrupar (series)
      const groupValues = [...new Set(data.map(item => item[groupBy]))];

      // Crear series automáticamente
      const series = groupValues.map(groupValue => {
        const seriesData = xAxisData.map(xValue => {
          const filteredData = data.filter(item => {
            const itemDate = xAxis === 'date' 
              ? new Date(item[xAxis]).toLocaleDateString()
              : item[xAxis];
            return itemDate === xValue && item[groupBy] === groupValue;
          });

          return filteredData.reduce((sum, item) => sum + item[yAxis], 0);
        });

        return {
          name: groupValue,
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          emphasis: {
            focus: 'series'
          },
          data: seriesData
        };
      });

      const option = {
        title: {
          text: title
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: groupValues
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        }],
        yAxis: [{
          type: 'value'
        }],
        series
      };

      chart.setOption(option);
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => {
      if (chart) {
        chart.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      if (chart) {
        chart.dispose();
      }
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [data, xAxis, yAxis, groupBy, title]);

  return (
    <div 
      ref={chartRef} 
      style={{
        width: '100%',
        height: '400px'
      }}
    />
  );
};

export default AreaChart;