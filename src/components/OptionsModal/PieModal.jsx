import { useState, useEffect } from "react";
import { processPieChartData } from "../../utils/chartProcessor";  // Importar la función de procesamiento

const PieModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [processType, setProcessType] = useState("count");
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setFields(Object.keys(data[0]));
      setSelectedField(Object.keys(data[0])[0]);  // Seleccionar el primer campo por defecto
    }
  }, [data]);

  const handleOptionClick = (option) => {
    setProcessType(option);  // Guardar el tipo de proceso seleccionado

    // Usar la función del chartProcessor para procesar la data
    const processedData = processPieChartData(data, selectedField, option);

    // Actualizar la previsualización con la data procesada
    setPreviewData(processedData);  // Cambiado: No es processedData.series, es el array directamente

    console.log("Datos procesados (Pie):", processedData);

    // Enviar data, proceso y campo al padre
    onDataProcessed(processedData, option, selectedField);
  };

  return (
    <div>
      <h5 className="mb-3">Parámetros</h5>
      <div style={{ display: "flex", gap: "20px" }}>
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

        <div
          style={{
            width: "40%",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            maxHeight: "300px",
            overflowY: "auto",
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
