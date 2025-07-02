import React, { useEffect, useState } from "react";

import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import SuperAdminTelecallerTable from "@/components/shared/Tables/super_admin/SuperadminTelecallerTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Telecaller" />
      <div className="p-2.5">
        <SuperAdminTelecallerTable />
      </div>
    </Layout>
  );
};

export default Index;
