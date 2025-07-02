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

import { leadValidationSchema } from "@/schemas/lead-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function index() {
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("basic");

  //@ts-ignore
  const { setLoading } = useAuth();
  const [countries, setCountries] = useState([]);
  const [initialValues, setInitialValues] = useState({
    call_status: "",
    first_name: "",
    last_name: "",
    gender: "",
    email: "",
    city: "",
    secondary_number: "",
    interested_countries: [],
    profile_status: "incomplete",
    source: "office-checkin",
    branch_id: "",
  });

  useEffect(() => {
    if (router.isReady && router.query) {
      console.log(router.query);
      const { branch_id } = router.query;
      setInitialValues((prevValues: any) => ({
        ...prevValues,
        branch_id: branch_id || "",
      }));
      fetchCountries();
    }
    fetchCountries();
  }, [router.query, router.query.branch_id]);

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
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (values: any, { resetForm }: { resetForm: any }) => {
    let submissionValues;
    if (
      values.interested_countries != null ||
      values.interested_countries.length > 0
    ) {
      submissionValues = {
        ...values,
        branch_id: router.query.branch_id || "",
        interested_countries: values.interested_countries.map(
          (country: any) => country.value
        ),
      };
    } else {
      submissionValues = { ...values };
    }

    try {
      console.log(values);
      const response = await api.post(`lead`, submissionValues);
      if (response.data.status == "success") {
        toast.success("Lead Updated");
        resetForm();
      } else {
        toast.error("Could Not Update Lead");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };
  let content;

  content = (
    <div className=" overflow-scroll">
      <div className="flex w-full ">
        <div className="border rounded  w-full flex flex-col">
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
                </Tabs>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
  if (!router.isReady) {
    return <div>Loading...</div>; // Loading state while waiting for router query to be ready
  }

  return <>{content}</>;
}
