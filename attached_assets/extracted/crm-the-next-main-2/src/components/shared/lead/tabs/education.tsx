//@ts-nocheck
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";

import { leadValidationSchema } from "@/schemas/lead-schema";
import api from "@/services/api";
import { toast } from "sonner";

import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
const EducationTab = ({
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
  const router = useRouter();
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
    <div className="p-2.5  rounded-lg">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Information</Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-2xl ">
          {/* <Form> */}
          <DialogHeader>
            <DialogTitle>Education</DialogTitle>
            <DialogDescription>
              Here you can edit academic information
            </DialogDescription>
          </DialogHeader>
          <Formik
            initialValues={{
              ...initialValues,
              interested_countries: getInitialCountrySelections(),
            }}
            enableReinitialize
            onSubmit={submitForm}
            validationSchema={leadValidationSchema}
            enableReinitial
            ize
          >
            {({
              values,
              handleChange,
              setFieldValue,
              handleSubmit,

              touched,
              errors,
            }) => (
              <Form onSubmit={handleSubmit}>
                {lead && (
                  <div className="w-full gap-2.5 flex flex-col">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="slc_institution_name">
                          Academic Institution SLC
                        </Label>
                        <Field
                          name="slc_institution_name"
                          as={Input}
                          placeholder="Enter SLC Institution Name"
                        />
                        {touched.slc_institution_name &&
                        errors.slc_institution_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.slc_institution_name}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="slc_grade">SLC/SEE Grade</Label>
                        <Field
                          name="slc_grade"
                          as={Input}
                          placeholder="Enter your SLC/SEE Grade"
                          type="number"
                        />
                        {touched.slc_grade && errors.slc_grade ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.slc_grade}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="slc_year">SLC/SEE Year</Label>
                        <Field
                          name="slc_year"
                          as={Input}
                          placeholder="Enter your SLC/SEE Year"
                          type="number"
                        />
                        {touched.slc_year && errors.slc_year ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.slc_year}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="highschool_institution_name">
                          Academic Institution +2/PCL
                        </Label>
                        <Field
                          name="highschool_institution_name"
                          as={Input}
                          placeholder="Enter +2/PCL Institution Name"
                        />
                        {touched.highschool_institution_name &&
                        errors.highschool_institution_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.highschool_institution_name}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="highschool_grade">+2/PCL Grade</Label>
                        <Field
                          name="highschool_grade"
                          as={Input}
                          placeholder="Enter your +2/PCL Grade"
                          type="number"
                        />
                        {touched.highschool_grade && errors.highschool_grade ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.highschool_grade}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="highschool_year">+2/PCL Year</Label>
                        <Field
                          name="highschool_year"
                          as={Input}
                          placeholder="Enter your +2/PCL Year"
                          type="number"
                        />
                        {touched.highschool_year && errors.highschool_year ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.highschool_year}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="bachelors_institution_name">
                          Academic Institution Bachelor's
                        </Label>
                        <Field
                          name="bachelors_institution_name"
                          as={Input}
                          placeholder="Enter Bachelors Institution Name"
                        />
                        {touched.bachelors_institution_name &&
                        errors.bachelors_institution_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.bachelors_institution_name}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="bachelors_grade">
                          Bachelor's Grade
                        </Label>
                        <Field
                          name="bachelors_grade"
                          as={Input}
                          placeholder="Enter your Bachelor's Grade"
                          type="number"
                        />
                        {touched.bachelors_grade && errors.bachelors_grade ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.bachelors_grade}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="bachelor_year">Bachelor's Year</Label>
                        <Field
                          name="bachelors_year"
                          as={Input}
                          placeholder="Enter your Bachelor's Year"
                          type="number"
                        />
                        {touched.bachelors_year && errors.bachelors_year ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.bachelors_year}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="masters_institution_name">
                          Academic Institution Master's
                        </Label>
                        <Field
                          name="masters_institution_name"
                          as={Input}
                          placeholder="Enter Masters Institution Name"
                        />
                        {touched.masters_institution_name &&
                        errors.masters_institution_name ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.masters_institution_name}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="masters_grade">Master's Grade</Label>
                        <Field
                          name="masters_grade"
                          as={Input}
                          placeholder="Enter your Master's Grade"
                          type="number"
                        />
                        {touched.masters_grade && errors.masters_grade ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.masters_grade}
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <Label htmlFor="masters_year">Master's Year</Label>
                        <Field
                          name="masters_year"
                          as={Input}
                          placeholder="Enter your Master's Year"
                          type="number"
                        />
                        {touched.masters_year && errors.masters_year ? (
                          <div style={{ color: "red", marginTop: "0.5rem" }}>
                            {errors.masters_year}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center w-full my-2.5">
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Cancel</Button>
                  </DialogTrigger>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save changes
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          {/* </Form> */}
        </DialogContent>
      </Dialog>
      <Accordion type="single" collapsible className="space-y-4 ">
        <AccordionItem value="item-1">
          <AccordionTrigger className="btn">SLC Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
              <div className="col-span-2">
                <Label htmlFor="slc_institution_name" className="font-bold">
                  Academic Institution SLC
                </Label>

                <div>{lead?.slc_institution_name}</div>
              </div>
              <div>
                <Label htmlFor="slc_grade" className="font-bold">
                  SLC/SEE Grade
                </Label>
                <div>{lead?.slc_grade}</div>
              </div>
              <div>
                <Label htmlFor="slc_year" className="font-bold">
                  SLC/SEE Year
                </Label>
                <div>{lead?.slc_year}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="btn">
            +2/PCL Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
              <div className="col-span-2">
                <Label
                  htmlFor="highschool_institution_name"
                  className="font-bold"
                >
                  Academic Institution +2/PCL
                </Label>
                <div>{lead?.highschool_institution_name}</div>
              </div>
              <div>
                <Label htmlFor="highschool_grade" className="font-bold">
                  +2/PCL Grade
                </Label>
                <div>{lead?.highschool_grade}</div>
              </div>
              <div>
                <Label htmlFor="highschool_year" className="font-bold">
                  +2/PCL Year
                </Label>
                <div>{lead?.highschool_year}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="btn">
            Bachelor's Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
              <div className="col-span-2">
                <Label
                  htmlFor="bachelors_institution_name"
                  className="font-bold"
                >
                  Academic Institution Bachelor's
                </Label>
                <div>{lead?.bachelors_institution_name}</div>
              </div>
              <div>
                <Label htmlFor="bachelors_grade" className="font-bold">
                  Bachelor's Grade
                </Label>
                <div>{lead?.bachelors_grade}</div>
              </div>
              <div>
                <Label htmlFor="bachelor_year" className="font-bold">
                  Bachelor's Year
                </Label>
                <div>{lead?.bachelors_year}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="btn">
            Master's Information
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
              <div className="col-span-2">
                <Label htmlFor="masters_institution_name" className="font-bold">
                  Academic Institution Master's
                </Label>
                <div>{lead?.masters_institution_name}</div>
              </div>
              <div>
                <Label htmlFor="masters_grade" className="font-bold">
                  Master's Grade
                </Label>
                <div>{lead?.masters_grade}</div>
              </div>
              <div>
                <Label htmlFor="masters_year" className="font-bold">
                  Master's Year
                </Label>
                <div>{lead?.masters_year}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EducationTab;
