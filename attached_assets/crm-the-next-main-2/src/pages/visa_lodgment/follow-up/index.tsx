import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import api from "@/services/api";
import { Lead } from "@/types/api-types";
import TelecallerLeadsTable from "@/components/common/telecaller/TelecallerLeadsTable";

const index = () => {
  const [data, setData] = useState<Lead[]>([]);
  useEffect(() => {
    api.get("telecaller/followup").then((response) => {
      setData(response.data.data);
    });
  }, []);
  return (
    <Layout>
      <Header title="Follow Up" />
      <div className="p-2.5 flex flex-col gap-2.5">
        <TelecallerLeadsTable data={data} />
      </div>
    </Layout>
  );
};

export default index;
