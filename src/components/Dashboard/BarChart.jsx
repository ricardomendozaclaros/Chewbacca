import { useEffect, useRef } from "react";

/**
 * @typedef {Object} SeriesConfig
 * @property {string} name - Nombre de la serie
 * @property {string} type - Tipo de gráfico ('bar' | 'line')
 * @property {string} [stack] - Nombre del grupo para apilar (opcional)
 * @property {Object} [itemStyle] - Estilo personalizado
 */

/**
 * @typedef {Object} AxisConfig
 * @property {string} type - Tipo de eje ('value' | 'category')
 * @property {Array} data - Datos del eje
 * @property {Object} [axisLabel] - Configuración de etiquetas
 */

const BarChart = ({
  data,
  title,
  subTitle,
  description,
  horizontal = false, // Orientación del gráfico
  series = [], // Configuración de series
  xAxis = {}, // Configuración del eje X
  yAxis = {}, // Configuración del eje Y
  legend = true, // Mostrar/ocultar leyenda
  height = 300, // Añadimos prop para altura fija
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;

    const renderChart = () => {
      if (window.echarts && chartRef.current) {
        chart = window.echarts.init(chartRef.current);

        // Configuración base del gráfico
        const chartOptions = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            show: legend,
            top: '0%',
            left: 'center'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: horizontal ? {
            type: 'value',
            ...xAxis
          } : {
            type: 'category',
            data: data.categories,
            ...xAxis
          },
          yAxis: horizontal ? {
            type: 'category',
            data: data.categories,
            ...yAxis
          } : {
            type: 'value',
            ...yAxis
          },
          series: series.map(seriesConfig => ({
            name: seriesConfig.name,
            type: seriesConfig.type || 'bar',
            stack: seriesConfig.stack,
            data: data.series[seriesConfig.name],
            itemStyle: seriesConfig.itemStyle || {},
            label: {
              show: seriesConfig.showLabels || false
            }
          }))
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
  }, [data, horizontal, series, xAxis, yAxis, legend]);

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
            height: `${height}px`, // Altura fija desde props
          }}
        ></div>
        <span>{description}</span>
      </div>
    </div>
  );
};

export default BarChart;
