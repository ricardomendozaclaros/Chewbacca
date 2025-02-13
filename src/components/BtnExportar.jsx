import * as XLSX from 'xlsx';
import { useCallback } from 'react';

const ExportButton = ({ data, fileName = "reporte.xlsx", sheets = [] }) => {
  // Función para exportar a Excel
  const exportToExcel = useCallback(() => {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Agregar cada hoja al libro de trabajo
    sheets.forEach((sheet) => {
      const { name, data: sheetData } = sheet;
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    // Escribir el archivo y descargarlo
    XLSX.writeFile(workbook, fileName);
  }, [sheets, fileName]);

  return (
    <button
      type="button"
      className="btn btn-secondary mt-4 d-flex align-items-center"
      data-toggle="tooltip"
      data-placement="top"
      title="Exportar"
      onClick={exportToExcel}
    >
      <i className="bi bi-file-earmark-excel"></i>
    </button>
  );
};

export default ExportButton;