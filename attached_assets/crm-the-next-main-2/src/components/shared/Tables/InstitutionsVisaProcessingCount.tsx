import Link from "next/link";
import { useRouter } from "next/router";

/* This example requires Tailwind CSS v2.0+ */
const institutions = [
  {
    id: 1,
    name: "Deakin University",
    country: "Australia",
    applied: 10,
    coe_received: 5,
    application_denied: 5,
    additional_documents: 1,
    visa_granted: 2,
    visa_rejected: 1,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/255px-Flag_of_Australia_%28converted%29.svg.png",
  },

  // More countries...
];

export default function InstitutionVisaProcessingCount() {
  const router = useRouter();
  return (
    <div className="">
      <div className=" flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3  text-sm font-semibold text-gray-900 sm:pl-6 text-center"
                    >
                      Institution
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Country
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5  text-sm font-semibold text-gray-900 text-center"
                    >
                      Applied
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      COE Received
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Application Denied
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Additional Documents
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Visa Granted
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                    >
                      Visa Rejected
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {institutions.map((institution) => (
                    <tr
                      key={institution.name}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() =>
                        router.push(`/admin/institutions/${institution.id}`)
                      }
                    >
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">{institution.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.country}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.applied}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.coe_received}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.application_denied}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.additional_documents}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.visa_granted}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <div className="text-gray-900">
                          {institution.visa_rejected}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
