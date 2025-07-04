import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ReactCountryFlag from "react-country-flag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import StagesTab from "./tabs/Stages";
import DocumentsTab from "../documents";
import ApplicationDocuments from "./tabs/DocumentsTab";
import NotesTab from "./tabs/NotesTab";
import api from "@/services/api";
import ApplicationStateSelector from "@/components/common/ApplicationStateSelector";

const ApplicationDetail = ({
  lead,
  application,
  onBack,
  fetchData,
}: {
  lead: any;
  application: any;
  onBack: () => void;
  fetchData: any;
}) => {
  const { course, startDate, endDate, state } = application;
  const { institution } = course;
  const { country } = institution;

  const [selectedTab, setSelectedTab] = useState("stages");
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  const handleStateChange = async (newState) => {
    setIsUpdatingState(true);
    try {
      await api.post(
        `course-assignment/${lead.id}/${application.course.id}/state`,
        { state: newState }
      );
      fetchData(); // Refresh data after successful update
    } catch (error) {
      console.error("Failed to update state:", error);
      // Add error handling/notification here
    } finally {
      setIsUpdatingState(false);
      fetchData();
    }
  };
  return (
    <div className="border rounded-lg p-4 shadow-lg bg-white">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold flex items-center text-gray-900 gap-4">
            <Button
              onClick={onBack}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <ChevronLeft />
            </Button>
            <ReactCountryFlag countryCode={country.signature} svg />
            <span className="uppercase">{country.name}</span>
          </div>
          <ApplicationStateSelector
            currentState={application.state}
            onStateChange={handleStateChange}
            isLoading={isUpdatingState}
          />
          {/* 
          <span
            className={`px-4 py-2 rounded-full text-white text-sm font-medium ${
              state === "draft" ? "bg-gray-500" : "bg-green-500"
            }`}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </span> */}
        </div>

        <div className="text-xl font-semibold mt-1">{course.name}</div>
        <div className="text-md text-gray-700 mt-1">
          {institution.name}, {institution.city}
        </div>
        <hr className="my-3" />
        <div className="grid grid-cols-3 gap-4">
          <div className="text-gray-800">
            <div className="font-semibold">Product Fees</div>
            <div className="text-red-600 font-bold">USD 0.00/year</div>
          </div>
          <div className="text-gray-800">
            <div className="font-semibold">Currency</div>
            <div>USD</div>
          </div>
          <div className="text-gray-800">
            <div className="font-semibold">Exchange Rate</div>
            <div>123 NPR</div>
          </div>
        </div>
        <hr className="my-3" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold">Expected Start Date</div>
            <div>{new Date(startDate).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="font-semibold">Expected End Date</div>
            <div>{endDate ? new Date(endDate).toLocaleDateString() : "-"}</div>
          </div>
        </div>
        <hr className="my-3" />

        {/* Tabs for additional details */}
        <div className="mt-4">
          <Tabs
            defaultValue={selectedTab}
            onValueChange={setSelectedTab}
            className="flex flex-col"
          >
            <TabsList className="flex mb-1">
              <TabsTrigger value="stages" className="flex-1 text-center">
                Stages
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex-1 text-center">
                Documents
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 text-center">
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="stages" className="p-4 border-t">
              <StagesTab
                lead={lead}
                fetchData={fetchData}
                selectedCourse={course}
              />
            </TabsContent>
            <TabsContent value="documents" className="p-4 border-t">
              <ApplicationDocuments
                lead={lead}
                fetchData={fetchData}
                currentCourseId={course.id}
              />
            </TabsContent>
            <TabsContent value="notes" className="p-4 border-t">
              <NotesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
