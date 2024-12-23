import { useEffect, useRef } from "react";

const LineChart = ({ data, title, subTitle, description }) => {
  const chartRef = useRef(null); // Referencia para contenedor único del gráfico

  useEffect(() => {
    if (window.ApexCharts) {
      // Destruir gráfico anterior si existe
      if (chartRef.current && chartRef.current._chart) {
        chartRef.current._chart.destroy();
      }

      // Crear nuevo gráfico con el contenedor único
      const reportsChart = new window.ApexCharts(chartRef.current, {
        series: data.series,
        chart: {
          width: "100%",
          height: "80%",
          type: "area",
          toolbar: { show: false },
        },
        markers: { size: 4 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0.4,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        stroke: {
          curve: "smooth",
          width: 2,
        },
        xaxis: {
          categories: data.categories,
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm",
          },
        },
      });

      reportsChart.render();
      chartRef.current._chart = reportsChart;

      // Limpieza al desmontar o actualizar
      return () => {
        if (reportsChart) reportsChart.destroy();
      };
    }
  }, [data]);  // Vuelve a renderizar si los datos cambian

  return (
    <div className="card" style={{ width: "100%", height: "100%" }}>
      <div className="card-body">
        <h5 className="card-title">
          {title} <span>| {subTitle}</span>
        </h5>
        {/* Se cambia el ID estático por una referencia dinámica */}
        <div ref={chartRef} className="w-100" style={{ height: "300px" }}></div>
        {description && <p className="text-muted mt-2">{description}</p>}
      </div>
    </div>
  );
};

export default LineChart;
