import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Importa uuid
import DataTable from "react-data-table-component";

export default function TransactionTable({ data, title }) {
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    {
      name: "",
      selector: (row) => row.uniqueId, // ID único generado
      sortable: true,
      width: "70px",
    },
    {
      name: "Tipo Firma",
      selector: (row) => row.description,
      sortable: true,
      width: "200px",
    },
    {
      name: "Unitario",
      selector: (row) => row.unitValue,
      sortable: true,
      width: "100px",
    },
    {
      name: "Transaccion",
      selector: (row) => `$${row.totalValue.toFixed(2)}`,
      sortable: true,
      width: "115px",
    },
  ];

  // Generar IDs únicos en los datos
  const dataWithUniqueIds = data.map((row) => ({
    ...row,
    uniqueId: uuidv4(), // Genera un ID único
  }));

  return (
    <>
      <div className="card" style={{ width: "100%", height: "100%" }}>

        <div className="card-body">
          <h5 className="card-title">
            {title}
          </h5>

            <DataTable
              columns={columns}
              data={dataWithUniqueIds}
              keyField="uniqueId" // Configura el campo como clave única
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10]}
              paginationDefaultPage={currentPage}
              onChangePage={(page) => setCurrentPage(page)}
              highlightOnHover
              striped
            />
        </div>
      </div>
    </>
  );
}
