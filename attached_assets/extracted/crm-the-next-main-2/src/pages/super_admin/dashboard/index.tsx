import React, { useEffect, useState } from "react";
import Layout from "../layout";
import api from "@/services/api";

const greetingTime = require("greeting-time");
import date from "date-and-time";
import Header from "@/components/shared/Header/Header";
import { DateRangePicker } from "@/components/shared/DatePicker/daterangepicker";
import VisitorStats from "./components/visitor-stats";
import { useAuth } from "@/contexts/AuthContext";
import LeadStats from "./components/lead-stats";

const index = () => {
  const now = new Date();
  //@ts-ignore
  const { user } = useAuth();
  return (
    <Layout>
      <div className="flex w-full">
        <div className="flex flex-col w-full">
          <Header title="Dashboard" />
          <div className="flex w-full flex-col px-6 gap-5  my-2.5 ">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-medium">
                  {greetingTime(new Date())}, {user.name}
                </h2>

                <p className="text-sm font-medium text-slate-700">
                  {date.format(now, "ddd, MMM DD YYYY")}
                </p>
              </div>
            </div>

            <VisitorStats />
            {/* <LeadStats /> */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default index;
