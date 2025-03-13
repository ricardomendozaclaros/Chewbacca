import { useState, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import DataTable from "react-data-table-component";
import { useParseValue } from '../../hooks/useParseValue';

/**
 * @typedef {Object} ColumnConfig
 * @property {string} header - Column header text to display
 * @property {string} field - Field name in data object to display
 */

/**
 * @typedef {Object} TotalColumnConfig
 * @property {string} field - Field name to total
 * @property {boolean} [fixedDecimals=false] - Whether to fix to 2 decimals
 */

/**
 * @typedef {Object} ShowTotalConfig
 * @property {boolean} show - Whether to show totals
 * @property {Array<TotalColumnConfig>} columns - Array of columns to total
 */

export default function TransactionTable({ 
  data, 
  title, 
  subTitle, 
  description, 
  columns,
  groupByOptions,
  showTotal = { show: false, columns: [] },
  height,
  pagination = false, // New prop for pagination
  rowsPerPage = 15,    // Default rows per page
  onRowClick // nueva prop
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { parseValue } = useParseValue();
  const [paginatedData, setPaginatedData] = useState([]);
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);
  
  const tableColumns = useMemo(() => {
    if (!columns || columns.length === 0) {
      // ... existing fallback logic ...
    }

    return columns.map(column => {
      const [header, field, config = {}] = column;
      return {
        name: header,
        selector: (row) => row[field],
        sortable: true,
        resizable: true,
        width: config.width,
        right: config.align === 'right',
        cell: row => {
          const displayValue = parseValue(field, row[field], config.format);
          
          // Si es la columna ID y tenemos onRowClick, renderizar como enlace
          if (field === 'id' && onRowClick) {
            return (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onRowClick(row);
                }}
                className="text-primary text-decoration-underline"
                style={{ cursor: 'pointer' }}
              >
                {displayValue}
              </a>
            );
          }

          return (
            <div 
              title={displayValue} 
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: config.align || 'left',
                height: config.verticalAlign ? '100%' : 'auto',
                display: config.verticalAlign ? 'flex' : 'block',
                alignItems: config.verticalAlign ? 'center' : 'initial',
              }}
            >
              {displayValue}
            </div>
          );
        },
        conditionalCellStyles: [{
          when: row => row.isGrouped && row.groupLevel % 2 === 0,
          style: {
            backgroundColor: '#c6c6c6',
          },
        }, {
          when: row => row.isGrouped && row.groupLevel % 2 === 1,
          style: {
            backgroundColor: '#ffffff',
          },
        }]
      };
    });
  }, [columns, parseValue, onRowClick]);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Just add uniqueId to each row and preserve duplicates
    return data.map(item => ({
      ...item,
      uniqueId: uuidv4()
    }));
  }, [data]);

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

  // Update total calculation for multiple columns
  const totals = useMemo(() => {
    if (!showTotal.show || !showTotal.columns?.length) return null;
    
    return showTotal.columns.reduce((acc, columnConfig) => {
      const total = filteredData.reduce((sum, row) => {
        const value = Number(row[columnConfig.field]) || 0;
        return sum + value;
      }, 0);

      acc[columnConfig.field] = columnConfig.fixedDecimals 
        ? total.toFixed(2)
        : total.toString();

      return acc;
    }, {});
  }, [filteredData, showTotal]);

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Add pagination settings
  const paginationOptions = useMemo(() => {
    if (!pagination) return {};
    
    return {
      paginationPerPage: rowsPerPage,
      paginationRowsPerPageOptions: [15, 30, 50, 100],
      pagination: true,
      paginationServer: false,
      paginationTotalRows: filteredData.length,
      onChangePage: page => setCurrentPage(page),
    };
  }, [pagination, rowsPerPage, filteredData.length]);

  // Add pagination controls component
  const PaginationControls = () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPageState);
    const startIndex = (currentPage - 1) * rowsPerPageState;
    const endIndex = startIndex + rowsPerPageState;
    
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginRight: '20px'
      }}>
        <select 
          value={rowsPerPageState}
          onChange={(e) => {
            setRowsPerPageState(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="form-select"
          style={{ width: 'auto' }}
        >
          {[15, 30, 50, 100].map(size => (
            <option key={size} value={size}>{size} por página</option>
          ))}
        </select>
        <div className="btn-group">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {'<<'}
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {'<'}
          </button>
          <span className="btn btn-outline-secondary btn-sm" style={{ pointerEvents: 'none' }}>
            {`${startIndex + 1}-${Math.min(endIndex, filteredData.length)} de ${filteredData.length}`}
          </span>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            {'>'}
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {'>>'}
          </button>
        </div>
      </div>
    );
  };

  // Update filtered and paginated data
  useEffect(() => {
    if (pagination) {
      const start = (currentPage - 1) * rowsPerPageState;
      const end = start + rowsPerPageState;
      setPaginatedData(filteredData.slice(start, end));
    } else {
      setPaginatedData(filteredData);
    }
  }, [filteredData, currentPage, rowsPerPageState, pagination]);

  // Update totalRow calculation for multiple columns
  const finalData = useMemo(() => {
    if (!showTotal.show || !showTotal.columns?.length || !totals) {
      return pagination ? paginatedData : filteredData;
    }

    const totalRow = {
      uniqueId: 'total-row',
      // Set empty values for all columns initially
      ...Object.fromEntries(
        columns.map(([, field]) => [field, ''])
      ),
      // Set 'Total' text in first column
      [columns[0][1]]: 'Total',
      // Set totals for specified columns
      ...totals
    };

    return [...(pagination ? paginatedData : filteredData), totalRow];
  }, [pagination, paginatedData, filteredData, showTotal, totals, columns]);

  return (
    <div className="card">
      <div className="px-1">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ''}</span>
        </h5>
        {/* Search and Pagination Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: pagination ? 'space-between' : 'flex-end',
          alignItems: 'center',
          marginBottom: '10px',
        }}>
          {pagination && <PaginationControls />}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '5px 30px 5px 10px',
                width: '200px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            />
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
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div style={{ 
          height: height ? `${height}px` : 'auto',
          overflow: 'hidden', // Eliminar el scroll del contenedor
        }}>
          <DataTable
            columns={tableColumns}
            data={finalData}
            keyField="uniqueId"
            fixedHeader={!!height}
            fixedHeaderScrollHeight={`${height}px`}
            highlightOnHover
            striped
            responsive
            dense
            pagination={false} // Disable default pagination
            customStyles={{
              rows: {
                style: {
                  '&:last-of-type': showTotal.show ? {
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa',
                    borderTop: '2px solid #dee2e6'
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
              },
              pagination: {
                style: {
                  marginTop: '10px',
                  borderTop: '1px solid #ddd',
                  paddingTop: '10px'
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