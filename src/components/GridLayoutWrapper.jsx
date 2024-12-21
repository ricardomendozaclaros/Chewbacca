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
  cols={12}
  rowHeight={100}
  width={gridWidth}
  onLayoutChange={(newLayout) => {
    // Mezclar las nuevas posiciones con los datos originales
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
