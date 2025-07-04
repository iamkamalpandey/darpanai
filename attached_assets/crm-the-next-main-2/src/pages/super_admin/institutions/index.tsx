import React from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import InstitutionsTable from "@/components/shared/Tables/institutions/InstitutionsPaginated";

const index = () => {
  return (
    <Layout>
      <Header title="Institutions" />
      <div className="p-2 5">
        <InstitutionsTable />
      </div>
    </Layout>
  );
};

export default index;
