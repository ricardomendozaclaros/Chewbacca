import { useState, useEffect, useRef } from "react";
import GridLayout from "react-grid-layout";
import LineChart from "../components/Dashboard/LineChart";
import PieChart from "../components/Dashboard/PieChart";
import TotalsCardComponent from "../components/Dashboard/TotalsCardComponent";
import TransactionTable from "../components/Dashboard/TransactionTable";
import { GetSignatureProcesses } from "../api/signatureProcess";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Page2 = () => {
  const [layout, setLayout] = useState([]);
  const [isDraggable, setIsDraggable] = useState(true);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const gridRef = useRef(null);
  const [data, setData] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("pieChart");
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const result = await GetSignatureProcesses();
      setData(result);
    };
    loadData();
  }, []);

  useEffect(() => {
    const resizeGrid = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth);
      }
    };

    const observer = new ResizeObserver(resizeGrid);
    observer.observe(document.getElementById("grid-container"));

    window.addEventListener("resize", resizeGrid);
    resizeGrid();

    return () => {
      window.removeEventListener("resize", resizeGrid);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const savedLayout = localStorage.getItem("grid-layout");
    if (savedLayout) {
      setLayout(JSON.parse(savedLayout));
    } else {
      setLayout([
        { i: "transactionTable", x: 0, y: 0, w: 4, h: 6 },
        { i: "pieChart", x: 4, y: 0, w: 4, h: 3 },
        { i: "totalsCard", x: 8, y: 0, w: 4, h: 2 },
        { i: "lineChart", x: 0, y: 6, w: 12, h: 4 },
      ]);
    }
  }, []);

  const saveLayout = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem("grid-layout", JSON.stringify(newLayout));
  };

  const addComponent = () => {
    const newItem = {
      i: `${selectedComponent}-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: 4,
      h: 3,
    };
    const newLayout = [...layout, newItem];
    saveLayout(newLayout);
  };

  const removeComponent = (id) => {
    const newLayout = layout.filter((item) => item.i !== id);
    setLayout(newLayout);
    localStorage.setItem("grid-layout", JSON.stringify(newLayout));
    setContextMenu(null);
  };

  const toggleDraggable = () => setIsDraggable((prev) => !prev);

  const handleRightClick = (e, id) => {
    e.preventDefault();
    if (isDraggable) {
      const { left, top } = gridRef.current.getBoundingClientRect(); // Posición relativa del grid
      setContextMenu({ 
        x: e.clientX - left, 
        y: e.clientY - top, 
        id 
      });
    }
  };

  const handleCloseMenu = () => setContextMenu(null);

  return (
    <div
      onClick={handleCloseMenu} // Cerrar menú si haces clic fuera
      style={{ position: "relative", height: "100%" }}
    >
      {/* Encabezado */}
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

      {/* GridLayout */}
      <div id="grid-container" ref={gridRef} style={{ width: "100%" }}>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={100}
          width={gridWidth}
          onLayoutChange={(newLayout) => saveLayout(newLayout)}
          isDraggable={isDraggable}
          isResizable={isDraggable}
        >
          {layout.map((item) => (
            <div
              key={item.i}
              style={{
                background: "#f5f5f5",
                border: "1px solid #ddd",
                position: "relative",
              }}
              onContextMenu={(e) => handleRightClick(e, item.i)}
            >
              {item.i.includes("transactionTable") && (
                <TransactionTable title="Transacciones" data={data} />
              )}
              {item.i.includes("pieChart") && <PieChart />}
              {item.i.includes("totalsCard") && (
                <TotalsCardComponent title="Resumen" />
              )}
              {item.i.includes("lineChart") && <LineChart />}
            </div>
          ))}
        </GridLayout>
      </div>

      {/* Menú Contextual */}
      {contextMenu && isDraggable && (
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
          onClick={(e) => e.stopPropagation()} // Evitar que el clic cierre el menú
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold">Opciones</span>
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#888",
                fontSize: "16px",
              }}
              onClick={handleCloseMenu}
            >
              ✕
            </button>
          </div>
          <hr />
          <button
            className="btn btn-danger btn-sm w-100"
            onClick={() => removeComponent(contextMenu.id)}
          >
            Eliminar Componente
          </button>
        </div>
      )}
    </div>
  );
};

export default Page2;
