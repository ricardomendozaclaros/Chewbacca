import { useEffect, useRef } from "react";

/**
 * @typedef {Object} GaugeConfig
 * @property {number} min - Valor mínimo
 * @property {number} max - Valor máximo
 * @property {Array} [ranges] - Rangos de colores
 * @property {Object} [progress] - Configuración de la barra de progreso
 * @property {Object} [axisLabel] - Configuración de etiquetas
 */

const GaugeChart = ({
  data,
  title,
  subTitle,
  description,
  height = 300,
  gaugeConfig = {
    min: 0,
    max: 100,
    ranges: [
      { min: 0, max: 60, color: '#FF6E76' },
      { min: 60, max: 85, color: '#FDDD60' },
      { min: 85, max: 100, color: '#7CFFB2' }
    ]
  },
  showProgress = true,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = null;

    const renderChart = () => {
      if (window.echarts && chartRef.current) {
        chart = window.echarts.init(chartRef.current);

        const chartOptions = {
          series: [{
            type: 'gauge',
            min: gaugeConfig.min,
            max: gaugeConfig.max,
            progress: {
              show: showProgress,
              width: 18
            },
            axisLine: {
              lineStyle: {
                width: 18,
                color: gaugeConfig.ranges.map(range => [
                  range.max / gaugeConfig.max,
                  range.color
                ])
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              length: 15,
              lineStyle: {
                width: 2,
                color: '#999'
              }
            },
            axisLabel: {
              distance: 25,
              color: '#999',
              fontSize: 14,
              ...gaugeConfig.axisLabel
            },
            anchor: {
              show: true,
              showAbove: true,
              size: 25,
              itemStyle: {
                borderWidth: 10
              }
            },
            title: {
              show: false,
              fontSize: 10
            },
            detail: {
              valueAnimation: true,
              fontSize: 30,
              offsetCenter: [0, '70%']
            },
            data: [{
              value: data,
              name: title
            }]
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
  }, [data, height, gaugeConfig, showProgress, title]);

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
        <span className="card-text mt-2">{description}</span>
      </div>
    </div>
  );
};

export default GaugeChart; 