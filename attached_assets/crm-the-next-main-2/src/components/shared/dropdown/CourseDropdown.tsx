import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Combobox } from "@headlessui/react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { Check, ChevronDown } from "lucide-react";

const CourseDropdown = ({
  institutionId,
  onCourseSelect,
}: {
  institutionId?: number;
  onCourseSelect: any;
}) => {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!institutionId) return;
      setLoading(true);
      try {
        const response = await api.get(`courses`, {
          params: { searchValue: query, institutionId },
        });
        setCourses(response.data.data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [institutionId, query]);

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    onCourseSelect(course);
  };

  return (
    <Combobox value={selectedCourse} onChange={handleCourseSelect}>
      <div className="relative mt-1">
        <Combobox.Input
          as={Input}
          displayValue={(course: any) => (course ? course.name : "")}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Courses"
          className="w-full"
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Combobox.Button>

        {loading && (
          <Skeleton className="absolute inset-x-0 top-12 mt-2 h-10 w-full" />
        )}
        {courses.length > 0 && (
          <Combobox.Options className="absolute mt-2 max-h-60 w-full overflow-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
            {courses.slice(0, 5).map((course: any) => (
              <Combobox.Option
                key={course.id}
                value={course}
                className={({ active }) =>
                  `cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                    active ? "text-white bg-indigo-600" : "text-gray-900"
                  }`
                }
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {course.name}
                    </span>
                    {selected && (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? "text-white" : "text-indigo-600"
                        }`}
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default CourseDropdown;
