import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeftCircle,
  Send,
  FileX2,
  FileCheck2,
  Stamp,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { GiPassport } from "react-icons/gi";

const stats = [
  { title: "Leads Assigned", value: 150, icon: Users, color: "text-blue-600" },
  {
    title: "Offer Applied",
    value: 120,
    icon: FileText,
    color: "text-green-600",
  },
  {
    title: "Offer Received- Conditional",
    value: 80,
    icon: AlertCircle,
    color: "text-yellow-600",
  },
  {
    title: "Offer Received- Un-Conditional",
    value: 60,
    icon: CheckCircle,
    color: "text-emerald-600",
  },
  { title: "Offer Rejected", value: 10, icon: XCircle, color: "text-red-600" },
  {
    title: "Offer Withdrawn",
    value: 5,
    icon: ArrowLeftCircle,
    color: "text-gray-600",
  },
  { title: "GS Submitted", value: 70, icon: Send, color: "text-purple-600" },
  { title: "GS Rejected", value: 8, icon: FileX2, color: "text-pink-600" },
  { title: "GS Approved", value: 62, icon: FileCheck2, color: "text-teal-600" },
  {
    title: "CAS/LOA/CoE/COA Received",
    value: 55,
    icon: GiPassport,
    color: "text-indigo-600",
  },
  { title: "Visa Applied", value: 50, icon: Stamp, color: "text-orange-600" },
  {
    title: "Visa Accepted",
    value: 45,
    icon: CheckSquare,
    color: "text-lime-600",
  },
  { title: "Visa Refused", value: 5, icon: XSquare, color: "text-rose-600" },
];

const StatsCard = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (event) => {
    setStartDate(new Date(event.target.value));
  };

  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value));
  };

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Application Statistics Dashboard
      </h1>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <label htmlFor="startDate" className="mr-2 font-medium">
            From:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate?.toISOString().slice(0, 10) || ""}
            onChange={handleStartDateChange}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="endDate" className="mr-2 font-medium">
            To:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate?.toISOString().slice(0, 10) || ""}
            onChange={handleEndDateChange}
            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-gray-100">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-gray-800">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StatsCard;
