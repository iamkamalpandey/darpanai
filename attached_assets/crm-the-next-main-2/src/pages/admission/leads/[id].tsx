import React from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import LeadDetails from "@/components/shared/lead/lead-details";
import { useRouter } from "next/router";
const index = () => {
  const router = useRouter();
  return (
    <Layout>
      <Header title={"User Details"} identifier={"admission"} />
      {router && <LeadDetails leadId={router.query.id} />}
    </Layout>
  );
};

export default index;
