import { formatDate } from "@/lib/utils";
import React from "react";

const RemarkCard = ({ remark }: { remark: any }) => {
  const CircleAvatar = ({ name, size = 14 }: { name: any; size: any }) => {
    // Adjusted size to Tailwind's scale
    // Function to extract initials from the name
    const getInitials = (name: any) => {
      const names = name.split(" ");
      const initials = names.map((n: any) => n[0]).join("");
      return initials.toUpperCase();
    };

    // Dynamic style for font size based on avatar size. Tailwind's scale is used for general sizing.
    const style = {
      fontSize: `${size * 1.25}px`, // Dynamic font size, adjust multiplier as needed for design
    };

    return (
      <div
        className={`rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white transition duration-500 hover:scale-105 hover:z-30 relative w-${size} h-${size}`}
        style={style}
        onMouseMove={(e) => e.stopPropagation()} // Prevents parent hover effects if needed
      >
        {getInitials(name)}
      </div>
    );
  };
  return (
    <div>
      <article className="p-6 text-base bg-white rounded-lg border shadow-sm">
        <footer className="flex justify-between items-center mb-2">
          <div className="flex items-center justify-between w-full">
            <p className="inline-flex gap-2.5 items-center mr-3 text-sm text-gray-900  font-semibold">
              <CircleAvatar name={remark.user.name} size={8} />
              <div className="flex flex-col">
                <div className="title">{remark.user.name}</div>
                <div className="text-slate-400 font-normal">
                  {remark.user.role.name}
                </div>
              </div>
            </p>
            <p className="text-sm text-gray-600 ">
              <div>{formatDate(remark.createdAt)}</div>
            </p>
          </div>
        </footer>
        <p className="text-gray-500 ">{remark.content}</p>
      </article>
    </div>
  );
};

export default RemarkCard;
