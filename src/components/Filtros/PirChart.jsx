import { useEffect, useRef, useState, useMemo } from "react";
import _ from 'lodash';
import { useParseValue } from '../../hooks/useParseValue';

const PieChart = ({
  data,
  title,
  subTitle,
  description,
  valueField,
  nameField,
  height = "200",
}) => {
  const chartRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { parseValue } = useParseValue();

  const colors = [
    '#2D61D3',  // Azul corporativo
    '#34C759',  // Verde manzana
    '#FF9500',  // Naranja
    '#AF52DE',  // Púrpura
    '#FF3B30',  // Rojo
    '#5856D6',  // Índigo
    '#FF2D55',  // Rosa
    '#007AFF'   // Azul brillante
  ];

  const processedData = useMemo(() => {
    if (!data?.length) return [];
    const grouped = _.groupBy(data, nameField);
    return _.map(grouped, (items, name) => ({
      name: parseValue(nameField, name),
      value: _.sumBy(items, item => Number(item[valueField]) || 0)
    }));
  }, [data, valueField, nameField]);

  useEffect(() => {
    let chart = null;

    const renderChart = () => {
      if (!window.echarts || !chartRef.current || !processedData.length) return;

      try {
        chart = window.echarts.init(chartRef.current);

        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#eee',
            borderWidth: 1,
            padding: [8, 12],
            textStyle: {
              color: '#333',
              fontSize: 12
            }
          },
          legend: {
            type: 'scroll',
            orient: 'horizontal',
            top: 0,
            left: 'center',
            itemGap: 20,
            pageButtonPosition: 'end',
            formatter: function(name) {
              const item = processedData.find(d => d.name === name);
              return item ? `${name}: ${item.value}` : name;
            },
            textStyle: {
              fontSize: 12,
              color: '#666'
            }
          },
          series: [
            {
              name: title,
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '60%'],  // Movido un poco hacia abajo para dar espacio a la leyenda
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              labelLine: {
                show: false
              },
              emphasis: {
                scale: true,
                scaleSize: 10,
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.2)'
                }
              },
              data: _.orderBy(processedData, ['value'], ['desc']),
              color: colors
            }
          ]
        };

        chart.setOption(option);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al renderizar:', error);
        setIsLoading(false);
      }
    };

    renderChart();

    const handleResize = _.debounce(() => {
      if (chart) {
        chart.resize();
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      handleResize.cancel();
      if (chart) {
        chart.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [processedData, title, colors]);

  return (
    <div className="card shadow-sm">
      <div className="px-3 py-2">
        <h5 className="card-title text-lg font-semibold mb-1">
          {title}
          {subTitle && <span className="text-sm text-gray-500 ml-2">| {subTitle}</span>}
        </h5>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: `${height}%`,
            display: isLoading ? 'none' : 'block'
          }}
        />
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: `${height}px` }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}
         <p className="card-text">{description}</p>
      </div>
    </div>
  );
};

export default PieChart;