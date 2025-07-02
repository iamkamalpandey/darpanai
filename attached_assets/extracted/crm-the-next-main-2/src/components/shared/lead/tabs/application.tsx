import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import InstitutionDropdown from "../../dropdown/InstitutionDropdown";
import CourseDropdown from "../../dropdown/CourseDropdown";
import { toast } from "sonner";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "@/services/api";
import ApplicationDetail from "./applications/ApplicationDetail";
import ApplicationCard from "./applications/applicationCard";

const ApplicationsTab = ({
  lead,
  fetchData,
}: {
  lead: any;
  fetchData: any;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  const handleInstitutionSelect = (institution: any) => {
    setSelectedInstitution(institution);
    setSelectedCourse(null); // Reset course selection when institution changes
  };

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
  };

  const formik = useFormik({
    initialValues: {
      leadId: "",
      institutionId: "",
      courseId: "",
    },
    onSubmit: (values, { setSubmitting, resetForm }) => {
      const payload = {
        leadId: lead.id,
        //@ts-ignore
        institutionId: selectedInstitution?.id,
        //@ts-ignore
        courseId: selectedCourse?.id,
        state: "draft",
      };
      api.post("course-assignment", payload).then(() => {
        setSubmitting(false);
        resetForm();
        setIsDialogOpen(false);
        toast.success("Course Assigned Successfully!");
        fetchData();
      });
    },
  });

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
  };

  const handleBackToList = () => {
    setSelectedApplication(null);
  };

  return (
    <>
      {selectedApplication ? (
        <ApplicationDetail
          lead={lead}
          fetchData={fetchData}
          application={selectedApplication}
          onBack={handleBackToList}
        />
      ) : (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                Assign Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={formik.handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Assign Course</DialogTitle>
                  <DialogDescription>
                    Assign a course to an institution here
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="institution">Institution Name</Label>
                  <InstitutionDropdown
                    onInstitutionSelect={handleInstitutionSelect}
                  />
                </div>
                {selectedInstitution && (
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="course">Course Name</Label>
                    <CourseDropdown
                      institutionId={
                        //@ts-ignore
                        selectedInstitution.id
                      }
                      onCourseSelect={handleCourseSelect}
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="grid grid-cols-4 p-2.5 gap-2.5">
            {lead.LeadCourses.filter((item: any) => !item.isDeleted).map(
              (item: any) => (
                <ApplicationCard
                  key={item.courseId}
                  details={item}
                  onView={handleViewApplication}
                  fetchData={fetchData}
                />
              )
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ApplicationsTab;
