import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SearchResultProps, SearchParamsProps } from '../../requests/base/search.request';
import { StandardSelect } from '../inputs/StandardSelect';

export interface ResponsiveDataColumn<T> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface ResponsiveDataProps<T> {
  searchResult: SearchResultProps<T>;
  onChangeSearchParams: (params: Partial<SearchParamsProps>) => void;
  desktop: {
    columns: ResponsiveDataColumn<T>[];
  };
  mobile: {
    renderCard: (item: T) => React.ReactNode;
  };
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ResponsiveData<T>({
  searchResult,
  onChangeSearchParams,
  desktop,
  mobile,
  loading = false,
  emptyState,
  className,
}: ResponsiveDataProps<T>) {
  const { items, total, currentPage, perPage, lastPage, sort, sortDir } = searchResult;

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    const isCurrent = sort === columnId;
    const newDir = isCurrent && sortDir === 'asc' ? 'desc' : 'asc';
    onChangeSearchParams({
      sort: columnId,
      sortDir: newDir,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage || newPage === currentPage) return;
    onChangeSearchParams({ page: newPage });
  };

  const startEntry = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endEntry = Math.min(currentPage * perPage, total);

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-sm text-slate-500">Loading data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 text-center">
          {emptyState ?? (
            <>
              <p className="text-base font-medium text-slate-700">No records found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  {desktop.columns.map((col) => {
                    const isSorted = sort === col.id;
                    return (
                      <th
                        key={col.id}
                        scope="col"
                        className={cn(
                          'px-4 py-3 select-none',
                          col.sortable && 'cursor-pointer hover:bg-slate-100 transition-colors',
                          col.className,
                        )}
                        onClick={() => handleSort(col.id, col.sortable)}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable && (
                            <span className="text-slate-400">
                              {isSorted ? (
                                sortDir === 'asc' ? (
                                  <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                                )
                              ) : (
                                <ChevronsUpDown className="h-3.5 w-3.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                    {desktop.columns.map((col) => (
                      <td key={col.id} className={cn('px-4 py-3 text-slate-700', col.className)}>
                        {col.render
                          ? col.render(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey] ?? '')
                            : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="flex md:hidden flex-col gap-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs"
              >
                {mobile.renderCard(item)}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-700">{startEntry}</strong> to{' '}
                <strong className="text-slate-700">{endEntry}</strong> of{' '}
                <strong className="text-slate-700">{total}</strong> entries
              </span>
              <div className="w-24 ml-2">
                <StandardSelect
                  value={String(perPage)}
                  options={[
                    { value: '10', label: '10 / page' },
                    { value: '15', label: '15 / page' },
                    { value: '25', label: '25 / page' },
                    { value: '50', label: '50 / page' },
                  ]}
                  onChange={(val) => onChangeSearchParams({ perPage: Number(val), page: 1 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium px-3 text-slate-700">
                Page {currentPage} of {lastPage || 1}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

