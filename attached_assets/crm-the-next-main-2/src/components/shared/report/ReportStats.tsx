//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/services/api";
import StatsCard from "./stats-cards";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const ReportsDashboard = () => {
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await api.get("/reports/stats");
        const data = await response.data;
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      }
    };

    fetchReportData();
  }, []);

  if (!reportData) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <StatsCard />
      <h1 className="text-3xl font-bold">Lead Stage Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads by Telecaller Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Telecaller Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.leadsByTelecaller}
                  dataKey="_count"
                  nameKey="profile_status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {reportData.leadsByTelecaller.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by Counsellor Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.leadsByCounsellor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leads by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.leadsBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Counsellor Performance */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Counsellor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Counsellor lead stage breakdown</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Leads In Progress</TableHead>
                  <TableHead>Completed Leads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.counsellorPerformance.map((counsellor, index) => (
                  <TableRow key={index}>
                    <TableCell>{counsellor.name}</TableCell>
                    <TableCell>{counsellor.email}</TableCell>
                    <TableCell>{counsellor.totalLeads}</TableCell>
                    <TableCell>{counsellor.leadsInProgress}</TableCell>
                    <TableCell>{counsellor.completedLeads}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsDashboard;
