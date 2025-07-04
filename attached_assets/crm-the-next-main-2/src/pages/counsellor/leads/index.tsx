import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import CounsellorLeadsTable from "@/components/common/counsellor/CounsellorLeadsTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Students" />
      <div className="p-2.5 overflow-scroll">
        <CounsellorLeadsTable />
      </div>
    </Layout>
  );
};

export default Index;
