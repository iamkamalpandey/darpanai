// Create a new file: components/shared/LoadingSpinner.jsx
import React from "react";
import { ClipLoader } from "react-spinners";

interface LoadingSpinnerProps {
  loading: boolean;
  message?: string;
}

const LoadingSpinner = ({
  loading,
  message = "Updating...",
}: LoadingSpinnerProps) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <ClipLoader
          color="#3B82F6" // Blue color
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
        />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
