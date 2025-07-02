import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import ActivitiesTab from "./activities";
import EducationTab from "./education";
import LanguageTestTab from "./language";
import RemarksTab from "./remarks";
import VisitHistoryTab from "./visits";
import ApplicationsTab from "./application";
import DocumentsTab from "./documents";

const MainTabs = ({
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
  const [selectedTab, setSelectedTab] = useState("basic");

  return (
    <div className=" border p-2.5 flex-1">
      <Tabs
        defaultValue={selectedTab}
        className="mt-2.5"
        onValueChange={setSelectedTab}
      >
        <TabsList className="grid w-full grid-cols-4 rounded-none rounded-t-lg ">
          <TabsTrigger value="basic">Activities</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="language_tests">Langugage Tests</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <TabsList className="grid w-full grid-cols-4 rounded-none rounded-b-lg">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes_terms">Remarks</TabsTrigger>
          <TabsTrigger value="visit_history">Visit History</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <>
            <ActivitiesTab lead={lead} />
          </>
        </TabsContent>
        <TabsContent value="education">
          <>
            <EducationTab
              lead={lead}
              fetchData={fetchData}
              initialValues={initialValues}
              countries={countries}
              getInitialCountrySelections={getInitialCountrySelections}
            />
          </>
        </TabsContent>
        <TabsContent value="language_tests">
          <>
            <LanguageTestTab
              lead={lead}
              fetchData={fetchData}
              initialValues={initialValues}
              countries={countries}
              getInitialCountrySelections={getInitialCountrySelections}
            />
          </>
        </TabsContent>
        <TabsContent value="documents">
          <>
            <DocumentsTab lead={lead} fetchData={fetchData} />
          </>
        </TabsContent>
        <TabsContent value="notes_terms">
          <>
            <RemarksTab lead={lead} fetchData={fetchData} />
          </>
        </TabsContent>
        <TabsContent value="applications">
          <>
            {" "}
            <ApplicationsTab lead={lead} fetchData={fetchData} />{" "}
          </>
        </TabsContent>

        <TabsContent value="visit_history">
          <VisitHistoryTab data={lead.VisitHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainTabs;
