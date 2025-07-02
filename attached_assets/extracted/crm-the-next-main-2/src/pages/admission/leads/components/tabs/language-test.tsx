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
import LanguageTestDetails from "../language-test-details";
import { Form, Formik } from "formik";
import { leadValidationSchema } from "@/schemas/lead-schema";
import api from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "next/router";

const LanguageTestTab = ({ lead }: { lead: any }) => {
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
              ...lead,
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
