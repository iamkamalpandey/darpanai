import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderIcon } from "lucide-react";

const ApplicationStateSelector = ({
  currentState,
  onStateChange,
  isLoading = false,
}) => {
  const states = [
    { value: "draft", label: "Draft", color: "bg-gray-500" },
    { value: "applied", label: "Applied", color: "bg-blue-500" },
    { value: "accepted", label: "Accepted", color: "bg-green-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
    { value: "enrolled", label: "Enrolled", color: "bg-purple-500" },
  ];

  const getStateColor = (stateValue) => {
    return (
      states.find((state) => state.value === stateValue)?.color || "bg-gray-500"
    );
  };

  const handleStateChange = (newState) => {
    onStateChange(newState);
  };

  return (
    <div className="relative">
      <Select
        value={currentState}
        onValueChange={handleStateChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            {isLoading && <LoaderIcon className="w-4 h-4 animate-spin" />}
            <div
              className={`w-3 h-3 rounded-full ${getStateColor(currentState)}`}
            />
            <SelectValue placeholder="Select state" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {states.map((state) => (
            <SelectItem
              key={state.value}
              value={state.value}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${state.color}`} />
                {state.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ApplicationStateSelector;
