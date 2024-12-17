import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PieChartComponent = ({ data }) => {

  const groupByRole = (data) => {
    return Object.entries(
      data.reduce((acc, item) => {
        acc[item.role] = (acc[item.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, y]) => ({ name, y }));
  };

  const seriesData = groupByRole(data);

  const options = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: 'Distribución por rol'
    },
    tooltip: {
        pointFormat: '{point.y} registros'  
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false
            },
            showInLegend: true
        }
    },
    series: [
        {
            name: 'Roles',
            colorByPoint: true,
            data: seriesData
        }
    ]
}

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default PieChartComponent;
