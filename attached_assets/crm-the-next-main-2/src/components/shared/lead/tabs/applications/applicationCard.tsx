import React from "react";
import { Button } from "@/components/ui/button";
import ReactCountryFlag from "react-country-flag";
import api from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ApplicationCard = ({
  details,
  onView,
  fetchData,
}: {
  details: any;
  onView: (application: any) => void;
  fetchData: () => void;
}) => {
  const { course, startDate, endDate, state } = details;
  const { institution } = course;
  const { country } = institution;
  const handleDelete = async () => {
    if (state !== "draft") {
      toast.error("Only draft applications can be deleted.");
      return;
    }

    try {
      await api.delete(
        `course-assignment/${details.leadId}/${details.courseId}`
      );
      toast.success("Application successfully deleted.");
      fetchData(); // Refresh the data after deletion
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete application. Please try again.");
    }
  };
  const { user } = useAuth();
  return (
    <div className="col-span-2 border rounded-lg shadow-lg bg-white p-6 flex flex-col gap-4">
      <div className="text-xl font-semibold flex items-center text-gray-900 gap-2.5 ">
        <ReactCountryFlag countryCode={country.signature} />
        {country.name}
      </div>
      <div>{course.name}</div>
      <div className="flex items-center text-gray-700">
        {institution.name}, {institution.city}
      </div>
      <hr className="border-gray-300" />
      <div className="flex items-center w-full justify-between">
        <div className="flex text-gray-700 flex-col">
          <div className="font-semibold">Product Fees </div>
          <div className="text-green-800 font-semibold">USD 0.00/year</div>
        </div>
        <div className="flex text-gray-700 flex-col">
          <div className="font-semibold">Currency</div>
          <div>USD</div>
        </div>
        <div className="flex text-gray-700 flex-col">
          <div className="font-semibold">Exchange Rate</div>
          <div>123 NPR</div>
        </div>
      </div>
      <hr className="border-gray-300" />
      <div className="flex justify-between items-center text-gray-700">
        <div className="flex flex-col">
          <div className="font-semibold">Expected Start Date</div>
          <div>{new Date(startDate).toLocaleDateString()}</div>
        </div>
        <div className="flex flex-col">
          <div className="font-semibold">Expected End Date</div>
          <div>{endDate ? new Date(endDate).toLocaleDateString() : "-"}</div>
        </div>
      </div>
      <hr className="border-gray-300" />
      <div className="self-start">
        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
            state === "draft"
              ? "bg-gray-500"
              : state === "applied"
              ? "bg-blue-500"
              : state === "accepted"
              ? "bg-green-500"
              : state === "rejected"
              ? "bg-red-500"
              : state === "enrolled"
              ? "bg-purple-500"
              : "bg-gray-400"
          }`}
        >
          {state.charAt(0).toUpperCase() + state.slice(1)}
        </span>
      </div>

      <div className="flex justify-between items-center gap-2.5">
        <Button onClick={() => onView(details)} className="flex-1">
          View
        </Button>
        {state === "draft" && user.role.name === "super_admin" && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;
