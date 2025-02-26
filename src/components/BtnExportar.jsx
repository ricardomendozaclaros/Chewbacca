import * as XLSX from 'xlsx';
import { useCallback } from 'react';

const ExportButton = ({ 
  data, 
  fileName = "reporte.xlsx", 
  sheets = [],
  startDate,
  endDate 
}) => {
  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para exportar a Excel
  const exportToExcel = useCallback(() => {
    // Crear un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Agregar cada hoja al libro de trabajo
    sheets.forEach((sheet) => {
      const { name, data: sheetData } = sheet;
      
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(sheetData, { origin: 'A2' });
      
      // Add date range in A1
      const dateRange = `Del ${formatDate(startDate)} - ${formatDate(endDate)}`;
      XLSX.utils.sheet_add_aoa(worksheet, [[dateRange]], { origin: 'A1' });
      
      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    // Escribir el archivo y descargarlo
    XLSX.writeFile(workbook, fileName);
  }, [sheets, fileName, startDate, endDate]);

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