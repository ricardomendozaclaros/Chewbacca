// src/pages/Page2.js
import { useState, useEffect, useRef } from "react";
import HeaderComponent from "../components/Header";
import GridContainer from "../components/GridLayoutWrapper";
import ContextMenuComponent from "../components/ContextMenu";
import DateColumnFilter from "../components/Filters/DateColumnFilter";
import { GetSignatureProcesses } from "../api/signatureProcess";
import { loadConfig, saveConfig } from "../utils/configHandler";
import { processLineChartData, processPieChartData } from "../utils/chartProcessor";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const Page2 = () => {
  const [layout, setLayout] = useState([]);
  const [isDraggable, setIsDraggable] = useState(true);
  const [gridWidth, setGridWidth] = useState(window.innerWidth);
  const gridRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [allData, setAllData] = useState([]); // Almacena todos los datos del año

  // Cargar datos iniciales (un año completo)
  useEffect(() => {
    const loadData = async () => {
      if (isInitialLoad) {
        // En la carga inicial, obtener el año completo
        const result = await GetSignatureProcesses();
        setAllData(result);
        setData(result);
        setFilteredData(result);
        setIsInitialLoad(false);
      }
    };
    loadData();
  }, [isInitialLoad]);

  // Ajustar el ancho del grid
  useEffect(() => {
    const handleResize = () => setGridWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar configuración inicial
  useEffect(() => {
    const fetchConfig = async () => {
      const savedLayout = await loadConfig("Page2");
      if (savedLayout) {
        const initializedLayout = savedLayout.map(item => ({
          ...item,
          data: processChartData(
            item.type,
            data,
            item.xAxisField,
            item.selectedField,
            item.processType
          )
        }));
        setLayout(initializedLayout);
      }
    };
    fetchConfig();
  }, [data]);

  // Efecto para manejar cambios en el rango de fechas
  useEffect(() => {
    if (!isInitialLoad && dateRange[0] && dateRange[1]) {
      const [startDate, endDate] = dateRange;
      // Filtrar los datos existentes según el rango de fechas
      const filtered = allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
      setData(filtered);
      setFilteredData(filtered);
    }
  }, [dateRange, allData, isInitialLoad]);

  // Aplicar otros filtros (columna, texto, etc.)
  useEffect(() => {
    let filtered = [...data];

    if (selectedColumn && selectedValues.length > 0) {
      filtered = filtered.filter(item =>
        selectedValues.some(selected => selected.value === item[selectedColumn.value])
      );
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item => {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredData(filtered);

    // Actualizar gráficos
    const newLayout = layout.map((item) => ({
      ...item,
      data: processChartData(
        item.type,
        filtered,
        item.xAxisField,
        item.selectedField,
        item.processType
      )
    }));

    setLayout(newLayout);
  }, [selectedValues, searchText, data]);

  const processChartData = (chartType, sourceData, xAxisField, selectedField, processType) => {
    if (!sourceData || sourceData.length === 0) {
      return chartType === "lineChart" ? { categories: [], series: [] } : [];
    }

    return chartType === "lineChart"
      ? processLineChartData(sourceData, xAxisField, selectedField, processType)
      : processPieChartData(sourceData, selectedField, processType);
  };

  const addComponent = (chartType, processedData, title, subTitle, description, processType, selectedField, xAxisField) => {
    const newItem = {
      i: `${chartType}-${Date.now()}`,
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      type: chartType,
      data: processedData,
      title,
      subTitle,
      description,
      processType,
      selectedField,
      xAxisField,
    };
    saveLayout([...layout, newItem]);
  };

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
        data={filteredData}
      />

      <DateColumnFilter
        data={data}
        dateRange={dateRange}
        onDateRangeChange={(dates) => {
          setDateRange(dates);
        }}
        selectedColumn={selectedColumn}
        onColumnChange={setSelectedColumn}
        selectedValues={selectedValues}
        onValueChange={setSelectedValues}
        searchText={searchText}
        onSearchChange={setSearchText}
        filteredCount={filteredData.length}
        totalCount={data.length}
      />

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