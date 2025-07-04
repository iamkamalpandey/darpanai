import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { IdentifierType } from "@/types/types";

import { Button } from "@/components/ui/button";

import { EditIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Formik } from "formik"; // Import Formik
import api from "@/services/api";
import { toast } from "sonner";

export default function BranchTable({
  branches = [],
  fetchData,
}: {
  branches?: any;
  fetchData: any;
  identifier: IdentifierType;
}) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtered branches based on selected role
  const filteredBranches = selectedRole
    ? branches.filter((branch: any) => branch?.role?.name === selectedRole)
    : branches;

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <Input placeholder="Search by Name" />
          </div>

          <div className=" ">
            <div className=" flex flex-col gap-2.5">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 no-scrollbar">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Name
                          </th>

                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Latitude
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Longitude
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredBranches.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="text-center py-4 text-sm text-gray-500"
                            >
                              No Branches available
                            </td>
                          </tr>
                        ) : (
                          filteredBranches.map((branch: any) => (
                            <tr key={branch.name}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                {branch.name}
                              </td>

                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {branch.latitude}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {branch.longitude}
                              </td>
                              <td className=" px-3 py-4 text-sm text-gray-500">
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="mr-2">
                                    <EditIcon className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                </DialogTrigger>
                              </td>
                              <DialogContent className="sm:max-w-[425px]">
                                <Formik
                                  initialValues={{
                                    // Wrap your form with Formik and set initial values
                                    name: branch.name,
                                    latitude: branch.latitude,
                                    longitude: branch.longitude,
                                  }}
                                  onSubmit={(values, resetForm) => {
                                    // Handle form submission
                                    api
                                      .put(`branch/${branch.id}`, values)
                                      .then(() => {
                                        toast.success(
                                          "Branch updated successfully"
                                        );
                                        // resetForm({});
                                        setIsDialogOpen(false); // Close the dialog
                                        fetchData(); // Refetch the data
                                      })
                                      .catch((error) => {
                                        console.error("Update error", error);
                                      });
                                    // You can handle form submission here, e.g., call an API
                                  }}
                                >
                                  {(formik) => (
                                    <form onSubmit={formik.handleSubmit}>
                                      <DialogHeader>
                                        <DialogTitle>Edit Branch</DialogTitle>
                                        <DialogDescription>
                                          Edit a branch here
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                          id="name"
                                          name="name"
                                          type="text"
                                          onChange={formik.handleChange}
                                          value={formik.values.name}
                                        />
                                        {/* {formik.touched.name &&
                                            formik.errors.name && (
                                              <div>{formik.errors.name}</div>
                                            )} */}

                                        <Label htmlFor="latitude">
                                          Latitude
                                        </Label>
                                        <Input
                                          id="latitude"
                                          name="latitude"
                                          type="number"
                                          onChange={formik.handleChange}
                                          value={formik.values.latitude}
                                        />
                                        {/* {formik.touched.latitude &&
                                            formik.errors.latitude && (
                                              <div>{formik.errors.latitude}</div>
                                            )} */}

                                        <Label htmlFor="longitude">
                                          Longitude
                                        </Label>
                                        <Input
                                          id="longitude"
                                          name="longitude"
                                          type="number"
                                          onChange={formik.handleChange}
                                          value={formik.values.longitude}
                                        />
                                        {/* {formik.touched.longitude &&
                                            formik.errors.longitude && (
                                              <div>{formik.errors.longitude}</div>
                                            )} */}
                                      </div>
                                      <DialogFooter>
                                        <Button type="submit">
                                          Save changes
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  )}
                                </Formik>
                              </DialogContent>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
