export const StatusBadge = ({ type }: { type: any }) => {
  let colorClass = "";
  switch (type) {
    case "hot":
      colorClass = "bg-red-600";
      break;
    case "warm":
      colorClass = "bg-orange-600";
      break;
    case "cold":
      colorClass = "bg-blue-600";
      break;
    case "Cold":
      colorClass = "bg-blue-600";
      break;
    default:
      colorClass = "bg-gray-200 !text-black";
      break;
  }
  return (
    <div
      className={`font-medium  text-white ${colorClass} px-2 py-1 rounded-full text-center w-24`}
    >
      {type || "Unknown"}
    </div>
  );
};
