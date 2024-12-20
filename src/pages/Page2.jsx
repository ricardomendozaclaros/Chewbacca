import { useState, useEffect, useRef } from "react";
import HeaderComponent from "../components/Header";
import GridContainer from "../components/GridLayoutWrapper";
import ContextMenuComponent from "../components/ContextMenu";
import data from "../utils/exampledata"

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Page2 = () => {
  const [layout, setLayout] = useState([]);
  const [isDraggable, setIsDraggable] = useState(true);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const gridRef = useRef(null);
  const [selectedComponent, setSelectedComponent] = useState("pieChart");
  const [contextMenu, setContextMenu] = useState(null);

  // Adjust grid width dynamically
  useEffect(() => {
    const resizeGrid = () => gridRef.current && setGridWidth(gridRef.current.offsetWidth);

    const observer = new ResizeObserver(resizeGrid);
    if (gridRef.current) observer.observe(gridRef.current);

    window.addEventListener("resize", resizeGrid);
    resizeGrid();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeGrid);
    };
  }, []);

  // Load saved layout
  useEffect(() => {
    const savedLayout = localStorage.getItem("grid-layout");
    setLayout(savedLayout ? JSON.parse(savedLayout) : []);
  }, []);

  const saveLayout = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem("grid-layout", JSON.stringify(newLayout));
  };

  const addComponent = () => {
    const newItem = { i: `${selectedComponent}-${Date.now()}`, x: 0, y: Infinity, w: 4, h: 3 };
    saveLayout([...layout, newItem]);
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
        selectedComponent={selectedComponent}
        setSelectedComponent={setSelectedComponent}
        addComponent={addComponent}
      />

      <div id="grid-container" ref={gridRef} style={{ width: "100%" }}>
        <GridContainer
          layout={layout}
          gridWidth={gridWidth}
          saveLayout={saveLayout}
          isDraggable={isDraggable}
          handleRightClick={handleRightClick}
          data={data}
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
