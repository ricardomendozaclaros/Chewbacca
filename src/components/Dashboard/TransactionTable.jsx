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
  const { parseValue } = useParseValue();
  
  const tableColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    return columns.map(([header, field]) => ({
      name: header,
      selector: (row) => row[field],
      sortable: true,
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
  }, [columns]);

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

  // Calculate total of last column with fixed logic
  const total = useMemo(() => {
    if (!showTotal || !columns || columns.length === 0) return 0;
    
    const lastColumn = columns[columns.length - 1][1]; // Get field name of last column
    // Calculate from processedData instead of raw data
    return processedData.reduce((sum, row) => {
      const value = Number(row[lastColumn]) || 0;
      return sum + value;
    }, 0).toFixed(2);
  }, [processedData, columns, showTotal]);

  return (
    <div className="card">
      <div className="px-1">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ''}  </span>
        </h5>
        <div style={{ 
          height: height ? `${height}px` : 'auto',
          overflowY: height ? 'auto' : 'visible'
        }}>
          <DataTable
            columns={tableColumns}
            data={[...processedData, {
              uniqueId: 'total-row',
              [columns[columns.length - 2][1]]: 'Total',
              [columns[columns.length - 1][1]]: total,
            }]}
            keyField="uniqueId"
            fixedHeader={!!height}
            fixedHeaderScrollHeight={`${height}px`}
            highlightOnHover
            striped
            // Add responsive prop for better column handling
            responsive
            // Add dense prop for more compact rows
            dense
            customStyles={{
              rows: {
                style: {
                  '&:last-of-type': {
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa'
                  }
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
