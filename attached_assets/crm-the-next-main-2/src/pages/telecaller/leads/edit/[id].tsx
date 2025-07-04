import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Separator } from "@/components/ui/separator";

import Header from "@/components/shared/Header/Header";
import DatePicker from "react-datepicker";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AcademicDetails from "../components/academic-details";
import BasicDetails from "../components/basic-details";
import LanguageTestDetails from "../components/language-test-details";
import Layout from "../../layout";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Form, Formik } from "formik";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import * as Yup from "yup";
import { leadValidationSchema } from "@/schemas/lead-schema";
import AssignUserModal from "@/components/shared/lead/assign-user-modal";
import AssignFollowerModal from "@/components/shared/lead/assign-follower-modal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lead, setLead] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("basic");
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchUser = () => {
    api.get("user/get-all").then((response) => {
      setUsers(response.data.data);
    });
  };
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/lead/${router.query.id}`);
      if (!response) throw new Error("Network response was not ok");
      const result = await response.data;
      setLead(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (router.query.id) {
      fetchCountries()
        .then(() => {
          fetchData();
          fetchUser();
        })
        .catch((_) => {
          console.log("Unable to fetch countries");
        });
    }
  }, [router.query.id]);
  //@ts-ignore
  const { setLoading } = useAuth();
  const [countries, setCountries] = useState([]);

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
  const [reason, setReason] = useState("");
  const handleReason = (e: any) => {
    setReason(e.target.value);
  };
  const handleArchive = () => {
    if (reason.length < 2) {
      toast.error("Reason Required");
    } else {
      api
        .post("/archive", { leadId: router.query.id, reason: reason })
        .then((response) => {
          toast.success("Lead Archived");
          router.push("/telecaller/leads");
        })
        .catch((e) => {
          toast.error("Lead not Archived");
        });
    }
  };
  const submitForm = async (values: any) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false); // Stop loading regardless of outcome
    }
  };
  let content;

  if (error) {
    content = <div>An error has occurred</div>;
  } else if (isLoading) {
    content = <div>Loading...</div>;
  } else {
    const initialValues = {
      id: lead.id,
      call_status: "",

      first_name: lead?.first_name,
      last_name: lead?.last_name,
      gender: lead?.gender,
      secondary_number: lead?.secondary_number ?? "",
      email: lead?.email || "",
      phone_number: lead?.phone_number,
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
    content = (
      <div className="p-2.5 overflow-scroll">
        <div className="flex w-full p-2.5">
          <div className="border rounded p-2.5 w-full flex flex-col">
            <div className="header pb-2.5 px-2.5 flex w-full justify-between items-center">
              <div className="text-lg font-medium">
                {lead?.first_name}&nbsp;{lead?.last_name}
              </div>
              <div className="flex gap-2.5">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Archive data</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Are you sure you want to archive Data?
                      </DialogTitle>
                      <DialogDescription>
                        Please add a valid reason
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <>
                        <div className="col-span-2 flex flex-col">
                          <Label htmlFor="">Reason for Archive</Label>
                          <Input
                            onChange={handleReason}
                            placeholder="Write your reason.."
                          />
                        </div>
                      </>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleArchive}>
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Formik
                  initialValues={{
                    ...initialValues,
                    interested_countries: getInitialCountrySelections(),
                  }}
                  enableReinitialize
                  onSubmit={submitForm}
                >
                  {({ values, handleChange, setFieldValue }) => (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Add FollowUp Date</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <Form>
                          <DialogHeader>
                            <DialogTitle>Add a followup date</DialogTitle>
                            <DialogDescription>Followup date</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <>
                              <div className="col-span-2">
                                <Label htmlFor="call_status">Call Status</Label>
                                <select
                                  id="call_status"
                                  name="call_status"
                                  value={values.call_status}
                                  onChange={handleChange}
                                  className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Select Call Status</option>
                                  <option value="completed">Completed</option>
                                  <option value="scheduled">Scheduled</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="unable_to_connect">
                                    Unable to connect
                                  </option>
                                  <option value="others">Others</option>
                                </select>
                              </div>
                              <div className="col-span-2 flex flex-col">
                                <Label htmlFor="">Follow-up Date</Label>
                                <DatePicker
                                  //@ts-ignore
                                  selected={values?.follow_up_date}
                                  onChange={(date: Date) =>
                                    setFieldValue("follow_up_date", date)
                                  }
                                  className="block w-full mt-1 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  dateFormat="MM/dd/yyyy"
                                  peekNextMonth
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                />
                              </div>
                            </>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </Formik>
                <AssignUserModal
                  users={users}
                  leadId={lead.id}
                  fetchLeadData={fetchData}
                />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="link">Show Follow-up Dates</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>All Follow-up Dates</SheetTitle>
                      <SheetDescription>
                        All follow-up dates listed below
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      {/* Map over follow-up dates */}
                      {lead?.followUpDates.map((item: any) => {
                        const formattedDate = new Date(
                          item.date
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        });
                        return (
                          <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between leading-normal">
                            <div className="mb-2">
                              <div className="text-gray-900 font-bold text-xl mb-2 flex items-center">
                                <Calendar className="mr-2" size={20} />{" "}
                                Follow-up Date
                              </div>
                              <p className="text-gray-700 text-base">
                                {formattedDate}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <SheetFooter>
                      <SheetClose asChild></SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="link">Show Assigned User</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>All Assigned User</SheetTitle>
                      <SheetDescription>
                        All assigned users listed below
                      </SheetDescription>
                    </SheetHeader>
                    {lead?.assignedUsers.map((item: any) => {
                      return (
                        <div
                          key={item.user.id}
                          className="border rounded p-2.5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full bg-slate-100 text-center flex items-center justify-center">
                              {`${item.user.name[0].toUpperCase()}`}
                            </div>
                            <div className="flex flex-col">
                              <div className="text-left font-medium">
                                {item.user.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {item.user.role.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <SheetFooter>
                      <SheetClose asChild></SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <Separator />
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
                  <Tabs
                    defaultValue={selectedTab}
                    className="mt-2.5"
                    onValueChange={setSelectedTab}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Details</TabsTrigger>
                      <TabsTrigger value="academic">
                        Academic Details
                      </TabsTrigger>
                      <TabsTrigger value="language">Language Tests</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic">
                      {lead && (
                        <BasicDetails
                          formikProps={{
                            values,
                            handleChange,
                            setFieldValue,
                            touched,
                            errors,
                          }}
                          lead={lead}
                          initialValues={initialValues}
                          handleSubmit={submitForm}
                        />
                      )}
                    </TabsContent>
                    <TabsContent value="academic">
                      {lead && (
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
                      )}
                    </TabsContent>
                    <TabsContent value="language">
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
                    </TabsContent>
                  </Tabs>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Layout>
      <Header title="Lead Details" />
      {content}
      <LoadingSpinner loading={isSubmitting} message="Updating lead..." />
    </Layout>
  );
}
