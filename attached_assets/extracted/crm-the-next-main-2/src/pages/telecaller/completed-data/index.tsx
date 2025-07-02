import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import TelecallerLeadsTable from "@/components/common/telecaller/TelecallerLeadsTable";

const index = () => {
  return (
    <Layout>
      <Header title="Follow Up" />
      <div className="p-2.5 flex flex-col gap-2.5 max-w-full">
        <TelecallerLeadsTable
          initialStatus="completed"
          showStatusFilter={false}
        />
      </div>
    </Layout>
  );
};

export default index;
