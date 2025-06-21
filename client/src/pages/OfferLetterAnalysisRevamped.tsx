import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  GraduationCap,
  Building2,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  Plus,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';

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

export default function OfferLetterAnalysisRevamped() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's offer letter information
  const { data: offerLetters = [], isLoading } = useQuery({
    queryKey: ['/api/offer-letter-information'],
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/offer-letter-information/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Offer letter processed successfully. Information has been extracted and saved.",
      });
      setSelectedFile(null);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-information'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process offer letter. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF or image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(selectedFile);
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Offer Letter Analysis
            </h1>
            <p className="text-gray-600">
              Upload and analyze your university offer letters to extract comprehensive information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1">
              {(offerLetters as OfferLetterInfo[]).length} Documents Processed
            </Badge>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Upload New Offer Letter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Selection */}
            <div>
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">{selectedFile.name}</p>
                      <p className="text-sm text-blue-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploadMutation.isPending ? 'Processing...' : 'Extract Information'}
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploadMutation.isPending && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600">Processing document...</span>
                      <span className="text-sm text-blue-600">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* What We Extract */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Building2 className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-medium text-green-900">Institution Details</h3>
                <p className="text-sm text-green-700">Name, address, contact information</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <GraduationCap className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-medium text-blue-900">Course Information</h3>
                <p className="text-sm text-blue-700">Program details, duration, level</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-medium text-purple-900">Financial Details</h3>
                <p className="text-sm text-purple-700">Tuition, fees, payment terms</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Calendar className="h-6 w-6 text-orange-600 mb-2" />
                <h3 className="font-medium text-orange-900">Important Dates</h3>
                <p className="text-sm text-orange-700">Start date, deadlines, terms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      {(offerLetters as OfferLetterInfo[]).length > 0 && (
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
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Institutions</option>
              {uniqueInstitutions.map((institution) => (
                <option key={institution} value={institution}>
                  {institution}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {(offerLetters as OfferLetterInfo[]).length > 0 && (
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {(offerLetters as OfferLetterInfo[]).length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Offer Letters Processed Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Upload your first offer letter PDF to extract comprehensive information including institution details, course information, financial breakdown, and important dates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">What We Extract:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Institution & contact details</li>
                <li>• Course & program information</li>
                <li>• Financial breakdown</li>
                <li>• Important dates & deadlines</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Supported Formats:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• PDF documents</li>
                <li>• JPG/JPEG images</li>
                <li>• PNG images</li>
                <li>• Max file size: 10MB</li>
              </ul>
            </div>
          </div>
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
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 break-words overflow-hidden text-wrap">
                      {letter.studentName || "Student name not specified"}
                    </span>
                  </div>

                  {/* Financial Info */}
                  {letter.totalTuitionFees && (
                    <div className="p-2 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Total Fees: {formatCurrency(letter.totalTuitionFees)}
                      </div>
                    </div>
                  )}

                  {/* Important Dates */}
                  <div className="flex flex-wrap gap-2">
                    {letter.courseStartDate && (
                      <Badge variant="outline" className="text-xs">
                        Start: {formatDate(letter.courseStartDate)}
                      </Badge>
                    )}
                    {letter.acceptanceDeadline && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Deadline: {formatDate(letter.acceptanceDeadline)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <Badge variant="secondary" className="text-xs">
                    Processed
                  </Badge>
                  <Link href={`/offer-letter-details/${letter.id}`}>
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

      {/* Loading State */}
      {isLoading && (
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
      )}
    </div>
  );
}