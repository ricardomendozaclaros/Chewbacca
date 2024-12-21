import { useState, useEffect } from "react";

const LineModal = ({ data, onDataProcessed }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState("role");  // Campo para el eje Y (agrupado)
  const [xAxisField, setXAxisField] = useState("date");  // Campo para el eje X (categoría)
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      setFields(Object.keys(data[0]));  // Extraer campos de la BD
    }
  }, [data]);

  const processData = () => {
    if (!selectedField || !xAxisField) return;

    let groupedData = {};
    let xaxis = [];
    let seriesMap = {};

    // Agrupar por fecha y campo seleccionado (ejemplo: role)
    data.forEach((item) => {
      const xValue = item[xAxisField].split("T")[0];  // Formatear fecha
      const yValue = item[selectedField];  // Ejemplo: 'admin', 'user'

      // Inicializar estructura
      if (!groupedData[xValue]) {
        groupedData[xValue] = {};
      }
      if (!groupedData[xValue][yValue]) {
        groupedData[xValue][yValue] = 0;
      }

      // Contar ocurrencias (se puede modificar para sumar valores si es necesario)
      groupedData[xValue][yValue] += 1;
    });

    // Obtener categorías únicas (fechas) y preparar series
    xaxis = Object.keys(groupedData).sort();  // Fechas ordenadas
    xaxis.forEach((date) => {
      Object.keys(groupedData[date]).forEach((role) => {
        if (!seriesMap[role]) {
          seriesMap[role] = [];
        }
      });
    });

    // Llenar con ceros los valores faltantes
    Object.entries(seriesMap).forEach(([role, _]) => {
      seriesMap[role] = xaxis.map((date) => groupedData[date][role] || 0);
    });

    // Formatear datos para ApexCharts
    const formattedSeries = Object.entries(seriesMap).map(([role, values]) => ({
      name: role,
      data: values,
    }));

    // Previsualización de datos
    setPreviewData(formattedSeries);

    console.log("Datos procesados:", {
      series: formattedSeries,
      categories: xaxis,
    });

    // Enviar datos al componente padre
    onDataProcessed({ series: formattedSeries, categories: xaxis });
  };

  return (
    <div>
      <h5 className="mb-3">Parámetros</h5>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Lista de parámetros */}
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

        {/* Botón para procesar */}
        <div style={{ width: "30%" }}>
          <button
            className="btn btn-primary w-100 mb-2"
            onClick={processData}
          >
            Procesar Datos
          </button>
        </div>

        {/* Previsualización de los datos */}
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
