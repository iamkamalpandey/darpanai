import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  FileText, 
  User, 
  Calendar, 
  Building2,
  GraduationCap,
  Clock,
  Filter,
  Download
} from "lucide-react";
import { Link } from "wouter";

interface CoeInfo {
  id: number;
  fileName: string;
  providerName: string | null;
  courseName: string | null;
  givenNames: string | null;
  familyName: string | null;
  createdAt: string;
  userId: number;
  courseStartDate: string | null;
  courseEndDate: string | null;
  initialPrePaidTuitionFee: string | null;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return "Invalid date";
  }
}

function formatCurrency(amount: string | null): string {
  if (!amount) return "Not specified";
  return amount;
}

export default function AdminCoeInformation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");

  const { data: coeInfo = [], isLoading } = useQuery({
    queryKey: ['/api/admin/coe-information'],
  });

  const filteredCoeInfo = (coeInfo as CoeInfo[]).filter((coe: CoeInfo) =>
    (searchTerm === "" || 
     coe.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     coe.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     coe.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     coe.givenNames?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     coe.familyName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedProvider === "" || coe.providerName === selectedProvider)
  );

  const uniqueProviders = Array.from(
    new Set((coeInfo as CoeInfo[]).map(coe => coe.providerName).filter(Boolean))
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              COE Information Management
            </h1>
            <p className="text-gray-600">
              Certificate of Enrollment information extracted from user documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Data
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              {(coeInfo as CoeInfo[]).length} Documents
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search by file name, provider, course, or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Providers</option>
            {uniqueProviders.map((provider) => (
              <option key={provider} value={provider || ""}>
                {provider}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total COE Documents</p>
                <p className="text-2xl font-bold">{(coeInfo as CoeInfo[]).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Providers</p>
                <p className="text-2xl font-bold">{uniqueProviders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold">
                  {new Set((coeInfo as CoeInfo[]).map(coe => coe.userId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {(coeInfo as CoeInfo[]).filter(coe => {
                    const coeDate = new Date(coe.createdAt);
                    const now = new Date();
                    return coeDate.getMonth() === now.getMonth() && 
                           coeDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {(coeInfo as CoeInfo[]).length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No COE Information Found
          </h3>
          <p className="text-gray-600 mb-6">
            Users haven't uploaded any COE documents yet.
          </p>
        </div>
      )}

      {/* COE Info Grid */}
      {filteredCoeInfo.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredCoeInfo as CoeInfo[]).map((coe: CoeInfo) => (
            <Card key={coe.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate break-words overflow-hidden text-wrap">
                        {coe.fileName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} className="flex-shrink-0" />
                        {formatDate(coe.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Provider */}
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {coe.providerName || "Provider not specified"}
                    </span>
                  </div>

                  {/* Course */}
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {coe.courseName || "Course not specified"}
                    </span>
                  </div>

                  {/* Student */}
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {coe.givenNames && coe.familyName 
                        ? `${coe.givenNames} ${coe.familyName}` 
                        : "Student name not specified"}
                    </span>
                  </div>

                  {/* Financial Info */}
                  {coe.initialPrePaidTuitionFee && (
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Pre-paid Fee: {formatCurrency(coe.initialPrePaidTuitionFee)}
                      </div>
                    </div>
                  )}

                  {/* Course Dates */}
                  <div className="flex flex-wrap gap-2">
                    {coe.courseStartDate && (
                      <Badge variant="outline" className="text-xs">
                        Start: {formatDate(coe.courseStartDate)}
                      </Badge>
                    )}
                    {coe.courseEndDate && (
                      <Badge variant="outline" className="text-xs">
                        End: {formatDate(coe.courseEndDate)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} className="flex-shrink-0" />
                    User ID: {coe.userId}
                  </div>
                  <Link href={`/admin/coe-details/${coe.id}`}>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Eye size={16} />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchTerm && filteredCoeInfo.length === 0 && (coeInfo as CoeInfo[]).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600">
            No COE documents match your search criteria. Try different keywords.
          </p>
        </div>
      )}
    </div>
  );
}