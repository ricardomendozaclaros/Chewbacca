import { useState, useEffect } from "react";

const PieModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]); // Lista de parámetros
  const [selectedField, setSelectedField] = useState(""); // Parámetro seleccionado
  const [previewData, setPreviewData] = useState([]); // Datos procesados para previsualización

  useEffect(() => {
    // Extraer los campos (parámetros) de la data
    if (data.length > 0) {
      setFields(Object.keys(data[0]));
      setSelectedField(Object.keys(data[0])[0]); // Selecciona el primer campo por defecto
    }
  }, [data]);

  const handleOptionClick = (option) => {
    if (!selectedField) return;

    let processedData = [];
    const fieldMap = {};

    // Procesar la data según el campo seleccionado
    data.forEach((item) => {
      const key = item[selectedField];
      fieldMap[key] =
        (fieldMap[key] || 0) + (option === "sum" ? item.unitValue || 0 : 1);
    });

    // Generar el resultado
    if (option === "percentage") {
      const total = Object.values(fieldMap).reduce((acc, val) => acc + val, 0);
      processedData = Object.entries(fieldMap).map(([name, value]) => ({
        name,
        value: ((value / total) * 100).toFixed(2) + " %", // Agrega el símbolo de porcentaje
      }));
    } else {
      processedData = Object.entries(fieldMap).map(([name, value]) => ({
        name,
        value,
      }));
    }

    // Actualiza la previsualización
    setPreviewData(processedData);

    // Devolver los datos procesados al componente padre
    onDataProcessed(processedData);
  };

  return (
    <div>
      <h5 className="mb-3">Parámetros</h5>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Lista de parámetros */}
        <div style={{ width: "30%" }}>
          {fields.map((field) => (
            <div key={field} className="form-check">
              <input
                type="radio"
                id={field}
                name="parameter"
                value={field}
                checked={selectedField === field}
                onChange={(e) => setSelectedField(e.target.value)}
                className="form-check-input"
              />
              <label htmlFor={field} className="form-check-label">
                {field}
              </label>
            </div>
          ))}
        </div>

        {/* Botones de opciones */}
        <div style={{ width: "30%" }}>
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={() => handleOptionClick("count")}
          >
            Contar
          </button>
          <button
            className="btn btn-secondary w-100 mb-2"
            onClick={() => handleOptionClick("sum")}
          >
            Sumar
          </button>
          <button
            className="btn btn-info w-100"
            onClick={() => handleOptionClick("percentage")}
          >
            Porcentaje
          </button>
        </div>

        {/* Previsualización de los datos */}
        <div
          style={{
            width: "40%",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            maxHeight: "300px", // Altura máxima del contenedor
            overflowY: "auto", // Agrega scroll vertical cuando el contenido exceda la altura
          }}
        >
          <h6 className="text-center mb-2">Previsualización</h6>
          {previewData.length > 0 ? (
            <ul className="list-unstyled">
              {previewData.map((item, index) => (
                <li key={index}>
                  <strong>{item.name}:</strong> {item.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No hay datos procesados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PieModal;
