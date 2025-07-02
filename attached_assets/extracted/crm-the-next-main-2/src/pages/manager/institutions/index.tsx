import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";
import InstitutionTable from "@/components/shared/Tables/institutions/InstitutionsTable";
import api from "@/services/api";
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
