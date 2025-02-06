import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import DataTable from "react-data-table-component";
import { useParseValue } from '../../hooks/useParseValue';

/**
 * @typedef {Object} ColumnConfig
 * @property {string} header - Column header text to display
 * @property {string} field - Field name in data object to display
 */

export default function TransactionTable({ 
  data, 
  title, 
  subTitle, 
  description, 
  columns,
  groupByOptions,
  showTotal = false, // New parameter
  height
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { parseValue } = useParseValue();
  
  const tableColumns = useMemo(() => {
    // If columns empty, generate from data structure
    if (!columns || columns.length === 0) {
      if (!data || data.length === 0) return [];
      
      const firstRow = data[0];
      return Object.keys(firstRow).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize
        selector: (row) => row[key],
        sortable: true,
        resizable: true, // Enable column resizing
        cell: row => {
          const displayValue = parseValue(key, row[key]);
          return (
            <div 
              title={displayValue} 
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
              }}
            >
              {displayValue}
            </div>
          );
        },
      }));
    }

    // Original logic for provided columns
    return columns.map(([header, field]) => ({
      name: header,
      selector: (row) => row[field],
      sortable: true,
      resizable: true, // Enable column resizing
      cell: row => {
        const displayValue = parseValue(field, row[field]);
        return (
          <div 
            title={displayValue} 
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
            }}
          >
            {displayValue}
          </div>
        );
      },
    }));
  }, [columns, data]);

  const processedData = useMemo(() => {
    if (!groupByOptions || groupByOptions.length === 0) {
      return data.map(row => ({ ...row, uniqueId: uuidv4() }));
    }

    const groupField = groupByOptions.find(opt => opt.operation === 'group')?.field;
    if (!groupField) return data.map(row => ({ ...row, uniqueId: uuidv4() }));

    // Group data first
    const groups = {};
    data.forEach(item => {
      const groupValue = item[groupField];
      if (!groups[groupValue]) groups[groupValue] = [];
      groups[groupValue].push(item);
    });

    // Process each group with specified operations
    return Object.entries(groups).flatMap(([groupName, items]) => {
      const aggregatedValues = {};
      
      // Process each field's operation
      columns.forEach(([_, field]) => {
        const operation = groupByOptions.find(opt => opt.field === field)?.operation || 'sum';
        
        switch(operation) {
          case 'sum':
            aggregatedValues[field] = items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
            break;
          case 'multiply':
            aggregatedValues[field] = items.reduce((prod, item) => prod * (Number(item[field]) || 1), 1);
            break;
          case 'count':
            aggregatedValues[field] = items.length;
            break;
          case 'group':
            aggregatedValues[field] = groupName;
            break;
        }
      });

      return [{
        ...aggregatedValues,
        uniqueId: uuidv4(),
        isGroupHeader: true,
        items: items
      }];
    });
  }, [data, groupByOptions, columns]);

  // Filter data based on search term, considering translated values
  const filteredData = useMemo(() => {
    if (!searchTerm) return processedData;

    return processedData.filter(row => {
      return Object.entries(row).some(([field, value]) => {
        // Apply parseValue to get the translated or formatted value
        const displayValue = parseValue(field, value);
        // Compare the display value with the search term
        return String(displayValue).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [processedData, searchTerm, parseValue]);

  // Calculate total of last column with fixed logic
  const total = useMemo(() => {
    if (!showTotal || !columns || columns.length === 0) return 0;
    
    const lastColumn = columns[columns.length - 1][1]; // Get field name of last column
    // Calculate from filteredData instead of raw data
    return filteredData.reduce((sum, row) => {
      const value = Number(row[lastColumn]) || 0;
      return sum + value;
    }, 0).toFixed(2);
  }, [filteredData, columns, showTotal]);

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="card">
      <div className="px-1">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ''}  </span>
        </h5>
        {/* Search Input */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', // Alinea el contenido a la derecha
          marginBottom: '10px', // Espacio inferior para separar de la tabla
          position: 'relative', // Para posicionar el botón de limpieza
        }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '5px 30px 5px 10px', // Espacio para el botón de limpieza
              margin: "5px 0 5px 0",
              width: '200px',
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          {/* Botón de limpieza */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                fontSize: '16px',
              }}
            >
              ×
            </button>
          )}
        </div>
        <div style={{ 
          height: height ? `${height}px` : 'auto',
          overflow: 'hidden', // Eliminar el scroll del contenedor
        }}>
          <DataTable
            columns={tableColumns}
            data={showTotal && columns.length >= 2 ? 
              [...filteredData, {
                uniqueId: 'total-row',
                [columns[columns.length - 2][1]]: 'Total',
                [columns[columns.length - 1][1]]: total,
              }] : 
              filteredData
            }
            keyField="uniqueId"
            fixedHeader={!!height}
            fixedHeaderScrollHeight={`${height}px`}
            highlightOnHover
            striped
            responsive
            dense
            customStyles={{
              rows: {
                style: {
                  '&:last-of-type': showTotal ? {
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa'
                  } : {}
                }
              },
              headCells: {
                style: {
                  paddingLeft: '8px',
                  paddingRight: '8px',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  fontWeight: 'bold',
                }
              },
              cells: {
                style: {
                  paddingLeft: '8px',
                  paddingRight: '8px'
                }
              }
            }}
          />
        </div>
        <p className="card-text">{description}</p>
      </div>
    </div>
  );
}