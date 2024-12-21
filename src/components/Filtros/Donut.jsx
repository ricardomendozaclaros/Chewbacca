import { useEffect, useRef } from 'react';

const Donut = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let donutChart = null;
    const renderChart = () => {
      if (window.echarts) {
        if (!chartRef.current) return;
       
        // Inicializar el gráfico
        donutChart = window.echarts.init(chartRef.current);

        // Procesar datos para el gráfico
        const processData = () => {
          const planTotals = data.reduce((acc, item) => {
            if (!acc[item.plan]) {
              acc[item.plan] = 0;
            }
            acc[item.plan] += item.totalValue;
            return acc;
          }, {});

          return Object.entries(planTotals).map(([name, value]) => ({
            name,
            value
          }));

          

        };

        const chartData = processData();
        //console.log(chartData)
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: ${c:,} ({d}%)'
          },
          toolbox: {
            show: true,
            feature: {
              mark: { show: true },
              dataView: {
                show: true,
                readOnly: false,
                title: 'Ver Datos'
              },
              magicType: {
                show: true,
                type: ['pie', 'funnel', 'rose'],
                option: {
                  funnel: {
                    width: '40%',
                    height: '70%',
                    left: '30%',
                    top: '15%',
                    sort: 'descending'
                  },
                  rose: {
                    radius: [20, '70%'],
                    roseType: 'area'
                  },
                  pie: {
                    radius: ['40%', '70%'],
                    itemStyle: {
                      borderRadius: 10
                    },
                    label: {
                      show: false
                    }
                  }
                }
              },
              restore: {
                show: true,
                title: 'Restaurar'
              },
              saveAsImage: {
                show: true,
                title: 'Guardar'
              }
            }
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Valor Total por Plan',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              padAngle: 5,
              itemStyle: {
                borderRadius: 10
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 20,
                  fontWeight: 'bold',
                  formatter: '{b}\n${c:,}'
                }
              },
              labelLine: {
                show: false
              },
              data: chartData
            }
          ]
        };

        donutChart.setOption(option);
      }
    };

    // Render inicial
    renderChart();

    // Observer para detectar redimensionamiento
    const resizeObserver = new ResizeObserver(() => {
      if (donutChart) {
        donutChart.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup
    return () => {
      if (donutChart) {
        donutChart.dispose();
      }
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [data]);

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">
          Distribución por Plan
        </h5>
        <div
          ref={chartRef}
          style={{
            width: '100%',
            height: '400px'
          }}
        />
      </div>
    </div>
  );
};

export default Donut;