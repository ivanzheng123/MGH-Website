"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { unrestrictedobject } from "common/src/unrestrictedobject.ts";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta: unrestrictedobject;
}

export type DataTableColumnDef<A extends unknown[]> = ColumnDef<A[number]>[];

export function DataTable<TData, TValue>({ columns, data, meta }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta,
  });

  return (
    <div className={"overflow-x-auto w-265 px-2"}>
      <div className="flex items-center p-4">
        <Input
          placeholder="Filter by requester..."
          value={(table.getColumn("requester")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("requester")?.setFilterValue(event.target.value)}
          className="max-w-sm panel-input"
        />
      </div>
      <div className="px-3">
        <div>
          <Table>
            <TableHeader
              className={"!bg-hospital-darkerblue/35 dark:bg-hospital-darkerblue/55 backdrop-blur-[10px] rounded-t-lg"}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={"rounded-t-2xl"}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead key={header.id} className={"first:rounded-tl-lg last:rounded-tr-lg"}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={"!border-none"}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`!border-none ${index % 2 == 0 ? "bg-hospital-blue/20 dark:bg-hospital-blue/25" : "bg-hospital-blue/10 dark:bg-hospital-blue/15"} `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-start space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={"panel-interactive !rounded-md"}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={"panel-interactive !rounded-md"}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
