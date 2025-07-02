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
import AcademicDetails from "../academic-details";
import { leadValidationSchema } from "@/schemas/lead-schema";
import api from "@/services/api";
import { toast } from "sonner";

import { useRouter } from "next/router";
const EducationTab = ({ lead }: { lead: any }) => {
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    fetchCountries();
  }, []);
  const fetchCountries = async () => {
    try {
      const response = await api.get("/countries");
      if (!response) throw new Error("Network response was not ok");
      const countryOptions = response.data.data.map((country: any) => ({
        value: country.id,
        label: country.name,
      }));
      setCountries(countryOptions);
    } catch (err) {
      console.error(err);
      // Handle error appropriately
    } finally {
    }
  };

  // Convert the initial country IDs to the { value, label } format
  // This function needs to be called inside Formik after countries have been fetched
  const getInitialCountrySelections = () => {
    return (
      lead.interestedCountries
        ?.map((ic: any) => {
          //@ts-ignore
          const match = countries.find((c) => c.value === ic.countryId);
          //@ts-ignore
          return match ? { value: match.value, label: match.label } : null;
        })
        .filter(Boolean) || []
    );
  };
  const initialValues = {
    id: lead.id,
    call_status: "",

    first_name: lead?.first_name,
    last_name: lead?.last_name,
    gender: lead?.gender,
    email: lead?.email || "",
    phone_number: lead?.phone_number,
    secondary_number: lead?.secondary_number ?? "",
    course: lead?.interested_course,
    remark: "",
    countryInterests: [],
    dob: lead?.dob || "",
    address: lead?.address || "",
    field_of_study: lead?.field_of_study || "",
    slc_institution_name: lead?.slc_institution_name || "",
    slc_grade: lead?.slc_grade || "",
    slc_year: lead?.slc_year || "",
    highschool_institution_name: lead?.highschool_institution_name || "",
    highschool_grade: lead?.highschool_grade || "",
    highschool_year: lead?.highschool_year || "",
    bachelors_institution_name: lead?.bachelors_institution_name || "",
    bachelors_grade: lead?.bachelors_grade || "",
    bachelors_year: lead?.bachelors_year || "",
    masters_institution_name: lead?.masters_institution_name || "",
    masters_grade: lead?.masters_grade || "",
    masters_year: lead?.masters_year || "",

    ielts_overall_score: lead?.ielts_overall_score || "",
    ielts_listening_score: lead?.ielts_listening_score || "",
    ielts_speaking_score: lead?.ielts_speaking_score || "",
    ielts_reading_score: lead?.ielts_reading_score || "",
    ielts_date: lead?.ielts_date || "",

    pte_overall_score: lead?.pte_overall_score || "",
    pte_listening_score: lead?.pte_listening_score || "",
    pte_speaking_score: lead?.pte_speaking_score || "",
    pte_reading_score: lead?.pte_reading_score || "",
    pte_date: lead?.pte_date || "",
    city: lead?.city || "",
    remarks: lead?.remarks || [],
    followUpDates: lead?.followUpDates || [],
    interested_countries: lead.interestedCountries,
    interested_course: lead.interested_course || "",
    profile_status: lead?.profile_status || "incomplete",
  };
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
        router.reload();
        toast.success("Lead Updated");
        // fetchData();
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
