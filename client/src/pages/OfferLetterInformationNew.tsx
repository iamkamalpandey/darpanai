import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Calendar, User, Building, GraduationCap, DollarSign, Clock, AlertCircle, Trash2, School } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface OfferLetterDocument {
  id: number;
  fileName: string;
  institutionName: string | null;
  courseName: string | null;
  studentName: string | null;
  totalTuitionFees: string | null;
  courseStartDate: string | null;
  acceptanceDeadline: string | null;
  courseLevel: string | null;
  institutionContact: string | null;
  scholarshipAmount: string | null;
  createdAt: string;
}

export default function OfferLetterInformationNew() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: offerLetterDocuments = [], refetch } = useQuery<OfferLetterDocument[]>({
    queryKey: ['/api/offer-letter-information'],
    staleTime: 5 * 60 * 1000,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an offer letter document to upload.",
        variant: "destructive",
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

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Offer letter information extracted and saved successfully.",
        });
        setFile(null);
        refetch();
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to process offer letter document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process offer letter document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/offer-letter-information/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "Offer letter document has been removed successfully.",
        });
        refetch();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete offer letter document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Offer Letter Information</h1>
          <p className="text-muted-foreground">
            Upload and extract complete information from your university offer letter documents
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-letter-file">Select Offer Letter Document</Label>
              <Input
                id="offer-letter-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, JPG, PNG (max 10MB)
              </p>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">{file.name}</span>
                <span className="text-xs text-blue-600">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing Document...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Extract Offer Letter Information
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Information Extraction Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">What Information Do We Extract?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <Building className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Institution Details</h4>
                  <p className="text-sm text-blue-700">Name, address, contact info</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                <GraduationCap className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-900">Course Information</h4>
                  <p className="text-sm text-green-700">Program, level, duration</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                <DollarSign className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-medium text-purple-900">Financial Details</h4>
                  <p className="text-sm text-purple-700">Tuition, fees, scholarships</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900">Important Dates</h4>
                  <p className="text-sm text-orange-700">Start date, deadlines</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offer Letter Documents List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Offer Letter Documents</h2>
          
          {(offerLetterDocuments.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offer letter documents uploaded</h3>
                <p className="text-muted-foreground text-center">
                  Upload your first offer letter document to extract and view detailed information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {offerLetterDocuments.map((doc: OfferLetterDocument) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 break-words overflow-hidden text-wrap">{doc.fileName}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {doc.institutionName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden text-wrap">{doc.institutionName}</span>
                      </div>
                    )}
                    
                    {doc.courseName && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden text-wrap">{doc.courseName}</span>
                      </div>
                    )}

                    {doc.courseLevel && (
                      <div className="flex items-center gap-2 text-sm">
                        <School className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden text-wrap">{doc.courseLevel}</span>
                      </div>
                    )}
                    
                    {doc.studentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1 break-words overflow-hidden text-wrap">{doc.studentName}</span>
                      </div>
                    )}
                    
                    {doc.totalTuitionFees && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-700 break-words overflow-hidden text-wrap">{doc.totalTuitionFees}</span>
                      </div>
                    )}

                    {doc.scholarshipAmount && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span className="font-medium text-purple-700 break-words overflow-hidden text-wrap">Scholarship: {doc.scholarshipAmount}</span>
                      </div>
                    )}
                    
                    {doc.courseStartDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="break-words overflow-hidden text-wrap">Starts: {
                          (() => {
                            try {
                              const date = new Date(doc.courseStartDate);
                              return isNaN(date.getTime()) ? doc.courseStartDate : format(date, 'MMM dd, yyyy');
                            } catch {
                              return doc.courseStartDate;
                            }
                          })()
                        }</span>
                      </div>
                    )}

                    {doc.acceptanceDeadline && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-red-700 font-medium break-words overflow-hidden text-wrap">Deadline: {
                          (() => {
                            try {
                              const date = new Date(doc.acceptanceDeadline);
                              return isNaN(date.getTime()) ? doc.acceptanceDeadline : format(date, 'MMM dd, yyyy');
                            } catch {
                              return doc.acceptanceDeadline;
                            }
                          })()
                        }</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="break-words overflow-hidden text-wrap">Uploaded: {format(new Date(doc.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <Link href={`/offer-letter-details/${doc.id}`}>
                      <Button className="w-full mt-3">
                        <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Summary */}
        {offerLetterDocuments.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800">{offerLetterDocuments.length}</div>
                  <div className="text-sm text-green-600">Documents Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800">
                    {new Set(offerLetterDocuments.map(doc => doc.institutionName).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-green-600">Institutions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-800">
                    {offerLetterDocuments.filter(doc => doc.scholarshipAmount).length}
                  </div>
                  <div className="text-sm text-green-600">With Scholarships</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}