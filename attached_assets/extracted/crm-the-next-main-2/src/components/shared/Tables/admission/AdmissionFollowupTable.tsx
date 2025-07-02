"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead } from "@/types/api-types";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "Name",
    header: () => <div className="text-left">Name</div>,
    enableHiding: true,
    cell: ({ row }) => {
      const followUp = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
            {`${
              followUp.lead.first_name[0].toUpperCase() +
              followUp.lead.last_name[0].toUpperCase()
            }`}
          </div>
          <div className=" flex flex-col">
            <div className="text-left font-medium">
              {followUp.lead.first_name + " " + followUp.lead.last_name}
            </div>
            <div className="text-sm text-slate-600">{followUp.lead.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone_number",

    header: () => <div className="text-left">Phone Number</div>,
    cell: ({ row }) => {
      const followUp = row.original;

      return (
        <div className="text-left font-medium">
          {followUp.lead.phone_number}
        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: () => <div className="text-left">Email Address</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.getValue("email")}</div>
      );
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-left">Followup Date</div>,
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("date"));
      const formattedDate = createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return <div className="text-left font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      const typeValue = row.original.lead.type;
      let colorClass = "";

      // Assigning color classes based on the value
      switch (typeValue) {
        case "null":
          colorClass = "bg-gray-400 text-gray-800"; // Gray for null
          break;
        case "lost":
          colorClass = "bg-yellow-600 text-white"; // Red for lost
          break;
          // case "hota":
          colorClass = "bg-red-600 text-white"; // Orange for hot
          break;
        case "warm":
          colorClass = "bg-orange-600 text-white"; // Yellow for warm
          break;
        case "cold":
          colorClass = "bg-blue-600 text-white"; // Blue for cold
          break;
        default:
          colorClass = "bg-gray-200 text-gray-800"; // Default color
      }

      return (
        <div
          className={` font-medium  px-2 py-1 rounded-full text-center  ${colorClass}`}
        >
          {typeValue || "Unknown"}
        </div>
      );
    },
  },

  {
    id: "id",
    accessorKey: "id",
    header: () => <div className="text-left">Actions</div>,
    enableHiding: false,

    cell: ({ row }) => {
      const followUp = row.original;

      return (
        <Link
          className="border rounded-full px-10 py-2.5 bg-green-600 text-white"
          href={`/admission/leads/${followUp.lead.id}`}
        >
          Open
        </Link>
      );
    },
  },
];

export default function AdmissionFollowupTable({ data }: { data: Lead[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter number..."
          value={
            (table.getColumn("phone_number")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("phone_number")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
