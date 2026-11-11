import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

const Table = ({ 
  columns, 
  data = [], 
  isLoading = false, 
  emptyMessage = 'No records available',
  pageSize = null // e.g. 15, 25, 50, or null to disable client-side pagination
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data?.length || 0;
  const isPaginated = pageSize && totalItems > pageSize;
  const totalPages = isPaginated ? Math.ceil(totalItems / pageSize) : 1;

  // Safe page index clamp
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const displayData = useMemo(() => {
    if (!isPaginated) return data;
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize, isPaginated]);

  const startRecord = isPaginated ? (safePage - 1) * pageSize + 1 : 1;
  const endRecord = isPaginated ? Math.min(safePage * pageSize, totalItems) : totalItems;

  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-800">
          <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 select-none">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {isLoading ? (
              // Polished Shimmer Skeleton Rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-4 sm:px-6">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData && displayData.length > 0 ? (
              displayData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 sm:px-6 sm:py-3.5 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Bar */}
      {isPaginated && (
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-semibold">{startRecord}</strong> to{' '}
            <strong className="text-slate-900 font-semibold">{endRecord}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{totalItems}</strong> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-slate-700">
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
