import { formatDate } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import EmptyRemarks from "@/assets/images/empty-remarks.svg";

const ActivitiesTab = ({ lead }: { lead: any }) => {
  const hasActivities = lead?.ActivityLog.length > 0;
  return (
    <div className="flex flex-col space-y-4">
      {!hasActivities && (
        <div className="flex flex-col items-center justify-center gap-2.5">
          <Image
            src={EmptyRemarks}
            alt="No remarks"
            className="w-full h-40 object-contain "
          />
          <div>No Activities yet!</div>
        </div>
      )}
      {hasActivities &&
        lead?.ActivityLog.map((item: any) => {
          const userInitials = item.user.name.match(/\b\w/g) || [];
          const userName = userInitials.shift();

          return (
            <div className="bg-white rounded-lg shadow-md p-4 border">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 mr-2 items-center justify-center text-center">
                  <span className="self-center text-gray-600 text-sm mx-auto">
                    {userName}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item.user.name}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700 font-semibold">
                {item.type}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {item.description}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {formatDate(item.createdAt)}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ActivitiesTab;
