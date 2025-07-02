import React, { useEffect, useReducer, useState } from "react";
import api from "@/services/api";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import Pagination from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
const loadingPlaceholder = (
  <tr>
    <td colSpan={6} className="text-center">
      <Skeleton className="h-8 w-full" />
    </td>
  </tr>
);

function institutionsReducer(state: any, action: any) {
  switch (action.type) {
    case "FETCH_INIT":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        institutions: action.payload.institutions,
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

function InstitutionsTable() {
  const initialState = {
    institutions: [],
    loading: false,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  };
  const [state, dispatch] = useReducer(institutionsReducer, initialState);
  const {
    institutions,
    currentPage,
    totalPages,
    loading,
    searchValue,
    pageSize,
  } = state;

  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timerId = setTimeout(() => {
      dispatch({ type: "CHANGE_SEARCH_VALUE", searchValue: debouncedSearch });
    }, 300);
    return () => clearTimeout(timerId);
  }, [debouncedSearch]);
  useEffect(() => {
    const fetchInstitutions = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const response = await api.get(`/institutions`, {
          params: {
            page: currentPage,
            pageSize: pageSize,
            searchValue,
          },
        });
        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            institutions: response.data.data.institutions,
            totalPages: response.data.data.totalPages,
            pageSize: response.data.data.pageSize,
            currentPage: response.data.data.currentPage,
          },
        });
      } catch (error) {
        console.error("Failed to fetch institutions:", error);
        // Potentially handle error state here
      }
    };

    fetchInstitutions();
  }, [currentPage, searchValue, pageSize]);

  const handlePageChange = (newPage: any) => {
    dispatch({ type: "CHANGE_PAGE", page: newPage });
  };
  const handlePageSizeChange = (value: any) => {
    dispatch({ type: "CHANGE_PAGE", page: 1, pageSize: parseInt(value) });
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countries, setCountries] = useState<[]>([]);

  useEffect(() => {
    fetchData();
  }, []);
  function fetchData() {
    api.get("countries").then((response: any) => {
      setCountries(response.data.data);
    });
  }
  const formik = useFormik({
    initialValues: {
      name: "",
      countryId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      countryId: Yup.string().required("Country is required"),
    }),
    onSubmit: (values, { setSubmitting, resetForm }) => {
      api.post("institutions", values).then(() => {
        setSubmitting(false);
        resetForm();
        setIsDialogOpen(false);
        toast.success("Institution Added Successfully!");
        // refetch();
      });
    },
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] = useState(null);

  const handleDeleteClick = (institution) => {
    setInstitutionToDelete(institution);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/institutions/${institutionToDelete.id}`);
      toast.success("Institution deleted successfully!");
      setDeleteDialogOpen(false);
      // Refetch the institutions or remove the deleted one from the state
      dispatch({ type: "FETCH_INIT" });
      const response = await api.get(`/institutions`, {
        params: {
          page: currentPage,
          pageSize: pageSize,
          searchValue,
        },
      });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          institutions: response.data.data.institutions,
          totalPages: response.data.data.totalPages,
          pageSize: response.data.data.pageSize,
          currentPage: response.data.data.currentPage,
        },
      });
    } catch (error) {
      console.error("Failed to delete institution:", error);
      toast.error("Failed to delete institution. Please try again.");
    }
  };
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search Institutions"
          value={debouncedSearch}
          onChange={(e) => setDebouncedSearch(e.target.value)}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Add Institutions
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={formik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Institutions</DialogTitle>
                <DialogDescription>
                  Add a new Institutions here
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="name">Institution Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                {formik.touched.name && formik.errors.name && (
                  <div>{formik.errors.name}</div>
                )}
              </div>
              <div className="grid gap-4 py-4">
                <Label htmlFor="countryId">Country</Label>
                <select
                  id="countryId"
                  name="countryId"
                  onChange={formik.handleChange}
                  value={formik.values.countryId}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    //@ts-ignore
                    <option key={country.id} value={country.id}>
                      {
                        //@ts-ignore
                        country.name
                      }
                    </option>
                  ))}
                </select>
                {formik.touched.countryId && formik.errors.countryId && (
                  <div>{formik.errors.countryId}</div>
                )}
              </div>

              <Button type="submit">Save changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                Institution Name
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
                Courses
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading
              ? loadingPlaceholder
              : institutions.map((institution: any) => (
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
                      {institution._count.courses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {institution.country.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(institution.createdAt)}
                    </td>
                    {user.role.name == "SUPER_ADMIN" ? (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteClick(institution)}
                        >
                          Delete
                        </Button>
                      </td>
                    ) : (
                      <></>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the institution "
              {institutionToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

export default InstitutionsTable;
