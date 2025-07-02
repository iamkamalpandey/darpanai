import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import TelecallerLeadsTable from "@/components/common/telecaller/TelecallerLeadsTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Assigned Data" />
      <div className="p-2.5 w-full">
        <TelecallerLeadsTable />
      </div>
    </Layout>
  );
};

export default Index;
