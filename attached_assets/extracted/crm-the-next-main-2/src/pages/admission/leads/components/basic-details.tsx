import React from "react";
import { Formik, Form } from "formik";
import Select from "react-select";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
import { Calendar, MessageSquare } from "lucide-react";

const countryOptions = [
  { value: "usa", label: "USA" },
  { value: "uk", label: "UK" },
  { value: "canada", label: "Canada" },
];

const BasicDetails = ({
  initialValues,
  handleSubmit,
}: {
  initialValues: any;
  handleSubmit: any;
}) => {
  return (
    <div>
      <Card className="border-none mt-5 shadow-none">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <CardContent className="gap-2.5 grid grid-cols-2 items-start">
                <div className="">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={values?.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={values?.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={values?.gender}
                    onChange={handleChange}
                    className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <Label htmlFor="">Date of Birth</Label>
                  <DatePicker
                    selected={values?.dob}
                    onChange={(date: Date) => setFieldValue("dob", date)}
                    className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    dateFormat="MM/dd/yyyy"
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </div>
            

                <div className="">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={values?.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={values?.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="">
                  <Label htmlFor="countries">Interested Countries</Label>
                  <Select
                    id="countries"
                    name="countries"
                    value={values?.countries}
                    onChange={(selectedOption) =>
                      setFieldValue("countries", selectedOption)
                    }
                    options={countryOptions}
                    isMulti
                  />
                </div>
                <div className="">
                  <Label htmlFor="course">Interested Course</Label>
                  <Input
                    id="course"
                    name="course"
                    value={values?.course}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remark"
                    name="remark"
                    value={values?.remark}
                    onChange={handleChange}
                  />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="link">Show Remarks</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>All Remarks</SheetTitle>
                        <SheetDescription>
                          All remarks listed below
                        </SheetDescription>
                      </SheetHeader>
                      <div className="grid gap-4 py-4">
                        {values?.remarks.map((item: any) => {
                          const formattedDate = new Date(
                            item.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                          });
                          return (
                            <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between leading-normal">
                              <div className="mb-2">
                                <div className="text-gray-900 font-bold text-xl mb-2 flex items-center">
                                  <MessageSquare className="mr-2" size={20} />{" "}
                                  Remark
                                </div>
                                <p className="text-gray-700 text-base">
                                  {item.content}
                                </p>
                              </div>
                              <div className="flex items-center justify-end">
                                <Calendar className="mr-1" size={16} />
                                <span className="text-sm text-gray-600">
                                  {formattedDate}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <SheetFooter>
                        <SheetClose asChild></SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default BasicDetails;
