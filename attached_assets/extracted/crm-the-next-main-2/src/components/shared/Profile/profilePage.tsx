import { useEffect, useState } from "react";
import { Calendar, Mail, Building } from "lucide-react";
import api from "@/services/api";

export default function ProfilePage({ user }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [branches, setBranches] = useState([]);

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get("branch");
        setBranches(response.data.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  // Find user's branch using real branch data
  const userBranch = branches.find(
    (branch) => branch.id === user?.UserBranch[0]?.branchId
  );

  // Selected key metrics to highlight
  const keyMetrics = [
    { label: "Leads", value: user._count.assignedLeads },
    { label: "Remarks", value: user._count.remarks },
    { label: "Follow-ups", value: user._count.followUpDates },
    { label: "Calls", value: user._count.CallHistory },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - User profile card */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold shadow-lg">
                      {getInitials(user.name)}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                  </div>
                </div>
                <h2 className="text-white text-center text-xl font-bold mt-4">
                  {user.name}
                </h2>
                <div className="mt-1 bg-blue-400 bg-opacity-30 text-white text-center py-1 px-3 rounded-full text-sm inline-block mx-auto">
                  {user.role.name}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>

                  {userBranch && (
                    <div className="flex items-center text-gray-700">
                      <Building className="w-5 h-5 mr-3 text-blue-500" />
                      <span className="text-sm">{userBranch.name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                    <span className="text-sm">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard */}
          <div className="w-full md:w-2/3">
            {/* Tabs navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-4 text-center font-medium ${
                    activeTab === "overview"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`flex-1 py-4 text-center font-medium ${
                    activeTab === "activity"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  Activity
                </button>
              </div>
            </div>

            {/* Key metrics */}
            {activeTab === "overview" && (
              <>
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Key Performance
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {keyMetrics.map((metric, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-4 text-center"
                        >
                          <div className="text-2xl font-bold text-blue-600">
                            {metric.value.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent activity summary */}
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Activity Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <div className="text-gray-800 font-medium">
                              Activity Logs
                            </div>
                            <div className="text-sm text-gray-500">
                              Total recorded activities
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {user._count.ActivityLog.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <div className="text-gray-800 font-medium">
                              Archived Leads
                            </div>
                            <div className="text-sm text-gray-500">
                              Completed or closed leads
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {user._count.archivedLeads.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <div className="w-2 h-8 bg-yellow-500 rounded-full mr-3"></div>
                          <div>
                            <div className="text-gray-800 font-medium">
                              Assigned Followers
                            </div>
                            <div className="text-sm text-gray-500">
                              Team members assigned
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {user._count.assignedFollowers.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Activity details */}
            {activeTab === "activity" && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Detailed Activity
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(user._count).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-md">
                        <div className="text-sm text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div className="text-xl font-semibold text-gray-800">
                          {value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
