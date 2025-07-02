import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import * as Yup from "yup";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",

    header: () => <div className="text-left">Institution Name</div>,
    enableHiding: true,
    cell: ({ row }) => {
      const institution = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
            {`${institution.name[0].toUpperCase()}`}
          </div>
          <div className=" flex flex-col">
            <div className="text-left font-medium">{institution.name}</div>
            <div className="text-sm text-slate-600">{institution.email}</div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "country",
    header: () => <div className="text-left">Country</div>,
    cell: ({ row }) => {
      const institution = row.original;
      return (
        <div className="text-left font-medium">{institution.country.name}</div>
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
            <Link href={`leads/edit/${lead.id}`}>
              <DropdownMenuItem>View Lead</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Edit Lead</DropdownMenuItem>
            <DropdownMenuItem>Delete Lead</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
const handleUpload = async (file: any) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/institution-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success("Institutions uploaded successfully!");
    console.log(response.data); // Or handle as per your needs
  } catch (error) {
    toast.error("Failed to upload institutions.");
    console.error("Upload error:", error);
  }
};

export default function InstitutionTable({ data }: { data: Lead[] }) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const onDrop = React.useCallback((acceptedFiles: any) => {
    handleUpload(acceptedFiles[0]);
    setIsUploadDialogOpen(false); // Close dialog after file selection
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,

    maxFiles: 1,
  });

  const [countries, setCountries] = useState<[]>([]);

  useEffect(() => {
    fetchData();
  }, []);
  function fetchData() {
    api.get("countries").then((response: any) => {
      setCountries(response.data.data);
    });
  }
  const router = useRouter();
  const [file, setFile] = useState(null); // Initialize file state to null
  const [users, setUsers] = useState([]);
  React.useEffect(() => {
    fetchUser();
  }, []);
  const fetchUser = () => {
    api.get("user/get-all").then((response) => {
      setUsers(response.data.data);
    });
  };

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
  const [fileName, setFileName] = React.useState("");
  const downloadInstitutions = useCallback(() => {
    // Convert leads to CSV
    const csvRows = [];
    const headers = Object.keys(data[0]).map((field) =>
      field.replace(/_/g, " ").toUpperCase()
    );
    csvRows.push(headers.join(","));

    for (const person of data) {
      const values = headers.map((header) => {
        const fieldName = header.toLowerCase().replace(/ /g, "_");
        // Check for null or undefined and replace with empty string
        //@ts-ignore
        const value =
          //@ts-ignore
          person[fieldName] == null || person[fieldName] == "[object Object]"
            ? ""
            : //@ts-ignore
              person[fieldName];
        return `"${value}"`;
      });
      csvRows.push(values.join(","));
    }

    // Create and download csv file
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leads.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Formik setup for form handling, validation with Yup
  const formik = useFormik({
    initialValues: {
      name: "",
      countryId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      countryId: Yup.string().required("Country is required"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      api.post("institutions", values).then(() => {
        setSubmitting(false);
        resetForm();
        setIsDialogOpen(false);
        toast.success("Institution Added Successfully!");
        // refetch();
      });
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-2.5">
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
        <Button onClick={() => setIsUploadDialogOpen(true)}>Upload CSV</Button>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Upload CSV</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload CSV File</DialogTitle>
              <DialogDescription>
                Upload a CSV file to add institutions
              </DialogDescription>
            </DialogHeader>
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 p-4 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Add Institutions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={formik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Institutions</DialogTitle>
                <DialogDescription>
                  Add a new Institutions here
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                {formik.touched.name && formik.errors.name && (
                  <div>{formik.errors.name}</div>
                )}
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="countryId">Country</Label>
                <select
                  id="countryId"
                  name="countryId"
                  onChange={formik.handleChange}
                  value={formik.values.countryId}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    //@ts-ignore
                    <option key={country.id} value={country.id}>
                      {
                        //@ts-ignore
                        country.name
                      }
                    </option>
                  ))}
                </select>
                {formik.touched.countryId && formik.errors.countryId && (
                  <div>{formik.errors.countryId}</div>
                )}
              </div>

              <Button type="submit">Save changes</Button>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant={"outline"} onClick={downloadInstitutions}>
          Download Institutions
        </Button>

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
