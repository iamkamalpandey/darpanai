//@ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";

import { leadValidationSchema } from "@/schemas/lead-schema";
import api from "@/services/api";
import { Field, Form, Formik } from "formik";
import { EditIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const EditLeadModal = ({
  lead,
  fetchData,
  initialValues,
  countries,
  getInitialCountrySelections,
}: {
  lead: any;
  fetchData: any;
  initialValues: any;
  countries: any;
  getInitialCountrySelections: any;
}) => {
  const submitForm = async (values: any) => {
    const submissionValues = {
      ...values,
      interested_countries: values.interested_countries.map(
        (country: any) => country.value
      ),
    };
    try {
      console.log(values);
      const response = await api.post(`lead/${lead.id}`, submissionValues);
      if (response.data.status == "success") {
        toast.success("Lead Updated");
        fetchData();
      } else {
        toast.error("Could Not Update Lead");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <EditIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl ">
        {/* <Form> */}
        <DialogHeader>
          <DialogTitle>Edit Details</DialogTitle>
          <DialogDescription>
            Here you can edit academic information
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full">
          <Formik
            initialValues={{
              ...initialValues,
              interested_countries: getInitialCountrySelections(),
            }}
            onSubmit={submitForm}
            validationSchema={leadValidationSchema}
            enableReinitial
          >
            {({
              values,
              handleChange,
              setFieldValue,
              handleSubmit,
              touched,
              errors,
            }) => (
              <>
                <Form onSubmit={handleSubmit}>
                  <Card className="border-none mt-5 shadow-none">
                    <CardContent className="gap-2.5 grid grid-cols-2 items-start">
                      <div className="">
                        <Label htmlFor="name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={values?.first_name}
                          onChange={handleChange}
                        />
                        {touched.first_name && errors.first_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.first_name}
                          </div>
                        ) : null}
                      </div>
                      <div className="">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={values?.last_name}
                          onChange={handleChange}
                        />
                        {touched.last_name && errors.last_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.last_name}
                          </div>
                        ) : null}
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
                        {touched.email && errors.email ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.email}
                          </div>
                        ) : null}
                      </div>
                      <div className="">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={values?.phone_number}
                          onChange={handleChange}
                        />
                        {touched.phone_number && errors.phone_number ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.phone_number}
                          </div>
                        ) : null}
                      </div>
                      <div className="">
                        <Label htmlFor="interested_countries">
                          Interested Countries
                        </Label>
                        <Select
                          id="interested_countries"
                          name="interested_countries"
                          value={values.interested_countries}
                          onChange={(value) =>
                            setFieldValue("interested_countries", value)
                          }
                          options={countries}
                          isMulti
                        />
                      </div>
                      <div className="">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={values?.city}
                          onChange={handleChange}
                        />
                        {touched.city && errors.city ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.city}
                          </div>
                        ) : null}
                      </div>
                      <div className="">
                        <Label htmlFor="interested_course">
                          Interested Course
                        </Label>
                        <Input
                          id="interested_course"
                          name="interested_course"
                          value={values?.interested_course}
                          onChange={handleChange}
                        />
                        {touched.interested_course &&
                        errors.interested_course ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.interested_course}
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <DialogTrigger asChild>
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save Changes
                        </Button>
                      </DialogTrigger>
                    </CardFooter>
                  </Card>
                </Form>
              </>
            )}
          </Formik>
        </div>
        {/* </Form> */}
      </DialogContent>
    </Dialog>
  );
};

export default EditLeadModal;
