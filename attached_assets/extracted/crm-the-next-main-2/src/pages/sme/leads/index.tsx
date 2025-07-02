import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";

import api from "@/services/api";
import { Lead } from "@/types/api-types";
import SuperAdminLeadsTable from "@/components/shared/Tables/super_admin/SuperadminLeadsTable";

const Index = () => {
  const [data, setData] = useState<Lead[]>([]);
  useEffect(() => {
    api.get("lead").then((response) => {
      setData(response.data.data);
    });
  }, []);

  return (
    <Layout>
      <Header title="Assigned Data" />
      <div className="p-2.5 overflow-scroll">
        <SuperAdminLeadsTable data={data} />
      </div>
    </Layout>
  );
};

export default Index;
