import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import api from "@/services/api";
import { Lead } from "@/types/api-types";
import AdmissionFollowupTable from "@/components/shared/Tables/admission/AdmissionFollowupTable";

const index = () => {
  const [folloupData, setFollowUpData] = useState<Lead[]>([]);
  useEffect(() => {
    // api.get("telecaller/dashboard").then((response) => {
    //   setData(response.data.data);
    // });
    api
      .get("follow-up-user", {
        params: {
          search: "",
        },
      })
      .then((response) => {
        setFollowUpData(response.data.data);
      });
  }, []);
  return (
    <Layout>
      <Header title="Follow Up" />
      <div className="p-2.5">
        <AdmissionFollowupTable data={folloupData} />
      </div>
    </Layout>
  );
};

export default index;
