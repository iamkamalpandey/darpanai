import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
// Import the CountriesTable component you adapted for countries
import CountriesTable from "@/components/shared/Tables/CountriesTable";

import api from "@/services/api";
import { Country } from "@/types/api-types";

const Index = () => {
  const [countries, setCountries] = useState<[]>([]);

  useEffect(() => {
    fetchData();
  }, []);
  function fetchData() {
    api.get("countries").then((response: any) => {
      setCountries(response.data.data);
    });
  }
  return (
    <Layout>
      <Header title="Countries List" />
      <div className="p-2.5 overflow-scroll">
        <CountriesTable countries={countries} refetch={fetchData} />
      </div>
    </Layout>
  );
};

export default Index;
