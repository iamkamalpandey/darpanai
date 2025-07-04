import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { Lead } from "@/types/api-types";
import { IdentifierType } from "@/types/types";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function CounsellorArchiveTable({
  people = [],
}: {
  people?: Lead[];
}) {
  const router = useRouter();
  const [file, setFile] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const unarchiveLead = () => {
    api.delete(`archive/${selectedLead.id}`).then((response) => {
      if (response.status == 200) {
        toast.success("Lead unarchived successfully!");
        router.reload();
      }
    });
    setModalOpen(false); // Close the modal after unarchiving
  };

  return (
    <div className="max-w-fulls">
      <div className=" flex flex-col gap-2.5">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8 no-scrollbar">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Phone Number
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Reason
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Total Visits
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {people.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-sm text-gray-500"
                      >
                        No leads available
                      </td>
                    </tr>
                  ) : (
                    people.map((person: any) => (
                      <tr
                        key={person.lead.email}
                        className="group/item hover:bg-slate-100"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {person.lead.first_name}&nbsp;{person.lead.last_name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.lead.phone_number}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.lead.email}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.reason}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {person.lead._count.VisitHistory}
                        </td>
                        <td className="relative whitespace-nowrap py-4  text-right text-sm font-medium sm:pr-6">
                          {selectedLead && modalOpen && (
                            <div
                              className="fixed z-10 inset-0 overflow-y-auto"
                              aria-labelledby="modal-title"
                              role="dialog"
                              aria-modal="true"
                            >
                              <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div
                                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                                  aria-hidden="true"
                                ></div>
                                <span
                                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                                  aria-hidden="true"
                                >
                                  &#8203;
                                </span>
                                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                          className="text-lg leading-6 font-medium text-gray-900"
                                          id="modal-title"
                                        >
                                          Unarchive Lead
                                        </h3>
                                        <div className="mt-2">
                                          <p className="text-sm text-gray-500">
                                            Are you sure you want to unarchive
                                            this lead?
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                      type="button"
                                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                      onClick={() => unarchiveLead()}
                                    >
                                      Unarchive
                                    </button>
                                    <button
                                      type="button"
                                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                      onClick={() => setModalOpen(false)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            className="text-white hover:bg-green-700 rounded-full border px-2.5 py-2.5 bg-green-600"
                            onClick={() => {
                              setSelectedLead(person);
                              setModalOpen(true);
                            }}
                          >
                            Unarchive
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
