import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import Select from "react-select";
import ExportButton from "../../../components/BtnExportar.jsx";
import { ImageOff, Search } from "lucide-react";

import TransactionTable from "../../../components/Dashboard/TransactionTable.jsx";
import TotalsCardComponent from "../../../components/Dashboard/TotalsCardComponent.jsx";

export default function Pag400() {
  const [isLoading, setIsLoading] = useState(true);

  // Estados para filtros
  const [dateRange, setDateRange] = useState([null, null]);
  const [enterprises, setEnterprises] = useState([]);
  const [selectedEnterprises, setSelectedEnterprises] = useState([]);

  const daysAgo = 14; // Número de días para el rango de fechas

  return (
    <div className="">
      {/* Filtros */}
      <div className="card p-2">
        <div className="row">
          <div className="col-sm-6 d-flex align-items-center">
            <h4 className="font-weight-bold mx-2">Pag400</h4>
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

      <div className="">
        <div className="p-1">
          {/* Fila 1 */}
          <div className="row g-1 mb-3">
            <div className="col-sm-3">
              <TotalsCardComponent
                data={200}
                trend={{ value: 200, text: "Registros" }}
                title="Facturas de recargas prepago"
                subTitle="Del DD/MM/AAAA al DD/MM/AAAA"
                description=""
                icon="bi bi-graph-up"
                iconBgColor="red"
                unknown={false}
              />
            </div>
          </div>

          {/* Fila 2 */}
          <div className="row g-1 mb-3">
            <div className="col-sm-4">
              <TransactionTable
                data={[
                  {
                    id: 1,
                    nombre: "Ejemplo 1",
                    valor: 100,
                  },
                  {
                    id: 2,
                    nombre: "Ejemplo 2",
                    valor: 200,
                  },
                  {
                    id: 3,
                    nombre: "Ejemplo 3",
                    valor: 300,
                  },
                ]}
                title="Relacion de gastos por tipo de cuenta"
                subTitle=""
                description=""
                columns={[
                  ["Nombre", "nombre"],
                  ["Valor", "valor"],
                ]}
                showTotal={{
                  show: true,
                  columns: [{ field: "valor", fixedDecimals: true }],
                }}
                height={200}
                pagination={false}
                rowsPerPage={10}
                groupByOptions={[
                  { label: "Nombre", value: "nombre" },
                  { label: "Fecha", value: "fecha" },
                ]}
              />
              <TransactionTable
                data={[
                  {
                    id: 1,
                    nombre: "Ejemplo 1",
                    valor: 100,
                  },
                  {
                    id: 2,
                    nombre: "Ejemplo 2",
                    valor: 200,
                  },
                  {
                    id: 3,
                    nombre: "Ejemplo 3",
                    valor: 300,
                  },
                ]}
                title="Ventas post pago"
                subTitle=""
                description=""
                columns={[
                  ["Nombre", "nombre"],
                  ["Valor", "valor"],
                ]}
                showTotal={{
                  show: true,
                  columns: [{ field: "valor", fixedDecimals: true }],
                }}
                height={200}
                pagination={false}
                rowsPerPage={10}
                groupByOptions={[
                  { label: "Nombre", value: "nombre" },
                  { label: "Fecha", value: "fecha" },
                ]}
              />
            </div>
            <div className="col-sm-4">
              <TransactionTable
                data={[
                  {
                    id: 1,
                    nombre: "Ejemplo 1",
                    valor: 100,
                  },
                  {
                    id: 2,
                    nombre: "Ejemplo 2",
                    valor: 200,
                  },
                  {
                    id: 3,
                    nombre: "Ejemplo 3",
                    valor: 300,
                  },
                ]}
                title="Consumo de clientes post pago SASS"
                subTitle=""
                description=""
                columns={[
                  ["Nombre", "nombre"],
                  ["Valor", "valor"],
                ]}
                showTotal={{
                  show: true,
                  columns: [{ field: "valor", fixedDecimals: true }],
                }}
                height={200}
                pagination={false}
                rowsPerPage={10}
                groupByOptions={[
                  { label: "Nombre", value: "nombre" },
                  { label: "Fecha", value: "fecha" },
                ]}
              />
              <TransactionTable
                data={[
                  {
                    id: 1,
                    nombre: "Ejemplo 1",
                    valor: 100,
                  },
                  {
                    id: 2,
                    nombre: "Ejemplo 2",
                    valor: 200,
                  },
                  {
                    id: 3,
                    nombre: "Ejemplo 3",
                    valor: 300,
                  },
                ]}
                title="Cobros"
                subTitle=""
                description=""
                columns={[
                  ["Nombre", "nombre"],
                  ["Valor", "valor"],
                ]}
                showTotal={{
                  show: true,
                  columns: [{ field: "valor", fixedDecimals: true }],
                }}
                height={200}
                pagination={false}
                rowsPerPage={10}
                groupByOptions={[
                  { label: "Nombre", value: "nombre" },
                  { label: "Fecha", value: "fecha" },
                ]}
              />
            </div>
            <div className="col-sm-4">
              <TransactionTable
                data={[
                  {
                    id: 1,
                    nombre: "Ejemplo 1",
                    valor: 100,
                  },
                  {
                    id: 2,
                    nombre: "Ejemplo 2",
                    valor: 200,
                  },
                  {
                    id: 3,
                    nombre: "Ejemplo 3",
                    valor: 300,
                  },
                ]}
                title="Consumo clientes post pago de API firma"
                subTitle=""
                description=""
                columns={[
                  ["Nombre", "nombre"],
                  ["Valor", "valor"],
                ]}
                showTotal={{
                  show: true,
                  columns: [{ field: "valor", fixedDecimals: true }],
                }}
                height={200}
                pagination={false}
                rowsPerPage={10}
                groupByOptions={[
                  { label: "Nombre", value: "nombre" },
                  { label: "Fecha", value: "fecha" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
