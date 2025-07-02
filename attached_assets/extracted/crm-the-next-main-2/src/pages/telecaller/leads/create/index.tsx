import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";

import { Form, Formik } from "formik";

import { useAuth } from "@/contexts/AuthContext";

import { Separator } from "@/components/ui/separator";
import BasicDetails from "./components/basic-details";
import AcademicDetails from "./components/academic-details";
import LanguageTestDetails from "./components/language-test-details";
import Layout from "../../layout";
import Header from "@/components/shared/Header/Header";
import { leadValidationSchema } from "@/schemas/lead-schema";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
export default function index() {
  const router = useRouter();
  const { user, setLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [lead, setLead] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [countries, setCountries] = useState([]);

  // Fetch data function
  const fetchData = async () => {
    setError(null);
    try {
      // Add your fetch logic here if needed
      const response = await api.get(`/lead/${router.query.id}`);
      setLead(response.data);
    } catch (err) {
      //@ts-ignore
      setError(err);
    }
  };

  // Effect for fetching lead data when ID changes
  useEffect(() => {
    if (router.query.id) {
      fetchData();
    }
  }, [router.query.id]);

  // Effect for fetching countries
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (values: any, { resetForm }: { resetForm: any }) => {
    setIsSubmitting(true);
    let submissionValues;

    if (
      values.interested_countries != null &&
      values.interested_countries.length > 0
    ) {
      submissionValues = {
        ...values,
        branch_id: user.role.id,
        interested_countries: values.interested_countries.map(
          (country: any) => country.value
        ),
      };
    } else {
      submissionValues = { ...values };
    }

    try {
      const response = await api.post(`lead`, submissionValues);
      if (response.status === 200) {
        toast.success("Lead Created Successfully");
        resetForm();
      } else if (response.status === 400) {
        toast.error(response.data.message);
      } else {
        toast.error("Could Not Create Lead");
      }
    } catch (error: any) {
      console.error("Error creating lead:", error.response.data.message);
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create lead");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialValues = {
    call_status: "",
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    remark: "",
    assignedUser: user?.id || "",
    interested_countries: [],
    city: "",
    profile_status: "incomplete",
    source: "",
    secondary_number: "",
  };

  return (
    <Layout>
      <Header title="Create Lead" />
      <div className="overflow-scroll">
        <div className="flex w-full">
          <div className="border rounded w-full flex flex-col">
            <Separator />
            <Formik
              initialValues={initialValues}
              onSubmit={submitForm}
              validationSchema={leadValidationSchema}
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
                  <Tabs
                    defaultValue={selectedTab}
                    className="mt-2.5"
                    onValueChange={setSelectedTab}
                  >
                    <BasicDetails
                      formikProps={{
                        values,
                        handleChange,
                        setFieldValue,
                        touched,
                        errors,
                      }}
                      initialValues={initialValues}
                      handleSubmit={submitForm}
                      //@ts-ignore
                      countries={countries}
                    />
                    <AcademicDetails
                      formikProps={{
                        values,
                        handleChange,
                        setFieldValue,
                        touched,
                        errors,
                      }}
                      initialValues={initialValues}
                      handleSubmit={submitForm}
                    />
                    <LanguageTestDetails
                      formikProps={{
                        values,
                        handleChange,
                        setFieldValue,
                        touched,
                        errors,
                      }}
                      initialValues={initialValues}
                      handleSubmit={submitForm}
                    />
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </Tabs>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      <LoadingSpinner loading={isSubmitting} message="Creating lead..." />
    </Layout>
  );
}
