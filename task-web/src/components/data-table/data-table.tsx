import { useEffect, useRef, useState } from 'react';
import {
  type ColumnDef,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pagination } from './pagination';
import { ViewOptions } from './view-options';
import { FacetedFilter, type FacetedFilterConfig } from './faceted-filter';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  pageIndex: number;
  pageSize: number;
  pageCount: number;

  search: string;
  onSearchChange: (value: string) => void;

  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  facetedFilters?: Array<FacetedFilterConfig>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;

  isLoading?: boolean;
  searchPlaceholder?: string;
  showViewOptions?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  pageIndex,
  pageSize,
  pageCount,
  search,
  onSearchChange,
  onPageIndexChange,
  onPageSizeChange,
  facetedFilters = [],
  columnFilters = [],
  onColumnFiltersChange,
  searchPlaceholder = 'Search...',
  showViewOptions = true,
}: Readonly<DataTableProps<TData, TValue>>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    label: false,
  });

  const [inputValue, setInputValue] = useState<string>(search);
  const debouncedInput = useDebouncedValue(inputValue);
  const isFirstRender = useRef(true);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      pagination: { pageIndex, pageSize },
      columnFilters,
    },
    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater;

      onColumnFiltersChange?.(next);
    },
    manualPagination: true,
    pageCount,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;

      onPageIndexChange(next.pageIndex);
      onPageSizeChange(next.pageSize);
    },
  });

  const renderedFacets = facetedFilters
    .map((f) => {
      const col = table.getColumn(f.columnId);
      if (!col) return null;
      return (
        <FacetedFilter
          key={f.columnId}
          column={col}
          title={f.title}
          options={f.options}
        />
      );
    })
    .filter(Boolean);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (debouncedInput === search) {
      return;
    }
    onSearchChange(debouncedInput);
  }, [debouncedInput, onSearchChange, search]);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  return (
    <div className="rounded-md border">
      <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4 px-2 py-4">
        <Input
          placeholder={searchPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex flex-col sm:flex-row gap-2">{renderedFacets}</div>
        {showViewOptions && (
          <div className="ml-auto">
            <ViewOptions table={table} columnVisibility={columnVisibility} />
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-30 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        pageSize={pageSize}
        pageIndex={pageIndex}
        pageCount={pageCount}
        onPageIndexChange={onPageIndexChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
