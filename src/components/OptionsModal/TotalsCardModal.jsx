import React, { useState, useEffect } from "react";

const TotalsCardModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [operation, setOperation] = useState("count");
  const [uniqueValues, setUniqueValues] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      const availableFields = Object.keys(data[0]);
      setFields(availableFields);
      setSelectedField(availableFields[0]);  // Primer campo por defecto
    }
  }, [data]);

  // Actualizar subfields únicos al seleccionar un campo
  useEffect(() => {
    const uniqueOptions = Array.from(
      new Set(data.map((item) => item[selectedField]).filter((val) => val !== undefined))
    );
    setUniqueValues(uniqueOptions);
    setSelectedValues(uniqueOptions); // Selecciona todos por defecto
  }, [selectedField, data]);

  // Manejar selección/deselección de subfields
  const handleValueToggle = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((v) => v !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  // Procesar datos según operación seleccionada
  const handleProcess = () => {
    let processedResult = 0;

    // Filtrar data según subfields seleccionados
    const filteredData = data.filter((item) => selectedValues.includes(item[selectedField]));

    if (operation === "sum") {
      processedResult = filteredData.reduce((acc, item) => acc + (item[selectedField] || 0), 0);
    } else if (operation === "count") {
      processedResult = filteredData.length;
    }

    setResult(processedResult);

    // Enviar el campo y los subfields al chartProcessor
    onDataProcessed(processedResult, operation, { field: selectedField, subfields: selectedValues }, null);
  };

  return (
    <div>
      <h5 className="mb-3">Configurar Totalizador</h5>
      <div className="d-flex gap-3">
        <div className="w-50">
          <label>Campo a Totalizar:</label>
          <select
            className="form-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
        <div className="w-50">
          <label>Operación:</label>
          <select
            className="form-select"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
          >
            <option value="count">Conteo</option>
            <option value="sum">Suma</option>
          </select>
        </div>
      </div>

      {/* Mostrar subfields solo para conteo */}
      {operation === "count" && (
        <div className="mt-3">
          <label>Seleccionar Valores (Subfields):</label>
          <div className="row">
            {uniqueValues.map((value) => (
              <div key={value} className="col-md-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={value}
                    checked={selectedValues.includes(value)}
                    onChange={() => handleValueToggle(value)}
                  />
                  <label className="form-check-label" htmlFor={value}>
                    {value}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar resultado */}
      <div className="mt-3">
        <h6 className="text-center">Resultado: {result !== null ? result : "N/A"}</h6>
        <button className="btn btn-primary w-100 mt-3" onClick={handleProcess}>
          Procesar
        </button>
      </div>
    </div>
  );
};

export default TotalsCardModal;
