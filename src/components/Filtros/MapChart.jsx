import { useEffect, useRef } from 'react';
import colombiaGeoJson from '../../utils/colombiaGeoJson.json';

const MapChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let mapChart = null;

    const renderChart = () => {
      if (window.echarts && chartRef.current) {
        mapChart = window.echarts.init(chartRef.current);
        
        // Registrar el mapa
        window.echarts.registerMap('Colombia', colombiaGeoJson);

        // Procesar datos para agrupar por departamento
        const processData = () => {
          // Si no hay datos, retornamos un array vacío
          if (!data || data.length === 0) {
            return [];
          }

          const departmentTotals = data.reduce((acc, item) => {
            // Validar que el item y department existan
            if (!item || !item.department) return acc;

            const dept = item.department.toUpperCase();
            if (!acc[dept]) {
              acc[dept] = {
                value: 0,
                transactions: 0
              };
            }
            acc[dept].value += item.totalValue || 0;
            acc[dept].transactions += 1;
            return acc;
          }, {});

          return Object.entries(departmentTotals).map(([name, data]) => ({
            name,
            value: data.value,
            transactions: data.transactions
          }));
        };

        const mapData = processData();
        
        // Calcular el valor máximo solo si hay datos
        const maxValue = mapData.length > 0 
          ? Math.max(...mapData.map(item => item.value))
          : 100000;

        const option = {
          title: {
            text: 'Distribución por Departamento',
            left: 'center',
            top: 20,
            textStyle: {
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'item',
            formatter: function(params) {
              const data = params.data || {};
              if (!data.value) {
                return `${params.name}<br/>Sin datos`;
              }
              return `${params.name}<br/>
                     Valor Total: $${(data.value || 0).toLocaleString()}<br/>
                     Transacciones: ${data.transactions || 0}`;
            }
          },
          visualMap: {
            left: 'right',
            min: 0,
            max: maxValue,
            text: ['Alto', 'Bajo'],
            calculable: true,
            inRange: {
              color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
            },
            show: mapData.length > 0 // Solo mostrar si hay datos
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            left: 'left',
            top: 'top',
            feature: {
              dataView: { 
                readOnly: false,
                title: 'Ver datos'
              },
              restore: { 
                title: 'Restaurar'
              },
              saveAsImage: { 
                title: 'Guardar'
              }
            }
          },
          series: [
            {
              name: 'Colombia',
              type: 'map',
              map: 'Colombia',
              roam: true,
              emphasis: {
                label: {
                  show: true
                }
              },
              data: mapData,
              nameProperty: 'NOMBRE_DPT',
              zoom: 1.2,
              itemStyle: {
                areaColor: '#eee', // Color por defecto
                borderColor: '#fff',
                borderWidth: 1
              },
              select: {
                disabled: true
              }
            }
          ]
        };

        // Si no hay datos, mostrar un mensaje
        if (mapData.length === 0) {
          mapChart.clear();
          mapChart.setOption({
            title: {
              text: 'No hay datos disponibles para el período seleccionado',
              left: 'center',
              top: 'middle',
              textStyle: {
                color: '#999',
                fontSize: 16
              }
            }
          });
          return;
        }

        mapChart.setOption(option);
      }
    };

    renderChart();

    const handleResize = () => {
      if (mapChart) {
        mapChart.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (mapChart) {
        mapChart.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="card">
      <div className="card-body">
        <div
          ref={chartRef}
          style={{
            width: '100%',
            height: '500px'
          }}
        />
      </div>
    </div>
  );
};

export default MapChart;