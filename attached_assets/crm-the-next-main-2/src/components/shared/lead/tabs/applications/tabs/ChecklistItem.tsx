import { useState } from "react";

export default function ChecklistItem({
  item,
  onComplete,
}: {
  item: any;
  onComplete: any;
}) {
  const [isChecked, setIsChecked] = useState(item.isComplete);

  const toggleComplete = () => {
    setIsChecked(!isChecked);
    onComplete(item.id, !isChecked);
  };

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-500 rounded"
            checked={isChecked}
            onChange={toggleComplete}
          />
          <span className="ml-2 text-sm text-gray-600">Complete</span>
        </div>
      </div>
    </div>
  );
}
