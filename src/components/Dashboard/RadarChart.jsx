import { useEffect, useRef } from "react";

/**
 * @typedef {Object} RadarIndicator
 * @property {string} name - Nombre del indicador
 * @property {number} max - Valor máximo
 */

const RadarChart = ({
  data,
  title,
  subTitle,
  description,
  height = 300,
  indicators = [],
  series = [],
  shape = 'polygon', // 'circle' | 'polygon'
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
            trigger: 'item'
          },
          legend: {
            show: legend,
            top: '0%',
            left: 'center'
          },
          radar: {
            shape: shape,
            indicator: indicators,
            splitArea: {
              show: true,
              areaStyle: {
                color: ['rgba(250,250,250,0.3)',
                  'rgba(200,200,200,0.3)']
              }
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(211, 211, 211, 0.5)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(211, 211, 211, 0.5)'
              }
            }
          },
          series: series.map(seriesConfig => ({
            name: seriesConfig.name,
            type: 'radar',
            data: [{
              value: data[seriesConfig.name],
              name: seriesConfig.name,
              itemStyle: seriesConfig.itemStyle || {},
              areaStyle: seriesConfig.areaStyle || {
                opacity: 0.3
              },
              lineStyle: seriesConfig.lineStyle || {
                width: 2
              }
            }]
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
  }, [data, height, indicators, series, shape, legend]);

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

export default RadarChart; 