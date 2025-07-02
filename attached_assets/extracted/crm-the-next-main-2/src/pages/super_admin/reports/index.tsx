import React from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import ReportsDashboard from "@/components/shared/report/ReportStats";

const index = () => {
  return (
    <Layout>
      <Header title="Reports" />
      <ReportsDashboard />
    </Layout>
  );
};

export default index;
