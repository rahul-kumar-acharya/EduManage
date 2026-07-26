import React from 'react';

const Table = ({ columns, data, emptyMessage = 'No data available' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E5E0D8] bg-white shadow-sm">
      <table className="w-full text-left text-xs font-semibold text-[#1A1918]">
        <thead className="bg-[#F7F5F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5E0D8] select-none">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#F7F5F0]/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-[#64748B] font-medium italic">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
