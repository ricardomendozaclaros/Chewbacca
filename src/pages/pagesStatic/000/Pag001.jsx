import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import ExportButton from "../../../components/BtnExportar.jsx";
import { ImageOff, Search } from "lucide-react";
import BarChart from "../../../components/Dashboard/BarChart";
import ScatterChart from "../../../components/Dashboard/ScatterChart";
import GaugeChart from "../../../components/Dashboard/GaugeChart";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent";

export default function Pag001() {
  const [isLoading, setIsLoading] = useState(false);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  // Datos simulados
  const mockData = {
    // Estado de Resultados
    estadoResultados: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      series: {
        'Ingresos': [100000, 120000, 115000, 130000, 125000],
        'Costos': [70000, 80000, 75000, 85000, 80000],
        'Utilidades': [30000, 40000, 40000, 45000, 45000]
      }
    },

    // Flujo de Caja
    flujoCaja: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      series: {
        'Ingresos': [95000, 110000, 105000, 120000, 115000],
        'Egresos': [85000, 90000, 88000, 95000, 92000],
        'Neto': [10000, 20000, 17000, 25000, 23000]
      }
    },

    // CAC vs LTV
    cacLtv: {
      'CAC vs LTV': [
        [100, 500], [150, 700], [200, 900],
        [120, 600], [180, 800], [160, 750]
      ]
    },

    // Eficiencia Soporte
    soporteTecnico: {
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
      series: {
        'Tiempo Respuesta': [4, 3.5, 3, 2.8, 2.5],
        'Tiempo Resolución': [24, 20, 18, 16, 15]
      }
    },

    // Proyectos Estratégicos
    proyectos: {
      categories: ['Proyecto A', 'Proyecto B', 'Proyecto C', 'Proyecto D'],
      series: {
        'Avance': [75, 45, 90, 30]
      }
    }
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Pag001</h4>
          </div>

          {/* Filtro de tipos de firmas */}

          <div className="col-sm-6 d-flex align-items-center justify-content-end">
            <div className="mx-2 w-50" style={{ zIndex: 1000 }}>
              <label className="block text-sm font-medium mb-2">Empresas</label>
              <Select
                isMulti
                options={{}}
                value={{}}
                onChange={{}}
                placeholder="Empresas..."
                closeMenuOnSelect={false}
                isDisabled={isLoading}
                styles={{}}
              />
            </div>
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
                  onClick={{}}
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
            data={98}
            title="Cumplimiento Normativo"
            subTitle="Este mes"
            description="Porcentaje de cumplimiento de normativas"
            icon="bi bi-shield-check"
            format="percentage"
            trend={{ value: '+3%', text: 'vs mes anterior' }}
          />
        </div>
        <div className="col-sm-4">
          <TotalsCardComponent
            data={2.5}
            title="Tiempo de Respuesta"
            subTitle="Promedio"
            description="Horas promedio de respuesta en soporte"
            icon="bi bi-clock"
            trend={{ value: '-30%', text: 'vs mes anterior' }}
          />
        </div>
        <div className="col-sm-4">
          <GaugeChart
            data={85}
            title="NPS"
            subTitle="Satisfacción del Cliente"
            description="Net Promoter Score"
            height={150}
            gaugeConfig={{
              min: 0,
              max: 100,
              ranges: [
                { min: 0, max: 50, color: '#FF6E76' },
                { min: 50, max: 75, color: '#FDDD60' },
                { min: 75, max: 100, color: '#7CFFB2' }
              ]
            }}
          />
        </div>
      </div>

      {/* Segunda fila - Estado de Resultados y Flujo de Caja */}
      <div className="row g-1 mb-3">
        <div className="col-sm-6">
          <BarChart
            data={mockData.estadoResultados}
            title="Estado de Resultados"
            subTitle="Mensual"
            height={300}
            series={[
              {
                name: 'Ingresos',
                type: 'line',
                areaStyle: {},
                itemStyle: { color: '#91cc75' }
              },
              {
                name: 'Costos',
                type: 'line',
                areaStyle: {},
                itemStyle: { color: '#ee6666' }
              },
              {
                name: 'Utilidades',
                type: 'line',
                areaStyle: {},
                itemStyle: { color: '#5470c6' }
              }
            ]}
          />
        </div>
        <div className="col-sm-6">
          <BarChart
            data={mockData.flujoCaja}
            title="Flujo de Caja"
            subTitle="Mensual"
            height={300}
            series={[
              {
                name: 'Ingresos',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#91cc75' }
              },
              {
                name: 'Egresos',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#ee6666' }
              },
              {
                name: 'Neto',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#5470c6' }
              }
            ]}
          />
        </div>
      </div>

      {/* Tercera fila - CAC vs LTV y Soporte Técnico */}
      <div className="row g-1 mb-3">
        <div className="col-sm-6">
          <ScatterChart
            data={mockData.cacLtv}
            title="Costo de Adquisición de Clientes"
            subTitle="CAC vs LTV"
            height={300}
            series={[
              {
                name: 'CAC vs LTV',
                symbolSize: 15,
                itemStyle: { color: '#5470c6' }
              }
            ]}
            xAxis={{
              name: 'CAC ($)',
              nameLocation: 'middle',
              nameGap: 30
            }}
            yAxis={{
              name: 'LTV ($)',
              nameLocation: 'middle',
              nameGap: 30
            }}
          />
        </div>
        <div className="col-sm-6">
          <BarChart
            data={mockData.soporteTecnico}
            title="Eficiencia del Soporte"
            subTitle="Tiempos de respuesta"
            height={300}
            series={[
              {
                name: 'Tiempo Respuesta',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#5470c6' }
              },
              {
                name: 'Tiempo Resolución',
                type: 'line',
                showLabels: true,
                itemStyle: { color: '#91cc75' }
              }
            ]}
          />
        </div>
      </div>

      {/* Cuarta fila - Proyectos Estratégicos */}
      <div className="row g-1">
        <div className="col-sm-12">
          <BarChart
            data={mockData.proyectos}
            title="Avance de Proyectos Estratégicos"
            subTitle="Estado actual"
            height={300}
            series={[
              {
                name: 'Avance',
                type: 'bar',
                showLabels: true,
                itemStyle: {
                  color: '#5470c6',
                  borderRadius: [4, 4, 0, 0]
                }
              }
            ]}
            yAxis={{
              max: 100,
              axisLabel: {
                formatter: '{value}%'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
