import LeadDetails from "@/components/shared/lead/lead-details";
import React from "react";
import { useRouter } from "next/router";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
const index = () => {
  const router = useRouter();
  const leadId = router.query.id;
  return (
    <div>
      {
        <Layout>
          <Header title={"Student Details"} />
          <LeadDetails
            //@ts-ignore
            leadId={leadId}
          />
        </Layout>
      }
    </div>
  );
};

export default index;
