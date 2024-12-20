const HeaderComponent = ({
    isDraggable,
    toggleDraggable,
    selectedComponent,
    setSelectedComponent,
    addComponent,
  }) => (
    <div className="d-flex justify-content-between mb-3">
      <h1>Transacciones</h1>
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
  
      <div className="d-flex align-items-center">
        <select
          className="form-select mx-2"
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          <option value="pieChart">Pie Chart</option>
          <option value="lineChart">Line Chart</option>
          <option value="totalsCard">Totals Card</option>
          <option value="transactionTable">Transaction Table</option>
        </select>
        <button className="btn btn-primary" onClick={addComponent}>
          + Agregar Componente
        </button>
      </div>
    </div>
  );
  
  export default HeaderComponent;
  