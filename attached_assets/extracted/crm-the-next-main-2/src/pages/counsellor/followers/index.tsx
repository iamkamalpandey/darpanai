import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import CounsellorFollowersTable from "@/components/common/counsellor/CounsellorFollowersTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Followers" />
      <div className="p-2.5 overflow-scroll">
        <CounsellorFollowersTable />
      </div>
    </Layout>
  );
};

export default Index;
