import React from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import CounsellorsTable from "./components/CounsellorsTable";

const Index = () => {
  return (
    <Layout>
      <Header title="Counsellors" />
      <div className="p-2.5">
        <CounsellorsTable />
      </div>
    </Layout>
  );
};

export default Index;
