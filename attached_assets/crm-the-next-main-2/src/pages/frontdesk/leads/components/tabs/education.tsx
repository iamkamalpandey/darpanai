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
import React from "react";
import AcademicDetails from "../academic-details";
import { leadValidationSchema } from "@/schemas/lead-schema";

const EducationTab = ({ lead }: { lead: any }) => {
  const submitForm = () => {};
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
              ...lead,
              // interested_countries: getInitialCountrySelections(),
            }}
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
                  <AcademicDetails
                    formikProps={{
                      values,
                      handleChange,
                      setFieldValue,
                      touched,
                      errors,
                    }}
                    initialValues={lead}
                    handleSubmit={undefined}
                  />
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
                {/* <Input
                  id="slc_institution_name"
                  name="slc_institution_name"
                  value={lead?.slc_institution_name}
                  // onChange={handleChange}
                /> */}
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
                <div>{lead?.bachelor_year}</div>
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
