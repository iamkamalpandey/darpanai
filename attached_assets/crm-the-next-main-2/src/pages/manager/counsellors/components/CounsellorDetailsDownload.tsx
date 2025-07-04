import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const CounsellorDetailsDownload = ({ counsellorDetails }) => {
  const generateCSV = () => {
    // Create CSV headers
    const headers = [
      "Counsellor Name",
      "Email",
      "Role",
      "Hot Leads",
      "Warm Leads",
      "Cold Leads",
      "Unassigned Leads",
      "Total Leads",
    ];

    // Calculate total leads
    const totalLeads =
      counsellorDetails.hotCount +
      counsellorDetails.warmCount +
      counsellorDetails.coldCount +
      counsellorDetails.unassigned;

    // Create CSV data row
    const data = [
      counsellorDetails.counsellor.name,
      counsellorDetails.counsellor.email,
      counsellorDetails.counsellor.role.name,
      counsellorDetails.hotCount,
      counsellorDetails.warmCount,
      counsellorDetails.coldCount,
      counsellorDetails.unassigned,
      totalLeads,
    ];

    // Combine headers and data
    const csvContent = [headers.join(","), data.join(",")].join("\n");

    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${counsellorDetails.counsellor.name}_leads_report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={generateCSV}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      <Download size={16} />
      Download Report
    </Button>
  );
};

export default CounsellorDetailsDownload;
