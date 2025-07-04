import React, { useEffect, useState } from "react";
import Layout from "../layout";

const greetingTime = require("greeting-time");
import date from "date-and-time";

import Header from "@/components/shared/Header/Header";
import { useAuth } from "@/contexts/AuthContext";
import LeadsTable from "@/components/shared/Tables/leads/LeadsTable";
import api from "@/services/api";
import { Lead } from "@/types/api-types";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import SuperAdminLeadsTable from "@/components/shared/Tables/super_admin/SuperadminLeadsTable";
const index = () => {
  const now = new Date();
  //@ts-ignore
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<any>({});
  useEffect(() => {
    api.get("frontdesk-dashboard").then((response) => {
      setDashboard(response.data.data);
    });
  }, []);
  let branchId = 0;
  if (user.UserBranch && user.UserBranch.length > 0) {
    branchId = user.UserBranch[0].branchId;
  }
  return (
    <Layout>
      <Header title="Dashboard" />
      <div className="flex w-full flex-col p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col w-full">
            <div className="flex w-full flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium">
                    {greetingTime(new Date())}, &nbsp;{user.name}
                  </h2>

                  <p className="text-sm font-medium text-slate-700">
                    {date.format(now, "ddd, MMM DD YYYY")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Link href={`/register?branch_id=${branchId}`} target={"_blank"}>
            <Button className="min-w-[100px]" variant="outline">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Office Check-In form
            </Button>
          </Link>
        </div>

        <div className="  flex w-full flex-col  mb-2.5">
          <div className="mt-5 grid grid-cols-4 w-full gap-5 ">
            <div
              key="1"
              className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-white">
                Total Visitors
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {dashboard.visitors}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-white">
                New Visitors
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {0}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-red-500 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-white">
                Follow Ups
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {0}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-white">
                Visa Visitors
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {0}
              </dd>
            </div>
          </div>
        </div>
        <div>
          <SuperAdminLeadsTable />
        </div>
      </div>
    </Layout>
  );
};

export default index;
