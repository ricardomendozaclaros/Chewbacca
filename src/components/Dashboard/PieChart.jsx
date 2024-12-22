import { useEffect, useRef } from "react";

const PieChart = ({data, title, subTitle, description}) => {
  const chartRef = useRef(null); // Referencia al contenedor del gráfico
  // console.log(data, title, subTitle, description);
  useEffect(() => {
    let trafficChart = null;

    const renderChart = () => {
      if (window.echarts) {
        if (!chartRef.current) return;

        // Inicializa o redimensiona el gráfico
        trafficChart = window.echarts.init(chartRef.current);

        const chartOptions = {
          tooltip: {
            trigger: "item",
          },
          legend: {
            top: "0%",
            left: "center",
          },
          series: [
            {
              name: "Access From",
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: false,
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: "18",
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data
              // data: [
              //   { value: 1048, name: "Search Engine" },
              //   { value: 735, name: "Direct" },
              //   { value: 580, name: "Email" },
              //   { value: 484, name: "Union Ads" },
              //   { value: 300, name: "Video Ads" },
              // ],
            },
          ],
        };

        trafficChart.setOption(chartOptions);
      }
    };

    // Render inicial
    renderChart();

    // Observer para detectar redimensionamiento
    const resizeObserver = new ResizeObserver(() => {
      if (trafficChart) {
        trafficChart.resize();
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    // Cleanup
    return () => {
      if (trafficChart) {
        trafficChart.dispose();
      }
      if (chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [data]);

  return (
    <div className="card" style={{ width: "100%", height: "100%" }}>

      <div className="card-body pb-0" style={{ height: "100%" }}>
        <h5 className="card-title">
          {title} <span>| {subTitle}</span>
        </h5>
        {/* Contenedor del gráfico */}
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "100%", // Altura mínima opcional
          }}
        ></div>
        <span>{description}</span>
      </div>
    </div>
  );
};

export default PieChart;
