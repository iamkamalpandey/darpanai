//@ts-nocheck
import React, { useEffect, useState } from "react";
import Layout from "../layout";
import Header from "@/components/shared/Header/Header";
import { useRouter } from "next/router";
import api from "@/services/api";
import PieChart from "@/components/shared/PieChart";
import CounsellorsLeadsTable from "./components/CounsellorsLeadsTable";
import CounsellorDetailsDownload from "./components/CounsellorDetailsDownload";

const index = () => {
  const router = useRouter();
  const [counsellorDetails, setCounsellorDetails] = useState(null);

  useEffect(() => {
    if (router.query.id) {
      api
        .get(`counsellor/counsellor-details/${router.query.id}`)
        .then((response) => {
          setCounsellorDetails(response.data);
        });
    }
  }, [router.query.id]);

  if (!counsellorDetails) {
    return (
      <Layout>
        <Header title={"Counsellor"} />
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title={"Counsellor"} />
      <div className=" mx-auto p-2.5 flex flex-col w-full">
        <div className="bg-white border rounded-lg p-6 mb-6 shadow-md">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className="flex gap-2.5 items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4">
                  {counsellorDetails.counsellor.name}
                </h2>
                <CounsellorDetailsDownload
                  counsellorDetails={counsellorDetails}
                />
              </div>

              <p className="text-gray-600">
                <strong>Email:</strong> {counsellorDetails.counsellor.email}
              </p>
              <p className="text-gray-600">
                <strong>Role ID:</strong>{" "}
                {counsellorDetails.counsellor.role.name}
              </p>

              <div className="mt-4">
                <p className="mb-2 text-gray-600">
                  <strong>Lead Distribution:</strong>
                </p>
                <div className="flex items-center mb-2">
                  <span className="inline-block w-4 h-4 mr-2 bg-red-500 rounded-full"></span>
                  <p className="text-gray-600">
                    Hot Leads: {counsellorDetails.hotCount}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <span className="inline-block w-4 h-4 mr-2 bg-yellow-500 rounded-full"></span>
                  <p className="text-gray-600">
                    Warm Leads: {counsellorDetails.warmCount}
                  </p>
                </div>
                <div className="flex items-center mb-2">
                  <span className="inline-block w-4 h-4 mr-2 bg-blue-500 rounded-full"></span>
                  <p className="text-gray-600">
                    Cold Leads: {counsellorDetails.coldCount}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-4 h-4 mr-2 bg-gray-500 rounded-full"></span>
                  <p className="text-gray-600">
                    Unknown Leads: {counsellorDetails.unassigned}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-2/12 p-6 ">
              <PieChart data={counsellorDetails} />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Assigned Leads</h3>

        <CounsellorsLeadsTable userId={router.query.id} />
      </div>
    </Layout>
  );
};

export default index;
