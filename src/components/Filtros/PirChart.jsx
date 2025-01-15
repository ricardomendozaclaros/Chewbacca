// PieChart.jsx
import { useEffect, useRef } from 'react';

const PieChart = ({
  data,
  title, 
  subTitle, 
  description,
  valueField,    // campo para el valor (ej: 'quantity')
  nameField, 
  height = '200'
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
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['40%', '70%'], // Donut chart
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
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
    
    <div className="card">
    <div className="px-2 pb-2">
      <h5 className="card-title">
        {title} <span>  {subTitle ? `| ${subTitle}` : ''} </span>
      </h5>
      <h6 className="card-subtitle text-muted">{subTitle}</h6>
      <p className="card-text">{description}</p>
      <div
      ref={chartRef}
      style={{
        width: '100%',
        height: `${height}px`
      }}
    />
    </div>
  </div>
  );
};

export default PieChart;