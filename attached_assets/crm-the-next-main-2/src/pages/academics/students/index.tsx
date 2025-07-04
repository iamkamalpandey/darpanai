import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import AdminLeadsTable from "@/components/shared/Tables/leads/AdminLeadsTable";
import SuperAdminLeadsTable from "@/components/shared/Tables/super_admin/SuperadminLeadsTable";
import AcademicsStudentsTable from "@/components/shared/Tables/academics/StudentsTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Students =" />
      <div className="p-2.5 overflow-scroll">
        <AcademicsStudentsTable />
      </div>
    </Layout>
  );
};

export default Index;
