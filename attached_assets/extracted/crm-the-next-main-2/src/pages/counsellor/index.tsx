import React from "react";
import Layout from "./layout";
const greetingTime = require("greeting-time");
import date from "date-and-time";
import { useAuth } from "@/contexts/AuthContext";
const index = () => {
  //@ts-ignore
  const { user } = useAuth();
  const now = new Date();

  return (
    <Layout>
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
    </Layout>
  );
};

export default index;
