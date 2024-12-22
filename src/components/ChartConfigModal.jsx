import { useState } from "react";
import PieModal from "./OptionsModal/PieModal";
import LineModal from "./OptionsModal/LineModal";
import TableModal from "./OptionsModal/TableModal";
import TotalsCardModal from "./OptionsModal/TotalsCardModal";

const ChartConfigModal = ({ onClose, onConfirm, data }) => {
  const [selectedChartType, setSelectedChartType] = useState("pieChart");
  const [processedData, setProcessedData] = useState([]);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [description, setDescription] = useState("");

  // Nuevo: Guardar el tipo de proceso y campos seleccionados
  const [processType, setProcessType] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [xAxisField, setXAxisField] = useState("");

  const handleDataProcessed = (newData, process, yField, xField) => {
    setProcessedData(newData);
    setProcessType(process); // Guardar tipo de proceso
    setSelectedField(yField); // Guardar campo Y
    setXAxisField(xField); // Guardar campo X (solo para LineChart)
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Seleccionar Tipo de Gráfico</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Selección de tipo de gráfico */}
            <label className="fw-bold mb-2">Tipo de Gráfico:</label>
            <select
              className="form-select mb-3"
              value={selectedChartType}
              onChange={(e) => setSelectedChartType(e.target.value)}
            >
              <option value="pieChart">Pie Chart</option>
              <option value="lineChart">Line Chart</option>
              <option value="totalsCard">Totals Card</option>
              <option value="transactionTable">Transaction Table</option>
            </select>

            {/* Inputs en una fila */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese un título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Subtítulo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese un subtítulo"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Textarea para descripción */}
            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Ingrese una descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Modal de configuración (Pie o Line) */}
            {selectedChartType === "pieChart" && (
              <PieModal data={data} onDataProcessed={handleDataProcessed} />
            )}

            {selectedChartType === "lineChart" && (
              <LineModal data={data} onDataProcessed={handleDataProcessed} />
            )}

            {selectedChartType === "transactionTable" && (
              <TableModal data={data} onDataProcessed={handleDataProcessed} />
            )}

            {selectedChartType === "totalsCard" && (
              <TotalsCardModal
                data={data}
                onDataProcessed={handleDataProcessed}
              />
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={() =>
                onConfirm(
                  selectedChartType,
                  processedData,
                  title,
                  subTitle,
                  description,
                  processType, // Enviar el proceso
                  selectedField, // Enviar campo Y
                  xAxisField // Enviar campo X (LineChart)
                )
              }
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartConfigModal;
