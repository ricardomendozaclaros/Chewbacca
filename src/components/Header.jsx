import React, { useState } from "react";
import ChartConfigModal from "./ChartConfigModal";

const HeaderComponent = ({ isDraggable, toggleDraggable, addComponent, data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la apertura del modal

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleConfirm = (selectedChartType, data, title, subTitle, descripción) => {
    addComponent(selectedChartType, data, title, subTitle, descripción);
    setIsModalOpen(false);
  };

  return (
    <div className="d-flex justify-content-between mb-3">
      <h1>Transacciones</h1>

      {/* Modo Vista/Editor */}
      <div className="form-switch d-flex align-items-center">
        <input
          className="form-check-input mx-2"
          type="checkbox"
          checked={isDraggable}
          onChange={toggleDraggable}
        />
        <label className="form-check-label fw-bold">
          {isDraggable ? "Edición" : "Vista"}
        </label>
      </div>

      {/* Botón para abrir el modal */}
      <button className="btn btn-primary" onClick={openModal}>
        + Agregar Componente
      </button>

      {/* Modal para seleccionar el gráfico */}
      {isModalOpen && <ChartConfigModal onClose={closeModal} onConfirm={handleConfirm} data={data} />}
    </div>
  );
};

export default HeaderComponent;
