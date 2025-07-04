import React from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import CounsellorLeadsTable from "@/components/common/counsellor/CounsellorLeadsTable";

const index = () => {
  return (
    <Layout>
      <Header title="Completed Data" />
      <div className="p-2.5 ">
        <CounsellorLeadsTable initialStatus="completed" />
      </div>
    </Layout>
  );
};

export default index;
