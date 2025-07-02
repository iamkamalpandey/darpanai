import React, { useEffect, useState } from "react";

const greetingTime = require("greeting-time");
import date from "date-and-time";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import { Lead } from "@/types/api-types";
import api from "@/services/api";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";
import CounsellorLeadsTable from "@/components/common/counsellor/CounsellorLeadsTable";

const index = () => {
  //@ts-ignore
  const { user } = useAuth();

  const now = new Date();
  const [folloupData, setFollowUpData] = useState<Lead[]>([]);
  let branchId = 0;
  if (user.UserBranch && user.UserBranch.length > 0) {
    branchId = user.UserBranch[0].branchId;
  }

  const [searchParam, setSearchParam] = useState<string>("");

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchData();
    }, 200);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [searchParam]);

  const fetchData = async () => {
    try {
      const response = await api.get(`follow-up-user?search=${searchParam}`);
      setFollowUpData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <Header title={"Dashboard"} />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col w-full p-2.5">
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
            Add Lead Form
          </Button>
        </Link>
      </div>
      <div className=" p-2.5 grid grid-cols-4 w-full gap-5 ">
        <div
          key="1"
          className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-white">
            Total Leads
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {user._count.assignedLeads ?? 0}
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-white">
            Follow Ups
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {folloupData.length ?? 0}
          </dd>
        </div>
        {/* <div className="overflow-hidden rounded-lg bg-gray-500 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-white">
            Archived Data
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {user._count.archivedLeads ?? 0}
          </dd>
        </div> */}
        <div className="overflow-hidden rounded-lg bg-red-600 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-white">
            Remarks Given
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {user._count.remarks ?? 0}
          </dd>
        </div>
      </div>
      <div className="flex flex-col w-full p-2.5 gap-2.5">
        <h2 className="font-medium text-2xl underline underline-offset-8">
          Follow Up
        </h2>

        <CounsellorLeadsTable initialStatus="followup" />
      </div>
    </Layout>
  );
};

export default index;
