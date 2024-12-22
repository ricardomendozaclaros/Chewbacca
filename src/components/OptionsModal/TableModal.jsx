import React, { useState, useEffect } from "react";

const TableModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      const availableFields = Object.keys(data[0]);
      setFields(availableFields);
      setSelectedFields([]);  // Ninguna columna seleccionada por defecto
    }
  }, [data]);

  // Toggle para seleccionar/deseleccionar campos
  const handleFieldToggle = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  // Filtrar data según los campos seleccionados
  const getFilteredData = () => {
    return data.map((row) => {
      let filteredRow = {};
      selectedFields.forEach((field) => {
        filteredRow[field] = row[field];
      });
      return filteredRow;
    });
  };

  // Enviar data filtrada y campos al padre (ChartConfigModal)
  useEffect(() => {
    const filteredData = getFilteredData();
    onDataProcessed(filteredData, "selectColumns", selectedFields, null);
  }, [selectedFields]);  // Se ejecuta cuando cambia la selección

  return (
    <div>
      <h5 className="mb-3">Seleccionar Columnas</h5>
      <div className="row">
        {fields.map((field) => (
          <div key={field} className="col-md-6">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={field}
                checked={selectedFields.includes(field)}
                onChange={() => handleFieldToggle(field)}
              />
              <label className="form-check-label" htmlFor={field}>
                {field}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableModal;
