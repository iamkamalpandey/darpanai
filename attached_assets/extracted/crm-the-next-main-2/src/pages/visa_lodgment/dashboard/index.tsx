import React, { useEffect, useState } from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";
import api from "@/services/api";
import { Lead } from "@/types/api-types";

const index = () => {
  const [data, setData] = useState({});
  const [folloupData, setFollowUpData] = useState<Lead[]>([]);
  useEffect(() => {
    api.get("telecaller/dashboard").then((response) => {
      setData(response.data.data);
    });
  }, []);

  return (
    <Layout>
      <div className="flex w-full">
        <div className="flex flex-col w-full">
          <Header title="Dashboard" />
          <div className="flex w-full flex-col px-6 gap-5  my-2.5 ">
            <div className="  flex w-full flex-col  ">
              <h2 className="font-medium text-2xl underline underline-offset-8">
                User Stats
              </h2>
              <div className="mt-5 grid grid-cols-4 w-full gap-5 ">
                <div
                  key="1"
                  className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
                >
                  <dt className="truncate text-sm font-medium text-white">
                    Currently Assigned Data
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {
                      //@ts-ignore
                      data?.assignedData
                    }
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Pending Follow Up
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {
                      //@ts-ignore
                      data?.upcomingFollowUp
                    }
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-red-500 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Completed Data
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {
                      //@ts-ignore
                      data?.completedData
                    }
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Archived Leads
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {
                      //@ts-ignore
                      data?.archivedData
                    }
                  </dd>
                </div>
                <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-white">
                    Total Leads
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {
                      //@ts-ignore
                      data?.total
                    }
                  </dd>
                </div>
              </div>
            </div>
            <h2 className="font-medium text-2xl underline underline-offset-8">
              Follow Up
            </h2>
            {/* <TelecallerLeadsTable data={folloupData} /> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default index;
