import React, { useState, useMemo } from 'react';

interface DataTableProps {
  columns: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
  // Aggiungiamo una funzione opzionale per estrarre i valori su cui ordinare
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, renderRow }) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Gestore del click sulla colonna
  const handleSort = (columnName: string) => {
    // Rendiamo ordinabili solo "Asset" (o Nome) e "Totale"
    if (columnName !== 'Asset' && columnName !== 'Totale' && columnName !== 'Nome') return;

    const isAsc = sortField === columnName && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(columnName);
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aValue, bValue;

      // Logica per estrarre i valori in base al nome colonna
      if (sortField === 'Asset' || sortField === 'Nome') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'Totale') {
        aValue = a.shares * (a.currentPrice || 0);
        bValue = b.shares * (b.currentPrice || 0);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, index) => {
              const isSortable = col === 'Asset' || col === 'Totale' || col === 'Nome';
              return (
                <th 
                  key={index} 
                  onClick={() => handleSort(col)}
                  style={{ cursor: isSortable ? 'pointer' : 'default' }}
                  className={isSortable ? 'sortable-header' : ''}
                >
                  {col}
                  {sortField === col && (sortDirection === 'asc' ? ' 🔼' : ' 🔽')}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;