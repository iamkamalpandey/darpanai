// File: components/StatusBadge.tsx

import React from "react";

interface StatusBadgeProps {
  type: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type }) => {
  const colorClass =
    {
      hot: "bg-red-100 text-red-800",
      warm: "bg-yellow-100 text-yellow-800",
      cold: "bg-blue-100 text-blue-800",
      lost: "bg-gray-100 text-gray-800",
    }[type] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
    >
      {type || "Unknown"}
    </span>
  );
};
