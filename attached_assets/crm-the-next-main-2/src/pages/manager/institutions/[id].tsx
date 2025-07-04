import React from "react";
import Layout from "../layout";

import Header from "@/components/shared/Header/Header";

const index = () => {
  return (
    <Layout>
      <Header title="Institution Details" />
      <div className="p-2.5 gap-2.5 flex flex-col">
        <div className="rounded p-2.5 border gap-2.5">
          <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-4">
            Deakin University
            <div className="rounded-full px-2.5 border max-w-fit text-sm font-medium ">
              Australia
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 w-full gap-5 ">
          <div
            key="1"
            className="w-full rounded-lg bg-blue-500 px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-white">
              Total Students
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {10 ?? 0}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-green-500 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-white">Student</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {10 ?? 0}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-red-500 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-white">
              Follow Ups
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {10 ?? 0}
            </dd>
          </div>
          <div className="overflow-hidden rounded-lg bg-gray-600 px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-white">
              Visa Visitors
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {10 ?? 0}
            </dd>
          </div>
        </div>
        {/* <InstitutionStudentsTable /> */}
      </div>
    </Layout>
  );
};

export default index;
