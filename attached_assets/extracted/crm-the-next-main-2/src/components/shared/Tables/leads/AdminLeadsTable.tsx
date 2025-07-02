import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
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
import { useCallback, useState } from "react";
import api from "@/services/api";
import { Label } from "@/components/ui/label";
import { downloadLeads } from "@/lib/utils";

export default function AdminLeadsTable() {
  const [data, setData] = useState([]);
  React.useEffect(() => {
    api
      .get("admin/leads")
      .then((response) => {
        setData(response.data.data);
      })
      .catch((e) => {
        toast.error("Unknown Error Encountered!");
      });
  }, []);
  const columns: ColumnDef<any>[] = [
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
      accessorKey: "Name",
      header: () => <div className="text-left">Name</div>,
      enableHiding: true,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
              {`${
                lead.first_name[0].toUpperCase() +
                lead.last_name[0].toUpperCase()
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
      accessorKey: "assignedUsers",
      header: () => <div className="text-left">Assigned Users</div>,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="text-left font-medium">
            {lead._count.assignedUsers}
          </div>
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
              <Link href={`leads/edit/${lead.id}`}>
                <DropdownMenuItem>Edit Lead</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
  const onDrop = useCallback((acceptedFiles: any) => {
    const file = acceptedFiles[0];
    setFile(file); // Assuming you have a state called 'file' to hold the file object
    setFileName(file.name); // Set the file name in state
  }, []);

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post("/lead-upload", formData);
        console.log("Upload success:", response.data);
        toast.success("File uploaded successfully."); // Show toast message

        // Handle success response
      } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading file."); // Provide user feedback
        // Handle error case
      }
    } else {
      toast.error("Please select a file to upload."); // Case when no file is selected
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,

    maxFiles: 1,
  });
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
  const downloadLeadsCallback = useCallback(() => {
    downloadLeads(data);
  }, [data]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(event.target.value);
  };
  const selectedLeadIds = Object.keys(rowSelection).filter(
    //@ts-ignore
    (key) => rowSelection[key]
  );

  const handleSubmit = async () => {
    if (!selectedUserId || selectedLeadIds.length === 0) {
      toast.error("Please select a user and at least one lead.");
      return;
    }

    // Here you would call your API with the selectedUserId and selectedLeadIds
    try {
      const response = await api.patch("lead/mass-assign", {
        userId: selectedUserId,
        leadIds: selectedLeadIds,
      });
      toast.success("Lead Assigned Successfully");
      router.reload();
      console.log(response); // Handle your response here
      closeDialog(); // Close the dialog on success
    } catch (error) {
      console.error(error); // Handle error case
    }
  };

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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Upload</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload File</DialogTitle>
              <DialogDescription>Upload the lead file here</DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center"
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : fileName ? ( // Check if a file name exists
                  <p>File selected: {fileName}</p> // Display the file name
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
              <button
                type="button"
                onClick={handleUpload}
                className="button-class"
              >
                Upload
              </button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          onClick={openDialog}
          disabled={Object.keys(rowSelection).length === 0} // Button is disabled if no rows are selected
        >
          Assign Lead
        </Button>
        {isDialogOpen && (
          <Dialog open={isDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Leads</DialogTitle>
              </DialogHeader>

              <div className="col-span-2">
                <Label htmlFor="name">Assign Telecaller/Counsellor</Label>
                <select
                  id="assignedUser"
                  name="assignedUser"
                  onChange={handleUserChange}
                  className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select User</option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button variant={"default"} onClick={handleSubmit}>
                  Assign Leads
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  Close
                </Button>
                {/* Add more dialog actions here */}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Button variant={"outline"} onClick={downloadLeads}>
          Download Leads
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            router.push(`leads/create`);
          }}
        >
          Add Lead
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
