import React, { useEffect, useReducer, useState } from "react";
import api from "@/services/api";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const loadingPlaceholder = (
  <tr>
    <td colSpan={6} className="text-center">
      <Skeleton className="h-8 w-full" />
    </td>
  </tr>
);

function coursesReducer(state: any, action: any) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        courses: action.payload.courses,
        totalPages: action.payload.totalPages,
        pageSize: action.payload.pageSize,

        loading: false,
      };
    case "CHANGE_SEARCH_VALUE":
      return {
        ...state,
        searchValue: action.searchValue,
      };
    case "CHANGE_PAGE":
      return { ...state, currentPage: action.page, pageSize: action.pageSize };
    default:
      return state;
  }
}

function CoursesTable() {
  const initialState = {
    courses: [],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  };
  const [state, dispatch] = useReducer(coursesReducer, initialState);
  const { courses, currentPage, totalPages, loading, searchValue, pageSize } =
    state;

  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: debouncedSearch });
    }, 300);
    return () => clearTimeout(timerId);
  }, [debouncedSearch]);
  useEffect(() => {
    const fetchCourses = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get(`/courses`, {
          params: {
            page: currentPage,
            pageSize: pageSize,
            searchValue,
          },
        });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            courses: response.data.data.courses,
            totalPages: response.data.data.totalPages,
            pageSize: response.data.data.pageSize,
            currentPage: response.data.data.currentPage,
          },
        });
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // Potentially handle error state here
      }
    };

    fetchCourses();
  }, [currentPage, searchValue, pageSize]);

  const handlePageChange = (newPage: any) => {
    dispatch({ type: "CHANGE_PAGE", page: newPage });
  };
  const handlePageSizeChange = (value: any) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: parseInt(value) });
  };
  const handleDeleteCourse = async (courseId: any) => {
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted successfully");
      // Trigger a full refetch of courses
      dispatch({ type: "FETCH_INIT" });
      const response = await api.get(`/courses`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
          searchValue,
        },
      });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          courses: response.data.data.courses,
          totalPages: response.data.data.totalPages,
          pageSize: response.data.data.pageSize,
          currentPage: response.data.data.currentPage,
        },
      });
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error("Failed to delete course");
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search Course"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Course Name
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Applications
              </th>
              <th
                scope="col"
                className="px-6 py-3  text-sm font-semibold text-center text-gray-900"
              >
                Institution
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Country
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Created At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? loadingPlaceholder
              : courses.map((institution: any) => (
                  <tr key={institution.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-center align-middle items-center grid">
                          {`${institution.name[0].toUpperCase()}`}
                        </div>
                        <div className=" flex flex-col">
                          <div className="text-left font-medium">
                            {institution.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {institution.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {institution._count.leads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {institution.institution.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {institution.institution.country.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(institution.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the course and remove its data
                              from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCourse(institution.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={0}
        pageSize={0}
        onPrevious={() => handlePageChange(currentPage - 1)}
        onNext={() => handlePageChange(currentPage + 1)}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default CoursesTable;
