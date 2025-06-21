import React, { useState, useRef } from "react";
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
  Download,
  Mail
} from "lucide-react";
import { Link } from "wouter";

interface OfferLetterInfo {
  id: number;
  fileName: string;
  institutionName: string | null;
  courseName: string | null;
  studentName: string | null;
  createdAt: string;
  userId: number;
  totalTuitionFees: string | null;
  courseStartDate: string | null;
  acceptanceDeadline: string | null;
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

export default function AdminOfferLetterInformation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  const { data: offerLetters = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/offer-letter-information'],
  });

  const filteredOfferLetters = (offerLetters as OfferLetterInfo[]).filter((letter: OfferLetterInfo) =>
    (searchTerm === "" || 
     letter.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     letter.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     letter.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     letter.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedInstitution === "" || letter.institutionName === selectedInstitution)
  );

  const uniqueInstitutions = Array.from(
    new Set((offerLetters as OfferLetterInfo[]).map(letter => letter.institutionName).filter(Boolean))
  ).filter((institution): institution is string => institution !== null);

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
              Offer Letter Information Management
            </h1>
            <p className="text-gray-600">
              Comprehensive offer letter information extracted from user documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={16} />
              Export Data
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              {(offerLetters as OfferLetterInfo[]).length} Documents
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search by file name, institution, course, or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={selectedInstitution || ""}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Institutions</option>
            {uniqueInstitutions.map((institution) => (
              <option key={institution} value={institution || ""}>
                {institution}
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
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{(offerLetters as OfferLetterInfo[]).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <p className="text-2xl font-bold">{uniqueInstitutions.length}</p>
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
                  {new Set((offerLetters as OfferLetterInfo[]).map(letter => letter.userId)).size}
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
                  {(offerLetters as OfferLetterInfo[]).filter(letter => {
                    const letterDate = new Date(letter.createdAt);
                    const now = new Date();
                    return letterDate.getMonth() === now.getMonth() && 
                           letterDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {(offerLetters as OfferLetterInfo[]).length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Offer Letter Information Found
          </h3>
          <p className="text-gray-600 mb-6">
            Users haven't uploaded any offer letter documents yet.
          </p>
        </div>
      )}

      {/* Offer Letters Grid */}
      {filteredOfferLetters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredOfferLetters as OfferLetterInfo[]).map((letter: OfferLetterInfo) => (
            <Card key={letter.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate break-words overflow-hidden text-wrap">
                        {letter.fileName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} className="flex-shrink-0" />
                        {formatDate(letter.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Institution */}
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {letter.institutionName || "Institution not specified"}
                    </span>
                  </div>

                  {/* Course */}
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {letter.courseName || "Course not specified"}
                    </span>
                  </div>

                  {/* Student */}
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {letter.studentName || "Student name not specified"}
                    </span>
                  </div>

                  {/* Financial Info */}
                  {letter.totalTuitionFees && (
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Tuition: {formatCurrency(letter.totalTuitionFees)}
                      </div>
                    </div>
                  )}

                  {/* Key Dates */}
                  <div className="flex flex-wrap gap-2">
                    {letter.courseStartDate && (
                      <Badge variant="outline" className="text-xs">
                        Start: {formatDate(letter.courseStartDate)}
                      </Badge>
                    )}
                    {letter.acceptanceDeadline && (
                      <Badge variant="outline" className="text-xs">
                        Accept by: {formatDate(letter.acceptanceDeadline)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} className="flex-shrink-0" />
                    User ID: {letter.userId}
                  </div>
                  <Link href={`/admin/offer-letter-details/${letter.id}`}>
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
      {searchTerm && filteredOfferLetters.length === 0 && (offerLetters as OfferLetterInfo[]).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600">
            No offer letters match your search criteria. Try different keywords.
          </p>
        </div>
      )}
    </div>
  );
}