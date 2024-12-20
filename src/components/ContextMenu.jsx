const ContextMenuComponent = ({ contextMenu, handleCloseMenu, removeComponent }) => (
    <div
      style={{
        position: "absolute",
        top: contextMenu.y,
        left: contextMenu.x,
        background: "white",
        border: "1px solid #ccc",
        padding: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        zIndex: 1000,
        borderRadius: "5px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold">Opciones</span>
        <button
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#888", fontSize: "16px" }}
          onClick={handleCloseMenu}
        >
          ✕
        </button>
      </div>
      <hr />
      <button className="btn btn-danger btn-sm w-100" onClick={() => removeComponent(contextMenu.id)}>
        Eliminar Componente
      </button>
    </div>
  );
  
  export default ContextMenuComponent;
  