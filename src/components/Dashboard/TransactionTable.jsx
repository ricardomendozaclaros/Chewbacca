import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import DataTable from "react-data-table-component";

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

  // Keep columns generation unchanged
  const tableColumns = useMemo(() => {
    if (!columns || columns.length === 0) return [];
    return columns.map(([header, field]) => ({
      name: header,
      selector: (row) => row[field],
      sortable: true,
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
      <div className="px-2 pb-2">
        <h5 className="card-title">
          {title} <span>{subTitle ? `| ${subTitle}` : ''}  </span>
        </h5>
        <h6 className="card-subtitle text-muted">{subTitle}</h6>
        <p className="card-text">{description}</p>

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
            customStyles={{
              rows: {
                style: {
                  '&:last-of-type': {
                    fontWeight: 'bold',
                    backgroundColor: '#f8f9fa'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
