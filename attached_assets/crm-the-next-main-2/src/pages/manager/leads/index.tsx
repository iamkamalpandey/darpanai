import React from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import LeadsTable from "./components/LeadsTable";
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminLeadsTable from "@/components/shared/Tables/super_admin/SuperadminLeadsTable";

const Index = () => {
  const { user } = useAuth();
  return (
    <Layout>
      <Header title="Assigned Data" />
      <div className="p-2.5 overflow-scroll">
        {user.id === "104346bf-4be3-4c26-8e99-0ee52b0ea316" ? (
          <SuperAdminLeadsTable />
        ) : (
          <LeadsTable />
        )}
      </div>
    </Layout>
  );
};

export default Index;
