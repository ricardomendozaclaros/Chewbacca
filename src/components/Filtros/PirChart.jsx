// PieChart.jsx
import { useEffect, useRef } from 'react';

const PieChart = ({
  data,
  valueField,    // campo para el valor (ej: 'quantity')
  nameField,     // campo para el nombre de cada segmento (ej: 'role')
  title = '',
  height = '400px'
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;
    
    const renderChart = () => {
      if (!window.echarts || !chartRef.current || !data.length) return;

      chart = window.echarts.init(chartRef.current);

      // Agrupar datos por el campo nameField
      const aggregatedData = data.reduce((acc, item) => {
        const key = item[nameField];
        if (!acc[key]) acc[key] = 0;
        acc[key] += item[valueField];
        return acc;
      }, {});

      // Convertir a formato para el pie chart
      const seriesData = Object.entries(aggregatedData).map(([name, value]) => ({
        name,
        value
      }));

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['40%', '70%'], // Donut chart
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {d}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: seriesData
          }
        ]
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
  }, [data, valueField, nameField, title]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height
      }}
    />
  );
};

export default PieChart;