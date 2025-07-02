import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import LeadsTable from "@/components/shared/Tables/leads/LeadsTable";
import api from "@/services/api";
import { Lead } from "@/types/api-types";

const index = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    api.get("visit-history").then((response) => {
      setData(response.data.data);
    });
  }, []);
  const leads = data.map((item) => item?.lead);
  return (
    <Layout>
      <Header title="Todays visitors" />
      <LeadsTable identifier={"frontdesk"} data={leads} />
    </Layout>
  );
};

export default index;
