import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  // Adding ordinal suffix to date
  let suffix = "th";
  const exceptions = [1, 21, 31];
  if (exceptions.includes(day % 100)) {
    suffix = "st";
  } else if ([2, 22].includes(day % 100)) {
    suffix = "nd";
  } else if ([3, 23].includes(day % 100)) {
    suffix = "rd";
  }

  return `${months[monthIndex]} ${day}${suffix}, ${year}`;
}

import { Lead } from "@/types/api-types";

export const downloadLeads = (leads: any): void => {
  // Convert leads to CSV
  const csvRows = [];
  const headers = Object.keys(leads[0]).map((field) =>
    field.replace(/_/g, " ").toUpperCase()
  );
  csvRows.push(headers.join(","));

  for (const person of leads) {
    const values = headers.map((header) => {
      const fieldName = header.toLowerCase().replace(/ /g, "_");
      // Check for null or undefined and replace with empty string
      const value =
        //@ts-ignore
        person[fieldName] == null || person[fieldName] == "[object Object]"
          ? ""
          : //@ts-ignore
            person[fieldName];
      return `"${value}"`;
    });
    csvRows.push(values.join(","));
  }

  // Create and download csv file
  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "leads.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
