import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

const index = () => {
  return (
    <Layout>
      <Header title="Courses" />
      <div className="p-2.5"></div>
    </Layout>
  );
};

export default index;
