import React from 'react';

interface DataTableProps {
    data: Array<Record<string, any>>;
    columns: Array<{ header: string; accessor: string }>;
    onRowClick?: (row: Record<string, any>) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, onRowClick }) => {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.accessor}>{column.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)}>
                        {columns.map((column) => (
                            <td key={column.accessor}>{row[column.accessor]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;