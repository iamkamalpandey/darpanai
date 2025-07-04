import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { toast } from "sonner";
export default function CountriesTable({
  countries = [],

  refetch,
}: {
  countries?: Array<{
    id: number;
    name: string;
    label: string;

    // Add more properties as needed, like number of institutions
  }>;
  refetch: any;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Formik setup for form handling, validation with Yup
  const formik = useFormik({
    initialValues: {
      name: "",
      signature: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      signature: Yup.string().required("Signature is required"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      api.post("countries", values).then(() => {
        setSubmitting(false);
        resetForm();
        setIsDialogOpen(false);
        toast.success("Country Added Successfully!");
        refetch();
      });
    },
  });

  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <div className="flex">
          <Input placeholder="Search by Country Name" />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Add Country
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add Country</DialogTitle>
                  <DialogDescription>Add a new country here</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Country Name</Label>
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

                  <Label htmlFor="label">Signature</Label>
                  <Input
                    id="signature"
                    name="signature"
                    type="text"
                    onChange={formik.handleChange}
                    value={formik.values.signature}
                  />
                  {formik.touched.signature && formik.errors.signature && (
                    <div>{formik.errors.signature}</div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

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
                      Country Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Interested Leads
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Institutions
                    </th>

                    {/* <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {countries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3} // Update colspan as needed based on the number of columns
                        className="text-center py-4 text-sm text-gray-500"
                      >
                        No countries available
                      </td>
                    </tr>
                  ) : (
                    countries.map((country) => (
                      <tr key={country.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {country.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                          {
                            //@ts-ignore
                            country._count.leads
                          }
                        </td>
                        <td className="whitespace-nowrap px-3 text-center py-4 text-sm text-gray-500">
                          {
                            //@ts-ignore
                            country._count.institutions
                          }
                        </td>

                        {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/countries/edit/${country.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        </td> */}
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
  );
}
