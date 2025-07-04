import React from "react";
import Layout from "../layout";

import InstitutionVisaProcessingCount from "@/components/shared/Tables/InstitutionsVisaProcessingCount";
import Header from "@/components/shared/Header/Header";

const index = () => {
  return (
    <Layout>
      <Header title="Institutions" />
      <div className="p-2 5">
        <InstitutionVisaProcessingCount />
      </div>
    </Layout>
  );
};

export default index;
