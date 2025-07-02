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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import React, { useEffect, useState } from "react";

import { Field, Form, Formik } from "formik";
import { leadValidationSchema } from "@/schemas/lead-schema";
import api from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const LanguageTestTab = ({
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
      const response = await api.post(
        `lead/${router.query.id}`,
        submissionValues
      );
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
    <div className="p-2.5">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Language Test Information</Button>
        </DialogTrigger>
        <DialogContent className="w-full max-w-7xl  ">
          {/* <Form> */}
          <DialogHeader>
            <DialogTitle>Edit Language Test</DialogTitle>
            <DialogDescription>
              Here you can edit language test information
            </DialogDescription>
          </DialogHeader>
          <Formik
            initialValues={{
              ...initialValues,
              interested_countries: getInitialCountrySelections(),
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
                <Card className="border-none mt-5">
                  <CardContent className="gap-2.5">
                    <div className="w-full">
                      <Accordion
                        type="single"
                        collapsible
                        className="space-y-4"
                      >
                        {/* IELTS Information */}
                        <AccordionItem value="ielts">
                          <AccordionTrigger className="btn">
                            IELTS Information
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <Label htmlFor="ielts_overall_score">
                                  IELTS Overall Score
                                </Label>
                                <Field
                                  name="ielts_overall_score"
                                  as={Input}
                                  placeholder="Overall Score"
                                  label="Overall Score"
                                />
                                {touched.ielts_overall_score &&
                                errors.ielts_overall_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_overall_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="ielts_listening_score">
                                  IELTS Listening Score
                                </Label>
                                <Field
                                  name="ielts_listening_score"
                                  as={Input}
                                  placeholder="Listening Score"
                                  label="Listening Score"
                                />
                                {touched.ielts_listening_score &&
                                errors.ielts_listening_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_listening_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="ielts_speaking_score">
                                  IELTS Speaking Score
                                </Label>
                                <Field
                                  name="ielts_speaking_score"
                                  as={Input}
                                  placeholder="Speaking Score"
                                  label="Speaking Score"
                                />
                                {touched.ielts_speaking_score &&
                                errors.ielts_speaking_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_speaking_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="ielts_reading_score">
                                  IELTS Reading Score
                                </Label>
                                <Field
                                  name="ielts_reading_score"
                                  as={Input}
                                  placeholder="Reading Score"
                                  label="Reading Score"
                                />
                                {touched.ielts_reading_score &&
                                errors.ielts_reading_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_reading_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="ielts_writing_score">
                                  IELTS Writing Score
                                </Label>
                                <Field
                                  name="ielts_writing_score"
                                  as={Input}
                                  placeholder="Writing Score"
                                  label="Writing Score"
                                />
                                {touched.ielts_writing_score &&
                                errors.ielts_writing_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_writing_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="ielts_date">
                                  IELTS Test Date
                                </Label>
                                <Field
                                  name="ielts_date"
                                  as={Input}
                                  placeholder="Test Date"
                                  label="Test Date"
                                  type="date"
                                />
                                {touched.ielts_date && errors.ielts_date ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.ielts_date}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* PTE Information */}
                        <AccordionItem value="pte">
                          <AccordionTrigger className="btn">
                            PTE Information
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="col-span-2">
                                <Label htmlFor="pte_overall_score">
                                  PTE Overall Score
                                </Label>
                                <Field
                                  name="pte_overall_score"
                                  as={Input}
                                  placeholder="Overall Score"
                                  label="Overall Score"
                                />
                                {touched.pte_overall_score &&
                                errors.pte_overall_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_overall_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="pte_listening_score">
                                  PTE Listening Score
                                </Label>
                                <Field
                                  name="pte_listening_score"
                                  as={Input}
                                  placeholder="Listening Score"
                                  label="Listening Score"
                                />
                                {touched.pte_listening_score &&
                                errors.pte_listening_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_listening_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="pte_speaking_score">
                                  PTE Speaking Score
                                </Label>
                                <Field
                                  name="pte_speaking_score"
                                  as={Input}
                                  placeholder="Speaking Score"
                                  label="Speaking Score"
                                />
                                {touched.pte_speaking_score &&
                                errors.pte_speaking_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_speaking_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="pte_reading_score">
                                  PTE Reading Score
                                </Label>
                                <Field
                                  name="pte_reading_score"
                                  as={Input}
                                  placeholder="Reading Score"
                                  label="Reading Score"
                                />
                                {touched.pte_reading_score &&
                                errors.pte_reading_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_reading_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="pte_writing_score">
                                  PTE Writing Score
                                </Label>
                                <Field
                                  name="pte_writing_score"
                                  as={Input}
                                  placeholder="Writing Score"
                                  label="Writing Score"
                                />
                                {touched.pte_writing_score &&
                                errors.pte_writing_score ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_writing_score}
                                  </div>
                                ) : null}
                              </div>
                              <div>
                                <Label htmlFor="pte_date">PTE Test Date</Label>
                                <Field
                                  name="pte_date"
                                  as={Input}
                                  placeholder="Test Date"
                                  label="Test Date"
                                  type="date"
                                />
                                {touched.pte_date && errors.pte_date ? (
                                  <div
                                    style={{
                                      color: "red",
                                      marginTop: "0.5rem",
                                    }}
                                  >
                                    {errors.pte_date}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* SAT Information */}
                        <AccordionItem value="sat">
                          <AccordionTrigger className="btn">
                            SAT Information
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="sat_overall_score">
                                  SAT Overall Score
                                </Label>
                                <Field
                                  name="sat_overall_score"
                                  as={Input}
                                  placeholder="Overall Score"
                                  label="Overall Score"
                                />
                              </div>
                              <div>
                                <Label htmlFor="sat_math_score">
                                  SAT Math Score
                                </Label>
                                <Field
                                  name="sat_math_score"
                                  as={Input}
                                  placeholder="Math Score"
                                  label="Math Score"
                                />
                              </div>
                              <div>
                                <Label htmlFor="sat_reading_score">
                                  SAT Reading Score
                                </Label>
                                <Field
                                  name="sat_reading_score"
                                  as={Input}
                                  placeholder="Reading Score"
                                  label="Reading Score"
                                />
                              </div>
                              <div>
                                <Label htmlFor="sat_writing_and_language_score">
                                  SAT Writing & Language Score
                                </Label>
                                <Field
                                  name="sat_writing_and_language_score"
                                  as={Input}
                                  placeholder="Writing & Language Score"
                                  label="Writing & Language Score"
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </Form>
            )}
          </Formik>
          {/* </Form> */}
        </DialogContent>
      </Dialog>
      <Accordion type="single" collapsible className="space-y-4">
        {/* IELTS Information */}
        <AccordionItem value="ielts">
          <AccordionTrigger className="btn">IELTS Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="ielts_overall_score">IELTS Overall Score</Label>
                <div>{lead?.ielts_overall_score}</div>
              </div>
              <div>
                <Label htmlFor="ielts_listening_score">
                  IELTS Listening Score
                </Label>
                <div>{lead?.ielts_listening_score}</div>
              </div>
              <div>
                <Label htmlFor="ielts_speaking_score">
                  IELTS Speaking Score
                </Label>
                <div>{lead?.ielts_speaking_score}</div>
              </div>
              <div>
                <Label htmlFor="ielts_reading_score">IELTS Reading Score</Label>
                <div>{lead?.ielts_reading_score}</div>
              </div>
              <div>
                <Label htmlFor="ielts_writing_score">IELTS Writing Score</Label>
                <div>{lead?.ielts_writing_score}</div>
              </div>
              <div>
                <Label htmlFor="ielts_date">IELTS Test Date</Label>
                <div>{lead?.ielts_date}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* PTE Information */}
        <AccordionItem value="pte">
          <AccordionTrigger className="btn">PTE Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="pte_overall_score">PTE Overall Score</Label>
                <div>{lead?.pte_overall_score}</div>
              </div>
              <div>
                <Label htmlFor="pte_listening_score">PTE Listening Score</Label>
                <div>{lead?.pte_listening_score}</div>
              </div>
              <div>
                <Label htmlFor="pte_speaking_score">PTE Speaking Score</Label>
                <div>{lead?.pte_speaking_score}</div>
              </div>
              <div>
                <Label htmlFor="pte_reading_score">PTE Reading Score</Label>
                <div>{lead?.pte_reading_score}</div>
              </div>
              <div>
                <Label htmlFor="pte_writing_score">PTE Writing Score</Label>
                <div>{lead?.pte_writing_score}</div>
              </div>
              <div>
                <Label htmlFor="pte_date">PTE Test Date</Label>
                <div>{lead?.pte_date}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SAT Information */}
        <AccordionItem value="sat">
          <AccordionTrigger className="btn">SAT Information</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sat_overall_score">SAT Overall Score</Label>
                <div>{lead?.sat_overall_score}</div>
              </div>
              <div>
                <Label htmlFor="sat_math_score">SAT Math Score</Label>
                <div>{lead?.sat_math_score}</div>
              </div>
              <div>
                <Label htmlFor="sat_reading_score">SAT Reading Score</Label>
                <div>{lead?.sat_reading_score}</div>
              </div>
              <div>
                <Label htmlFor="sat_writing_and_language_score">
                  SAT Writing & Language Score
                </Label>
                <div>{lead?.sat_writing_and_language_score}</div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LanguageTestTab;
