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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
import { useDropzone } from "react-dropzone";

import { useCallback, useState } from "react";
import api from "@/services/api";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "Name",
    header: () => <div className="text-left">Name</div>,
    enableHiding: true,
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
            {`${
              lead.first_name[0].toUpperCase() + lead.last_name[0].toUpperCase()
            }`}
          </div>
          <div className=" flex flex-col">
            <div className="text-left font-medium">
              {lead.first_name + " " + lead.last_name}
            </div>
            <div className="text-sm text-slate-600">{lead.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone_number",
    header: () => <div className="text-left">Phone Number</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {row.getValue("phone_number")}
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
    accessorKey: "visit_history",
    header: () => <div className="text-left">Total Visits</div>,
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="text-left font-medium">{lead._count.VisitHistory}</div>
      );
    },
  },
  {
    accessorKey: "current_city",
    header: () => <div className="text-left">City</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">{row.getValue("address")}</div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="text-center">Type</div>,
    cell: ({ row }) => {
      const typeValue = row.getValue("type");
      let colorClass = "";

      // Assigning color classes based on the value
      switch (typeValue) {
        case "null":
          colorClass = "bg-gray-400"; // Gray for null
          break;
        case "lost":
          colorClass = "bg-yellow-600"; // Red for lost
          break;
        case "hot":
          colorClass = "bg-red-600"; // Orange for hot
          break;
        case "warm":
          colorClass = "bg-orange-600"; // Yellow for warm
          break;
        case "cold":
          colorClass = "bg-blue-600"; // Blue for cold
          break;
        default:
          colorClass = "bg-gray-200"; // Default color
      }

      return (
        <div
          className={` font-medium ${colorClass} text-white px-2 py-1 rounded-full text-center`}
        >
          {row.getValue("type") || "Unknown"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Created At</div>,
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("createdAt"));
      const formattedDate = createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      return <div className="text-left font-medium">{formattedDate}</div>;
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const lead = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <Link href={`leads/${lead.id}`}>
              <DropdownMenuItem>View Lead</DropdownMenuItem>
            </Link>
            {/* <Link href={`students/edit/${lead.id}`}>
              <DropdownMenuItem>Edit Lead</DropdownMenuItem>
            </Link> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CounsellorStudentsTable({ data }: { data: Lead[] }) {
  const [searchField, setSearchField] = useState("phone_number");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      name: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row.id,
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

  const handleValueChange = (newValue: any) => {
    setSearchField(newValue);
    table.getColumn(searchField)?.setFilterValue(""); // Clear previous filter when changing the field
    setSearchQuery(""); // Also clear the search input
  };
  return (
    <div className="w-full">
      <div className="flex items-center py-2.5">
        <Input
          placeholder={`Filter by ${searchField.replace("_", " ")}...`}
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            table.getColumn(searchField)?.setFilterValue(event.target.value);
          }}
          className="flex-grow"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Search By
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuRadioGroup
              value={searchField}
              onValueChange={handleValueChange}
            >
              <DropdownMenuRadioItem value="phone_number">
                Phone Number
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="email">
                Email Address
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mb-2.5">Total Leads: {data.length}</div>
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
