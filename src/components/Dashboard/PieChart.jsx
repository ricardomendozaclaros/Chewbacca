import { useEffect } from "react";

const PieChart = () => {
  useEffect(() => {
    // Verifica si 'echarts' existe globalmente
    const chartDom = document.getElementById("trafficChart");
    if (window.echarts) {
      const trafficChart = window.echarts.init(chartDom);

      const chartOptions = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
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
            data: [
              { value: 1048, name: "Search Engine" },
              { value: 735, name: "Direct" },
              { value: 580, name: "Email" },
              { value: 484, name: "Union Ads" },
              { value: 300, name: "Video Ads" },
            ],
          },
        ],
      };

      trafficChart.setOption(chartOptions);

      // Limpieza del gráfico al desmontar el componente
      return () => {
        trafficChart.dispose();
      };
    }
  }, []);

  return (
    <div className="card">
      <div className="filter">
        <a className="icon" href="#" data-bs-toggle="dropdown">
          <i className="bi bi-three-dots"></i>
        </a>
        <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
          <li className="dropdown-header text-start">
            <h6>Filter</h6>
          </li>

          <li>
            <a className="dropdown-item" href="#">
              Today
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              This Month
            </a>
          </li>
          <li>
            <a className="dropdown-item" href="#">
              This Year
            </a>
          </li>
        </ul>
      </div>

      <div className="card-body pb-0">
        <h5 className="card-title">
          Website Traffic <span>| Today</span>
        </h5>
        <div
          id="trafficChart"
          style={{ minHeight: "400px", width: "100%" }}
        ></div>
      </div>
    </div>
  );
};

export default PieChart;
