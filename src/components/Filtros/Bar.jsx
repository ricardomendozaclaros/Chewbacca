import { useEffect, useRef } from 'react';

const Bar = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let barChart = null;

    const renderChart = () => {
      if (window.echarts) {
        if (!chartRef.current) return;
        
        // Inicializar el gráfico
        barChart = window.echarts.init(chartRef.current);

        // Procesar datos para el gráfico
        const enterprises = [...new Set(data.map(item => item.description))];
        const totalValues = enterprises.map(description => {
          return data
            .filter(item => item.description === description)
            .reduce((sum, item) => sum + item.totalValue, 0);
        });
        console.log(enterprises)
        console.log(totalValues)

        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          toolbox: {
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: enterprises,
            axisLabel: {
              rotate: 45,
              interval: 0
            }
          },
          yAxis: {
            type: 'value',
            name: 'Valor Total',
            axisLabel: {
              formatter: value => `$${value.toLocaleString()}`
            }
          },
          series: [
            {
              name: 'Valor Total',
              type: 'bar',
              data: totalValues,
              itemStyle: {
                color: '#5470c6'
              }
            }
          ]
        };

        barChart.setOption(option);
      }
    };

    // Render inicial
    renderChart();

    // Observer para detectar redimensionamiento
    const resizeObserver = new ResizeObserver(() => {
      if (barChart) {
        barChart.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup
    return () => {
      if (barChart) {
        barChart.dispose();
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
          Valor Total por Empresa
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

export default Bar;