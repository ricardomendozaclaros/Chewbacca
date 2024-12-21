import { useState, useEffect } from "react";
import { processLineChartData } from "../../utils/chartProcessor";  // Importar la función

const LineModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("role");  // Y-axis
  const [xAxisField, setXAxisField] = useState("date");  // X-axis
  const [processType, setProcessType] = useState("count");  // Tipo de proceso
  const [previewData, setPreviewData] = useState([]);  // Estado para mostrar la previsualización

  useEffect(() => {
    if (data.length > 0) {
      setFields(Object.keys(data[0]));
    }
  }, [data]);

  const processData = (selectedOption) => {
    setProcessType(selectedOption);  // Actualizar el tipo de proceso seleccionado

    // Usar la función del chartProcessor para procesar la data
    const processedData = processLineChartData(
      data,
      xAxisField,
      selectedField,
      selectedOption
    );

    // Asegurar que series tenga datos antes de actualizar la previsualización
    setPreviewData(processedData.series || []);

    console.log("Datos procesados:", {
      series: processedData.series,
      categories: processedData.categories,
    });

    // Enviar data, campos y proceso al padre
    onDataProcessed(processedData, selectedOption, selectedField, xAxisField);
  };

  return (
    <div>
      <h5 className="mb-3">Parámetros</h5>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "30%" }}>
          <strong>Parámetro Y (Agrupado):</strong>
          {fields.map((field) => (
            <div key={field} className="form-check">
              <input
                type="radio"
                id={field}
                name="yField"
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
          <strong className="mt-3">Parámetro X (Categoría/Eje X):</strong>
          <select
            className="form-select mt-2"
            value={xAxisField}
            onChange={(e) => setXAxisField(e.target.value)}
          >
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: "30%" }}>
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={() => processData("count")}
          >
            Contar
          </button>
          <button
            className="btn btn-secondary w-100 mb-2"
            onClick={() => processData("sum")}
          >
            Sumar
          </button>
          <button
            className="btn btn-info w-100"
            onClick={() => processData("percentage")}
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
            overflowY: "auto",
            maxHeight: "250px",
          }}
        >
          <h6 className="text-center mb-2">Previsualización</h6>
          {previewData.length > 0 ? (
            <ul className="list-unstyled">
              {previewData.map((serie, index) => (
                <li key={index}>
                  <strong>{serie.name}:</strong> {serie.data.join(", ")}
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

export default LineModal;
