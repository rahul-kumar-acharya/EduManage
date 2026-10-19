import React from 'react';

const Table = ({ columns, data, isLoading, emptyMessage = 'No data available' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-left text-xs sm:text-sm text-slate-800">
        <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3 sm:px-6 sm:py-3.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-600">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 font-medium">
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span className="text-xs">Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 font-medium italic text-xs">
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
