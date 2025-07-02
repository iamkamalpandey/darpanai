import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import CounsellorLeadsTable from "@/components/common/counsellor/CounsellorLeadsTable";

const index = () => {
  return (
    <Layout>
      <Header title="Follow Up" />
      <div className="p-2.5 flex flex-col gap-2.5">
        <CounsellorLeadsTable initialStatus="followup" />
      </div>
    </Layout>
  );
};

export default index;
