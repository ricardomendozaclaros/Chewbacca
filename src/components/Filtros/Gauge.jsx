import { useEffect, useRef } from 'react';

const Gauge = ({ data, type }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let gaugeChart = null;

    const renderChart = () => {
      if (window.echarts) {
        if (!chartRef.current) return;
        
        gaugeChart = window.echarts.init(chartRef.current);

        // Calcular el valor máximo y el valor actual según el tipo
        const calculateValues = () => {
          if (type === 'unitValue') {
            const maxUnitValue = Math.max(...data.map(item => item.unitValue));
            const avgUnitValue = data.reduce((sum, item) => sum + item.unitValue, 0) / data.length;
            return {
              max: maxUnitValue,
              value: (avgUnitValue / maxUnitValue * 100).toFixed(2),
              name: 'Valor Unitario Promedio'
            };
          } else {
            const maxQuantity = Math.max(...data.map(item => item.quantity));
            const avgQuantity = data.reduce((sum, item) => sum + item.quantity, 0) / data.length;
            return {
              max: maxQuantity,
              value: (avgQuantity / maxQuantity * 100).toFixed(2),
              name: 'Cantidad Promedio'
            };
          }
        };

        const { value, name } = calculateValues();

        const option = {
          tooltip: {
            formatter: '{b} : {c}%'
          },
          series: [
            {
              name: 'Indicador',
              type: 'gauge',
              min: 0,
              max: 100,
              splitNumber: 10,
              radius: '100%',
              axisLine: {
                lineStyle: {
                  width: 30,
                  color: [
                    [0.3, '#ff6e76'],
                    [0.7, '#fddd60'],
                    [1, '#7cffb2']
                  ]
                }
              },
              pointer: {
                itemStyle: {
                  color: 'inherit'
                }
              },
              axisTick: {
                distance: -30,
                length: 8,
                lineStyle: {
                  color: '#fff',
                  width: 2
                }
              },
              splitLine: {
                distance: -30,
                length: 30,
                lineStyle: {
                  color: '#fff',
                  width: 4
                }
              },
              axisLabel: {
                color: 'inherit',
                distance: 40,
                fontSize: 12
              },
              detail: {
                valueAnimation: true,
                formatter: '{value}%',
                color: 'inherit',
                fontSize: 24,
                offsetCenter: [0, '70%']
              },
              data: [
                {
                  value: value,
                  name: name,
                }
              ]
            }
          ]
        };

        gaugeChart.setOption(option);
      }
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => {
      if (gaugeChart) {
        gaugeChart.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      if (gaugeChart) {
        gaugeChart.dispose();
      }
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [data, type]);

  return (
    <div className="card">
      <div className="card-body">
        <div
          ref={chartRef}
          style={{
            width: '100%',
            height: '300px'
          }}
        />
      </div>
    </div>
  );
};

export default Gauge;