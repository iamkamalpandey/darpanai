import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

import api from "@/services/api";
import { Lead } from "@/types/api-types";

const index = () => {
  return (
    <Layout>
      <Header title="Follow Up" />
      <div className="p-2.5 flex flex-col gap-2.5 max-w-full"></div>
    </Layout>
  );
};

export default index;
