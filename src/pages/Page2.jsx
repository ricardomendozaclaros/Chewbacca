import { useState, useEffect, useRef } from "react";
import HeaderComponent from "../components/Header";
import GridContainer from "../components/GridLayoutWrapper";
import ContextMenuComponent from "../components/ContextMenu";
import data from "../utils/exampledata";
import { loadConfig, saveConfig } from "../utils/configHandler"; // Importar funciones del configHandler

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Page2 = () => {
  const [layout, setLayout] = useState([]); // Estado del layout
  const [isDraggable, setIsDraggable] = useState(true); // Control del drag-and-drop
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const gridRef = useRef(null); // Referencia para el contenedor del grid
  const [contextMenu, setContextMenu] = useState(null);

  // Cargar configuración al iniciar la página
  useEffect(() => {
    const fetchConfig = async () => {
      const savedLayout = await loadConfig("Page2"); // Cargar desde el backend
      setLayout(savedLayout);
    };
    fetchConfig();
  }, []);

  // Guardar configuración en el backend
  const saveLayout = async (newLayout) => {
    const updatedLayout = newLayout.map((item) => ({
      ...item,
      data: item.data || [],
      title: item.title || "Título no definido",
      subTitle: item.subTitle || "",
      description: item.description || "",
    }));

    setLayout(updatedLayout);
    await saveConfig("Page2", updatedLayout); // Guardar en el backend
    console.log("Configuración guardada en el backend.");
  };

  // Función para agregar un componente
  const addComponent = (chartType, data, title, subTitle, description) => {
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
    };
    saveLayout([...layout, newItem]);
  };

  // Función para eliminar un componente
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
      {/* Header */}
      <HeaderComponent
        isDraggable={isDraggable}
        toggleDraggable={() => setIsDraggable((prev) => !prev)}
        addComponent={addComponent}
        data={data}
      />

      {/* Grid Container */}
      <div id="grid-container" ref={gridRef} style={{ width: "100%" }}>
        <GridContainer
          layout={layout}
          gridWidth={gridWidth}
          saveLayout={saveLayout}
          isDraggable={isDraggable}
          handleRightClick={handleRightClick}
        />
      </div>

      {/* Context Menu */}
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
