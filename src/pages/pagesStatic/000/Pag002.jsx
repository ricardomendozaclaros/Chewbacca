import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import ExportButton from "../../../components/BtnExportar.jsx";
import { ImageOff, Search } from "lucide-react";
import BarChart from "../../../components/Dashboard/BarChart";
import RadarChart from "../../../components/Dashboard/RadarChart";
import GaugeChart from "../../../components/Dashboard/GaugeChart";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent";

export default function Pag002() {
  const [isLoading, setIsLoading] = useState(false);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  const daysAgo = 14; // Número de días para el rango de fechas

  // Datos simulados
  const mockData = {
    // Empleados y Rotación
    empleados: {
      categories: ["Ene", "Feb", "Mar", "Abr", "May"],
      series: {
        "Total Empleados": [50, 52, 55, 54, 56],
        "Rotación (%)": [5, 4, 6, 3, 4],
      },
    },

    // Desarrollo de Software
    desarrollo: {
      categories: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"],
      series: {
        "Tiempo Entrega (días)": [15, 14, 13, 12],
        "Bugs Resueltos": [25, 20, 18, 15],
      },
    },

    // Innovación Radar
    innovacion: {
      Actual: [85, 90, 75, 95, 70, 88],
      Meta: [90, 95, 85, 95, 80, 90],
    },
    innovacionIndicators: [
      { name: "Nuevos Productos", max: 100 },
      { name: "MVPs", max: 100 },
      { name: "Innovación Técnica", max: 100 },
      { name: "Satisfacción Usuario", max: 100 },
      { name: "Time-to-Market", max: 100 },
      { name: "ROI Innovación", max: 100 },
    ],
  };

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Pag002</h4>
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
        <div className="col-sm-3">
          <TotalsCardComponent
            data={25}
            title="Capacitacion y desarrollo"
            subTitle="Por empleado/mes"
            description="Promedio de horas de capacitación"
            icon="bi bi-book"
            trend={{ value: "+15%", text: "vs mes anterior" }}
            iconBgColor="red"
          />
        </div>
        <div className="col-sm-3">
          <TotalsCardComponent
            data={2}
            title="Incidentes de Seguridad"
            subTitle="Este mes"
            description="Incidentes resueltos en el período"
            icon="bi bi-shield"
            trend={{ value: "-50%", text: "vs mes anterior" }}
            iconBgColor="red"
          />
        </div>
        <div className="col-sm-3">
          <GaugeChart
            data={30}
            title="Cumplimiento de Procesos"
            subTitle=""
            description="Nivel de adherencia a procesos"
            height={150}
            gaugeConfig={{
              min: 0,
              max: 100,
              ranges: [
                { min: 0, max: 60, color: "#FF6E76" },
                { min: 60, max: 85, color: "#FDDD60" },
                { min: 85, max: 100, color: "#7CFFB2" },
              ],
            }}
          />
        </div>
      </div>

      {/* Segunda fila - Empleados y Desarrollo */}
      <div className="row g-1 mb-3">
        <div className="col-sm-6">
          <BarChart
            data={mockData.empleados}
            title="Empleados y Rotación"
            subTitle="Evolución mensual"
            height={300}
            series={[
              {
                name: "Total Empleados",
                type: "line",
                showLabels: true,
                itemStyle: { color: "#5470c6" },
              },
              {
                name: "Rotación (%)",
                type: "line",
                showLabels: true,
                itemStyle: { color: "#ee6666" },
              },
            ]}
          />
        </div>
        <div className="col-sm-6">
          <BarChart
            data={mockData.desarrollo}
            title="Eficiencia del Desarrollo"
            subTitle="Por sprint"
            height={300}
            series={[
              {
                name: "Tiempo Entrega (días)",
                type: "bar",
                showLabels: true,
                itemStyle: { color: "#5470c6" },
              },
              {
                name: "Bugs Resueltos",
                type: "bar",
                showLabels: true,
                itemStyle: { color: "#91cc75" },
              },
            ]}
          />
        </div>
      </div>

      {/* Tercera fila - Radar de Innovación */}
      <div className="row g-1">
        <div className="col-sm-6">
          <RadarChart
            data={mockData.innovacion}
            title="Innovación y Desarrollo"
            subTitle="Estado actual vs Meta"
            height={400}
            indicators={mockData.innovacionIndicators}
            series={[
              {
                name: "Actual",
                itemStyle: { color: "#5470c6" },
              },
              {
                name: "Meta",
                itemStyle: { color: "#91cc75" },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
