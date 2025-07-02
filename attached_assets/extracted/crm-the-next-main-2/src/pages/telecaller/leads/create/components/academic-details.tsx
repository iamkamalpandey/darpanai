import React, { useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { leadValidationSchema } from "@/schemas/lead-schema";

const AcademicDetails = ({
  initialValues,
  handleSubmit,
  formikProps,
}: {
  initialValues: any;
  handleSubmit: any;
  formikProps: any;
}) => {
  const { values, handleChange, setFieldValue, touched, errors } = formikProps;

  //@ts-ignore
  const { setLoading } = useAuth();

  return (
    <Card className="border-none mt-2.5">
      <CardContent className="gap-2.5">
        <div className="w-full">
          <Accordion type="single" collapsible className="space-y-4">
            {/* SLC Information */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="btn">
                SLC Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4">
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
                    />
                    {touched.slc_year && errors.slc_year ? (
                      <div style={{ color: "red", marginTop: "0.5rem" }}>
                        {errors.slc_year}
                      </div>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* +2/PCL Information */}
            <AccordionItem value="item-2">
              <AccordionTrigger className="btn">
                +2/PCL Information
              </AccordionTrigger>
              <AccordionContent>
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
                    />
                    {touched.highschool_year && errors.highschool_year ? (
                      <div style={{ color: "red", marginTop: "0.5rem" }}>
                        {errors.highschool_year}
                      </div>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Bachelor's Information */}
            <AccordionItem value="item-3">
              <AccordionTrigger className="btn">
                Bachelor's Information
              </AccordionTrigger>
              <AccordionContent>
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
                    <Label htmlFor="bachelors_grade">Bachelor's Grade</Label>
                    <Field
                      name="bachelors_grade"
                      as={Input}
                      placeholder="Enter your Bachelor's Grade"
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
                    />
                    {touched.bachelors_year && errors.bachelors_year ? (
                      <div style={{ color: "red", marginTop: "0.5rem" }}>
                        {errors.bachelors_year}
                      </div>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Master's Information */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="btn">
                Master's Information
              </AccordionTrigger>
              <AccordionContent>
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
                    />
                    {touched.masters_year && errors.masters_year ? (
                      <div style={{ color: "red", marginTop: "0.5rem" }}>
                        {errors.masters_year}
                      </div>
                    ) : null}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Field of Study - Common Information */}
            <div className="col-span-2 mt-6">
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Field
                name="field_of_study"
                as={Input}
                placeholder="Enter your field of study"
                className="mt-1 block w-full"
              />
              {touched.field_of_study && errors.field_of_study ? (
                <div style={{ color: "red", marginTop: "0.5rem" }}>
                  {errors.field_of_study}
                </div>
              ) : null}
            </div>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicDetails;
