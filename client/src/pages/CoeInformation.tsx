import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Calendar, User, Building, GraduationCap, DollarSign, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface CoeDocument {
  id: number;
  fileName: string;
  institutionName: string | null;
  courseName: string | null;
  studentName: string | null;
  commencementDate: string | null;
  createdAt: string;
}

export default function CoeInformation() {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: coeDocuments = [], refetch } = useQuery<CoeDocument[]>({
    queryKey: ['/api/coe-info'],
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
        description: "Please select a COE document to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/coe-info/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success!",
          description: "COE information extracted and saved successfully.",
        });
        setFile(null);
        refetch();
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to process COE document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process COE document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/coe-info/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Document deleted",
          description: "COE document has been removed successfully.",
        });
        refetch();
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete COE document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">COE Information</h1>
          <p className="text-muted-foreground">
            Upload and extract complete information from your Confirmation of Enrollment (COE) documents
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload COE Document
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coe-file">Select COE Document</Label>
              <Input
                id="coe-file"
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
                  Extract COE Information
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* COE Documents List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your COE Documents</h2>
          
          {(coeDocuments.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No COE documents uploaded</h3>
                <p className="text-muted-foreground text-center">
                  Upload your first COE document to extract and view detailed information.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {coeDocuments.map((doc: CoeDocument) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{doc.fileName}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {doc.institutionName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{doc.institutionName}</span>
                      </div>
                    )}
                    
                    {doc.courseName && (
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{doc.courseName}</span>
                      </div>
                    )}
                    
                    {doc.studentName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{doc.studentName}</span>
                      </div>
                    )}
                    
                    {doc.commencementDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Starts: {doc.commencementDate}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Uploaded: {format(new Date(doc.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <Link href={`/coe-info/${doc.id}`}>
                      <Button className="w-full mt-3">
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}