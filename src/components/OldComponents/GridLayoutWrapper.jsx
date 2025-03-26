import GridLayout from "react-grid-layout";
import DynamicComponent from "./DynamicComponentRenderer";

const GridLayoutWrapper = ({
  layout,
  gridWidth,
  saveLayout,
  isDraggable,
  handleRightClick
}) => (
<GridLayout
  className="layout"
  layout={layout}
  cols={24}  // Aumentamos el número de columnas
  rowHeight={30}  // Reducimos la altura de cada fila para más flexibilidad
  width={gridWidth}
  onLayoutChange={(newLayout) => {
    const updatedLayout = newLayout.map((newItem) => {
      const existingItem = layout.find((item) => item.i === newItem.i);
      return { ...existingItem, ...newItem };
    });

    saveLayout(updatedLayout);
  }}
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
      <DynamicComponent item={item} />
    </div>
  ))}
</GridLayout>



);

export default GridLayoutWrapper;
