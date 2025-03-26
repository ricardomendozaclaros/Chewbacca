import { useEffect, useRef } from "react";

/**
 * @typedef {Object} SeriesConfig
 * @property {string} name - Nombre de la serie
 * @property {Object} [itemStyle] - Estilo personalizado
 * @property {Object} [label] - Configuración de etiquetas
 * @property {Object} [emphasis] - Configuración de énfasis
 */

const FunnelChart = ({
  data,
  title,
  subTitle,
  description,
  height = 300,
  sort = 'descending', // 'ascending' | 'descending' | 'none'
  gap = 2, // Espacio entre secciones
  width = '80%', // Ancho del embudo
  series = [], // Configuración de series
  legend = true, // Mostrar/ocultar leyenda
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;

    const renderChart = () => {
      if (window.echarts && chartRef.current) {
        chart = window.echarts.init(chartRef.current);

        const chartOptions = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}'
          },
          legend: {
            show: legend,
            top: '0%',
            left: 'center'
          },
          series: [{
            name: title,
            type: 'funnel',
            left: 'center',
            width: width,
            sort: sort,
            gap: gap,
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}: {c}'
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: data.map((item, index) => ({
              value: item.value,
              name: item.name,
              itemStyle: series[index]?.itemStyle || {},
              label: series[index]?.label || {},
              emphasis: series[index]?.emphasis || {}
            }))
          }]
        };

        chart.setOption(chartOptions);
      }
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
  }, [data, height, sort, gap, width, series, legend, title]);

  return (
    <div className="card">
      <div className="card-body pb-0">
        <h5 className="card-title">
          {title} <span>| {subTitle}</span>
        </h5>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: `${height}px`,
          }}
        ></div>
        <span>{description}</span>
      </div>
    </div>
  );
};

export default FunnelChart; 