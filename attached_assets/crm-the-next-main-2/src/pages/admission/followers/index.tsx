import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import AdmissionFollowersTable from "@/components/common/admission/AdmissionFollowersTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Followers" />
      <div className="p-2.5 overflow-scroll">
        <AdmissionFollowersTable />
      </div>
    </Layout>
  );
};

export default Index;
