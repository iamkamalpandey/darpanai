import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Upload, 
  FileText, 
  Building2, 
  GraduationCap, 
  Calendar,
  Eye,
  Plus,
  Search,
  Filter,
  Download
} from "lucide-react";

interface OfferLetterInfo {
  id: number;
  fileName: string;
  institutionName: string | null;
  courseName: string | null;
  studentName: string | null;
  createdAt: string;
}

export default function OfferLetterInformation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: offerLetters = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/offer-letter-information'],
  });

  const filteredOfferLetters = (offerLetters as OfferLetterInfo[]).filter((letter: OfferLetterInfo) =>
    letter.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/offer-letter-information/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Offer letter information extracted and saved successfully!",
        variant: "default"
      });

      refetch();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process offer letter",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offer letter information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  Offer Letter Information
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive offer letter document analysis and information extraction
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isUploading ? 'Processing...' : 'Extract New Offer Letter'}
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by file name, institution, course, or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {filteredOfferLetters.length} {filteredOfferLetters.length === 1 ? 'Document' : 'Documents'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Upload Instructions */}
        {offerLetters.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-8">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Offer Letters Processed Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upload your first offer letter PDF to extract comprehensive information including institution details, 
              course information, financial breakdown, terms and conditions, and visa requirements.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 max-w-xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-3">What We Extract:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Institution Information
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Course Details
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Important Dates
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terms & Conditions
                </div>
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
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 break-words overflow-hidden text-wrap">
                          {letter.fileName}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 break-words overflow-hidden text-wrap">
                        {letter.institutionName || "Institution not specified"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 break-words overflow-hidden text-wrap">
                        {letter.courseName || "Course not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        Processed: {formatDate(letter.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <Button 
                      onClick={() => setLocation(`/offer-letter-details/${letter.id}`)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchTerm && filteredOfferLetters.length === 0 && offerLetters.length > 0 && (
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
    </div>
  );
}