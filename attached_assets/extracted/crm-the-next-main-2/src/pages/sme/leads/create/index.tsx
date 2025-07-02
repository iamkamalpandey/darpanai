import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";

import Header from "@/components/shared/Header/Header";
import DatePicker from "react-datepicker";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Layout from "../../layout";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, Formik } from "formik";
import { Input } from "@/components/ui/input";

export default function index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTab, setSelectedTab] = useState("basic");
  const [countries, setCountries] = useState([]);

  const submitForm = async (values: any) => {
    try {
      console.log(values);
      const response = await api.post(`lead`, values);
      if (response.data.status == "success") {
        toast.success("Lead Added Successfully!");
        router.push("/super_admin/leads");
      } else {
        toast.error("Could Not Update Lead");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };
  let content;

  const initialValues = {
    call_status: "completed",
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    phone_number: "",
    interested_course: "",
    remark: "",
    interested_countries: [],
    dob: "",
    field_of_study: "",
    slc_institution_name: "",
    slc_grade: "",
    slc_year: "",
    highschool_institution_name: "",
    highschool_grade: "",
    highschool_year: "",
    bachelors_institution_name: "",
    bachelors_grade: "",
    bachelors_year: "",
    masters_institution_name: "",
    masters_grade: "",
    masters_year: "",

    ielts_overall_score: "",
    ielts_listening_score: "",
    remarks: [],
    followUpDates: [],
  };

  content = (
    <div className="p-2.5 overflow-scroll">
      <div className="flex w-full p-2.5">
        <div className="border rounded p-2.5 w-full flex flex-col">
          <div className="header pb-2.5 px-2.5 flex w-full justify-between items-center">
            <div className="text-lg font-medium">Create New Lead</div>
            <div className="flex gap-2.5">
              <Formik initialValues={initialValues} onSubmit={submitForm}>
                {({ values, handleChange, setFieldValue, handleSubmit }) => (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Add FollowUp Date</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form onSubmit={handleSubmit}>
                        <DialogHeader>
                          <DialogTitle>Add a followup date</DialogTitle>
                          <DialogDescription>Followup date</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <>
                            <Label htmlFor="call_status">Call Status</Label>
                            <select
                              id="call_status"
                              name="call_status"
                              value={values.call_status}
                              onChange={handleChange}
                              className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select Call Status</option>
                              <option value="completed">Completed</option>
                              <option value="scheduled">Scheduled</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Label htmlFor="">Follow-up Date</Label>
                            <DatePicker
                              //@ts-ignore
                              selected={values?.follow_up_date}
                              onChange={(date: Date) =>
                                setFieldValue("follow_up_date", date)
                              }
                              className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              dateFormat="MM/dd/yyyy"
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                            />
                            <Label htmlFor="">Note</Label>
                            <Input placeholder="Note" />
                          </>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Save changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </Formik>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="link">Show Follow-up Dates</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>All Follow-up Dates</SheetTitle>
                    <SheetDescription>
                      All follow-up dates listed below
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    {/* Map over follow-up dates */}
                  </div>
                  <SheetFooter>
                    <SheetClose asChild></SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Separator />
          <Formik initialValues={initialValues} onSubmit={submitForm}>
            {({
              values,
              handleChange,
              setFieldValue,
              handleSubmit,
              touched,
              errors,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Tabs
                  defaultValue={selectedTab}
                  className="mt-2.5"
                  onValueChange={setSelectedTab}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Details</TabsTrigger>
                    <TabsTrigger value="academic">Academic Details</TabsTrigger>
                    <TabsTrigger value="language">Language Tests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic"></TabsContent>
                  <TabsContent value="academic"></TabsContent>
                  <TabsContent value="language"></TabsContent>
                </Tabs>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <Header title="Lead Details" />
      {content}
    </Layout>
  );
}
