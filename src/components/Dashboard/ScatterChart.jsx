import { useEffect, useRef } from "react";

/**
 * @typedef {Object} SeriesConfig
 * @property {string} name - Nombre de la serie
 * @property {Object} [itemStyle] - Estilo personalizado
 * @property {Object} [label] - Configuración de etiquetas
 * @property {number} [symbolSize] - Tamaño de los puntos
 */

const ScatterChart = ({
  data,
  title,
  subTitle,
  description,
  height = 300,
  series = [],
  xAxis = {},
  yAxis = {},
  legend = true,
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
            axisPointer: {
              type: 'cross'
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
          xAxis: {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            ...xAxis
          },
          yAxis: {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            },
            ...yAxis
          },
          series: series.map(seriesConfig => ({
            name: seriesConfig.name,
            type: 'scatter',
            data: data[seriesConfig.name],
            symbolSize: seriesConfig.symbolSize || 10,
            itemStyle: seriesConfig.itemStyle || {},
            label: {
              show: seriesConfig.showLabels || false,
              position: 'top',
              formatter: seriesConfig.labelFormatter || '{c}'
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
  }, [data, height, series, xAxis, yAxis, legend]);

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

export default ScatterChart; 