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
import React from "react";
import LanguageTestDetails from "../language-test-details";
import { Form, Formik } from "formik";
import { leadValidationSchema } from "@/schemas/lead-schema";

const LanguageTestTab = ({ lead }: { lead: any }) => {
  const submitForm = () => {};

  return (
    <div className="p-2.5">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Language Information</Button>
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
                <LanguageTestDetails
                  formikProps={{
                    values,
                    handleChange,
                    setFieldValue,
                    touched,
                    errors,
                  }}
                  initialValues={lead}
                  handleSubmit={submitForm}
                />
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
