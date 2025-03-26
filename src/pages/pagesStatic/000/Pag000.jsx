import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { ImageOff, Search } from "lucide-react";
import BarChart from "../../../components/Dashboard/BarChart";
import PieChart from "../../../components/Filtros/PirChart";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent";
import ExportButton from "../../../components/BtnExportar";
import FunnelChart from "../../../components/Dashboard/FunnelChart";

export default function Pag000() {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  // Datos simulados para los diferentes gráficos
  const mockData = {
    // Datos para Tasa de Retención
    retencionData: {
      categories: ["Ene", "Feb", "Mar", "Abr", "May"],
      series: {
        "Tasa de Retención": [95, 93, 96, 94, 97],
      },
    },

    // Datos para Uso de Plataforma
    usoPlataformaData: {
      categories: ["Ene", "Feb", "Mar", "Abr", "May"],
      series: {
        "Firmas Digitales": [1200, 1400, 1300, 1600, 1800],
        Validaciones: [800, 900, 950, 1100, 1300],
      },
    },

    // Datos para Consumo API
    consumoApiData: {
      categories: ["Cliente A", "Cliente B", "Cliente C", "Cliente D"],
      series: {
        Firmas: [500, 300, 400, 200],
        Validaciones: [300, 200, 250, 150],
        Consultas: [200, 150, 180, 120],
      },
    },

    // Datos para Rendimiento Comercial
    rendimientoComercialData: {
      categories: ["Juan", "María", "Pedro", "Ana", "Carlos"],
      series: {
        Ventas: [50000, 65000, 45000, 70000, 55000],
      },
    },

    // Datos para ROI Campañas (PieChart)
    campanasData: [
      { name: "Email Marketing", value: 250000 },
      { name: "Google Ads", value: 180000 },
      { name: "Social Media", value: 120000 },
      { name: "Eventos", value: 90000 },
    ],

    // Datos para Pipeline de Ventas
    pipelineData: {
      categories: [
        "Prospectos",
        "Contactados",
        "Propuesta",
        "Negociación",
        "Cerrados",
      ],
      series: {
        Oportunidades: [100, 70, 45, 30, 20],
      },
    },

    // Agregar estos nuevos datos
    ingresosMetaData: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      series: {
        'Ingresos': [85000, 92000, 95000, 103000, 108000],
        'Meta': [90000, 90000, 100000, 100000, 100000]
      }
    },
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Pag000</h4>
          </div>

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div className="mx-2">
              <label className="block text-sm font-medium mb-1">Periodo</label>
              <div className="d-flex align-items-center">
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={setDateRange}
                  locale={es}
                  isClearable={true}
                  placeholderText="Filtrar por rango de fechas"
                  className="form-control rounded p-2"
                  disabled={isLoading}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <button
                  disabled={isLoading}
                  className="btn btn-primary p-2 border-0 mx-1"
                >
                  <Search className="w-75" />
                </button>
              </div>
            </div>
            <div className="mx-2">
              <ExportButton
                data={{}}
                fileName="reporte_pag200.xlsx"
                sheets={{}}
                startDate={{}}
                endDate={{}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primera fila - Indicadores clave */}
      <div className="row g-1 mb-3">
        <div className="col-sm-4">
          <TotalsCardComponent
            data={150}
            title="Nuevos Clientes Adquridos"
            subtitle=""
            description="Total de nuevos clientes adquiridos"
            icon="bi bi-people"
            trend={{ value: "+15%", text: "vs mes anterior" }}
            iconBgColor="red"
          />
        </div>
        <div className="col-sm-4">
          <TotalsCardComponent
            data={95}
            title="Tasa de Retención de Clientes"
            subtitle=""
            description="Porcentaje de clientes retenidos"
            icon="bi bi-graph-up"
            format="percentage"
            trend={{ value: "+2%", text: "vs mes anterior" }}
            iconBgColor="red"
          />
        </div>
        <div className="col-sm-4">
          
        </div>
      </div>

      {/* Nueva fila - Ingresos vs Meta */}
      <div className="row g-1 mb-3">
        <div className="col-sm-12">
          <BarChart
            data={mockData.ingresosMetaData}
            title="Ingresos Totales vs Meta"
            subTitle=""
            description=""
            height={300}
            series={[
              {
                name: 'Ingresos',
                type: 'bar',
                showLabels: true,
                itemStyle: { 
                  color: '#5470c6',
                  borderRadius: [4, 4, 0, 0] // Bordes redondeados en la parte superior
                }
              },
              {
                name: 'Meta',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#ee6666' },
                symbolSize: 8, // Tamaño del punto en la línea
                lineStyle: {
                  width: 2,
                  type: 'dashed' // Línea punteada para la meta
                }
              }
            ]}
            yAxis={{
              name: '$',
              axisLabel: {
                formatter: (value) => `${value/1000}K` // Formato en miles
              }
            }}
          />
        </div>
      </div>

      {/* Segunda fila - Gráficos principales */}
      <div className="row g-1 mb-3">
        <div className="col-sm-6">
          <BarChart
            data={mockData.usoPlataformaData}
            title="Uso de la Plataforma"
            subTitle=""
            description=""
            height={300}
            series={[
              {
                name: "Firmas Digitales",
                type: "line",
                showLabels: true,
                itemStyle: { color: "#5470c6" },
              },
              {
                name: "Validaciones",
                type: "line",
                showLabels: true,
                itemStyle: { color: "#91cc75" },
              },
            ]}
          />
        </div>
        <div className="col-sm-6">
          <BarChart
            data={mockData.consumoApiData}
            title="Consumo de API por Cliente"
            subtitle=""
            description=""
            height={300}
            series={[
              {
                name: "Firmas",
                type: "bar",
                stack: "total",
                showLabels: true,
                itemStyle: { color: "#5470c6" },
              },
              {
                name: "Validaciones",
                type: "bar",
                stack: "total",
                showLabels: true,
                itemStyle: { color: "#91cc75" },
              },
              {
                name: "Consultas",
                type: "bar",
                stack: "total",
                showLabels: true,
                itemStyle: { color: "#fac858" },
              },
            ]}
          />
        </div>
      </div>

      {/* Tercera fila - Gráficos adicionales */}
      <div className="row g-1">
        <div className="col-sm-4">
          <BarChart
            data={mockData.rendimientoComercialData}
            title="Rendimiento Comercial"
            subTitle=""
            description=""
            height={320}
            series={[
              {
                name: "Ventas",
                type: "bar",
                showLabels: true,
                itemStyle: { color: "#5470c6" },
              },
            ]}
          />
        </div>
        <div className="col-sm-4">
          <PieChart
            data={mockData.campanasData}
            title="ROI por Campaña"
            subTitle=""
            description=""
            valueField="value"
            nameField="name"
            height="300"
          />
        </div>
        <div className="col-sm-4">
          <FunnelChart
            data={[
              { value: 100, name: 'Prospectos' },
              { value: 70, name: 'Contactados' },
              { value: 45, name: 'Propuesta' },
              { value: 30, name: 'Negociación' },
              { value: 20, name: 'Cerrados' }
            ]}
            title="Pipeline de Ventas"
            subTitle=""
            description=""
            height={320}
            width="80%"
            gap={2}
            series={[
              { itemStyle: { color: '#83bff6' } },
              { itemStyle: { color: '#73a5e0' } },
              { itemStyle: { color: '#638bc9' } },
              { itemStyle: { color: '#5372b3' } },
              { itemStyle: { color: '#42589c' } }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
