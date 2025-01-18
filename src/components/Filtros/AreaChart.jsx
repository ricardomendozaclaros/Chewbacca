import { useEffect, useRef, useMemo } from "react";
import _ from 'lodash';

const AreaChart = ({
  data,
  xAxis,
  yAxis,
  groupBy,
  title,
  subTitle,
  description,
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Paleta de colores diversa y profesional
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

  // Colores para las áreas con opacidad
  const areaColors = colors.map(color => {
    // Convertir el color hexadecimal a RGB y agregar opacidad
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
  });

  

  const processedData = useMemo(() => {
    if (!data?.length) return { xAxisData: [], series: [], groupValues: [] };

    const groupedData = _.groupBy(data, item =>
      xAxis === "date"
        ? new Date(item[xAxis]).toLocaleDateString()
        : item[xAxis]
    );

    const groupValues = _.uniq(data.map(item => item[groupBy]));
    const xAxisData = _.keys(groupedData).sort();

    const series = groupValues.map((groupValue, index) => ({
      name: groupValue,
      type: "line",
      stack: "Total",
      areaStyle: {
        color: areaColors[index % areaColors.length]
      },
      itemStyle: {
        color: colors[index % colors.length]
      },
      emphasis: { 
        focus: "series",
        areaStyle: {
          opacity: 0.3
        }
      },
      data: xAxisData.map(xValue =>
        _.sumBy(
          groupedData[xValue]?.filter(item => item[groupBy] === groupValue),
          item => Number(item[yAxis]) || 0
        )
      )
    }));

    return { xAxisData, series, groupValues };
  }, [data, xAxis, yAxis, groupBy]);

  useEffect(() => {
    if (!window.echarts || !chartRef.current) return;

    const initChart = () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      
      chartInstance.current = window.echarts.init(chartRef.current);
      
      const { xAxisData, series, groupValues } = processedData;

      const option = {
        color: colors,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: { backgroundColor: "#6a7985" }
          }
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          top: 25,
          left: 'center',
          pageButtonPosition: 'end',
          pageButtonGap: 5,
          pageButtonItemGap: 5,
          pageIconColor: '#2d61d3',
          pageIconInactiveColor: '#aaa',
          pageIconSize: 12,
          pageTextStyle: {
            color: '#666'
          },
          data: groupValues
        },
        toolbox: {
          right: 10,
          feature: {
            saveAsImage: {
              pixelRatio: 2
            }
          }
        },
        grid: {
          top: 80,
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [{
          type: "category",
          boundaryGap: false,
          data: xAxisData,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          }
        }],
        yAxis: [{
          type: "value",
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        }],
        series
      };

      if (xAxisData.length > 0) {
        chartInstance.current.setOption(option);
      }
    };

    initChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [processedData]);

  useEffect(() => {
    const handleResize = _.debounce(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      handleResize.cancel();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="card">
      <div className="px-2">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ""}</span>
        </h5>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "400px"
          }}
        />
        <p className="card-text">{description}</p>
      </div>
    </div>
  );
};

export default AreaChart;