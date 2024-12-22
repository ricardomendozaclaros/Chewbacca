import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid"; // Importa uuid
import DataTable from "react-data-table-component";

export default function TransactionTable({ data, title, subTitle, description }) {

  console.log("aui, ", data)
  const [currentPage, setCurrentPage] = useState(1);

  // Generar columnas dinámicamente basadas en los campos de la data
  const columns = useMemo(() => {
    if (data.length === 0) return [];

    // Obtener los campos desde el primer objeto de la data
    const keys = Object.keys(data[0]);

    return keys.map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Capitaliza el nombre
      selector: (row) => row[key],
      sortable: true,
    }));
  }, [data]);

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
            {title} <span> | {subTitle} </span>
          </h5>
          <h6 className="card-subtitle mb-2 text-muted">
            {subTitle}
          </h6>
          <p className="card-text">
            {description}
          </p>

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
