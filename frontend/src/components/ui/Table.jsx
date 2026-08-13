import React from 'react';

const Table = ({ columns, data, isLoading, emptyMessage = 'No data available' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E5E0D8] bg-white shadow-sm">
      <table className="w-full text-left text-xs font-semibold text-[#1A1918]">
        <thead className="bg-[#F7F5F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E5E0D8] select-none">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-3.5 py-3 sm:px-6 sm:py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F7F5F0] text-[#64748B]">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[#64748B] font-medium">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#1B2A4A] border-t-transparent animate-spin" />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-[#F7F5F0]/50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-3.5 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-[#64748B] font-medium italic">
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
