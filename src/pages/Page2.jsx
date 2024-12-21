import { useState, useEffect, useRef } from "react";
import HeaderComponent from "../components/Header";
import GridContainer from "../components/GridLayoutWrapper";
import ContextMenuComponent from "../components/ContextMenu";
import data from "../utils/exampledata";  // Data base completa sin filtrar
import { loadConfig, saveConfig } from "../utils/configHandler";
import {
  processLineChartData,
  processPieChartData
} from "../utils/chartProcessor";  // Importar funciones de procesamiento

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Page2 = () => {
  const [layout, setLayout] = useState([]);
  const [isDraggable, setIsDraggable] = useState(true);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const gridRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [filter, setFilter] = useState({ start: "", end: "" });  // Filtro de fechas

  // Cargar configuración al iniciar la página (layout inicial)
  useEffect(() => {
    const fetchConfig = async () => {
      const savedLayout = await loadConfig("Page2");
      setLayout(savedLayout);
    };
    fetchConfig();
  }, []);

  const saveLayout = async (newLayout) => {
    const updatedLayout = newLayout.map((item) => ({
      ...item,
      data: item.data || [],
      title: item.title || "Título no definido",
      subTitle: item.subTitle || "",
      description: item.description || "",
      processType: item.processType || "sum",
      selectedField: item.selectedField || "role",
      xAxisField: item.xAxisField || "date",
    }));

    setLayout(updatedLayout);
    await saveConfig("Page2", updatedLayout);
    console.log("Configuración guardada en el backend.");
  };

  // Agregar un nuevo gráfico al layout
  const addComponent = (chartType, data, title, subTitle, description, processType, selectedField, xAxisField) => {
    const newItem = {
      i: `${chartType}-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: 4,
      h: 3,
      type: chartType,
      data,
      title,
      subTitle,
      description,
      processType,
      selectedField,
      xAxisField,
    };
    saveLayout([...layout, newItem]);
  };

  // Filtrar data y aplicar proceso a cada gráfico
  const applyFilter = () => {
    if (filter.start && filter.end) {
      // 1. Filtrar la data base (exampledata.js) por el rango de fechas
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(filter.start) && itemDate <= new Date(filter.end);
      });


      // 2. Re-procesar cada gráfico del layout con la data filtrada
      const newLayout = layout.map((item) => {
        const processed = processChartData(
          item.type,
          filtered,
          item.xAxisField,
          item.selectedField,
          item.processType
        );

        return {
          ...item,
          data: processed,  // Actualizar solo la data procesada
        };
      });

      setLayout(newLayout);  // Actualizar layout con data procesada
    }
  };

  // Procesar data según el tipo de gráfico usando chartProcessor.js
  const processChartData = (chartType, data, xAxisField, selectedField, processType) => {
    if (data.length === 0) {
      // Si no hay datos filtrados, devolver estructura vacía
      return chartType === "lineChart"
        ? { categories: [], series: [] }
        : [];
    }

    // Aplicar el procesamiento adecuado dependiendo del tipo de gráfico
    if (chartType === "lineChart") {
      return processLineChartData(data, xAxisField, selectedField, processType);
    } else if (chartType === "pieChart") {
      return processPieChartData(data, selectedField, processType);
    }

    return { series: [], categories: [] };  // Retorno por defecto para evitar errores
  };

  const removeComponent = (id) => {
    saveLayout(layout.filter((item) => item.i !== id));
    setContextMenu(null);
  };

  const handleRightClick = (e, id) => {
    e.preventDefault();
    const { left, top } = gridRef.current.getBoundingClientRect();
    setContextMenu({ x: e.clientX - left, y: e.clientY - top, id });
  };

  return (
    <div onClick={() => setContextMenu(null)} style={{ position: "relative", height: "100%" }}>
      <HeaderComponent
        isDraggable={isDraggable}
        toggleDraggable={() => setIsDraggable((prev) => !prev)}
        addComponent={addComponent}
        data={data}
      />

      {/* Filtro de fechas */}
      <div className="d-flex mb-3">
        <input
          type="date"
          className="form-control me-2"
          value={filter.start}
          onChange={(e) => setFilter({ ...filter, start: e.target.value })}
        />
        <input
          type="date"
          className="form-control me-2"
          value={filter.end}
          onChange={(e) => setFilter({ ...filter, end: e.target.value })}
        />
        <button className="btn btn-primary" onClick={applyFilter}>
          Filtrar
        </button>
      </div>

      <div id="grid-container" ref={gridRef} style={{ width: "100%" }}>
        <GridContainer
          layout={layout}
          gridWidth={gridWidth}
          saveLayout={saveLayout}
          isDraggable={isDraggable}
          handleRightClick={handleRightClick}
        />
      </div>

      {contextMenu && (
        <ContextMenuComponent
          contextMenu={contextMenu}
          handleCloseMenu={() => setContextMenu(null)}
          removeComponent={removeComponent}
        />
      )}
    </div>
  );
};

export default Page2;
