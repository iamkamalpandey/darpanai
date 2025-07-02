import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CustomDatePicker() {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{startDate ? format(startDate, "PPP") : "Pick a date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <DatePicker
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          dateFormat="MMMM d, yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          inline // This can be removed if you don't want the calendar to always be visible
        />
      </PopoverContent>
    </Popover>
  );
}
