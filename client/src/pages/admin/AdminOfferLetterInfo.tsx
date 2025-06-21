import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Building, GraduationCap, DollarSign, Calendar, Phone, Mail, Globe, User } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';

export default function AdminOfferLetterInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all offer letters (admin has access to all)
  const { data: offerLetters = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/admin/offer-letter-info'],
    enabled: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  // Force cache invalidation on mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/offer-letter-info'] });
  }, [queryClient]);

  // Debug logging
  console.log('Admin Offer Letters Query:', { offerLetters, isLoading, error, length: offerLetters?.length });

  // Upload mutation for admin
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/offer-letter-info', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Offer letter processed successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/offer-letter-info'] });
      setFile(null);
      setIsUploading(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    uploadMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offer Letter Information Management</h1>
            <p className="text-muted-foreground">Admin access to all offer letters - upload and manage document information for all users</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select PDF Document</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? 'Processing...' : 'Extract Information'}
            </Button>
          </CardContent>
        </Card>

        {/* All Offer Letters List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">All Offer Letters ({offerLetters.length})</h2>
          
          {error && (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <p className="text-red-600">Error loading data: {error?.message || 'Unknown error'}</p>
              </CardContent>
            </Card>
          )}
          
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : offerLetters.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No offer letters in system yet</p>
                <p className="text-sm text-muted-foreground mt-2">Query returned: {JSON.stringify(offerLetters)}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {offerLetters.map((letter: any) => (
                <AdminOfferLetterCard key={letter.id} letter={letter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminOfferLetterCard({ letter }: { letter: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">{letter.fileName}</h3>
            </div>
            
            {/* User Information (Admin can see all user data) */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              User ID: {letter.userId} | User: {letter.username || 'N/A'}
            </div>
            
            {letter.institutionName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                {letter.institutionName}
              </div>
            )}
            
            {letter.courseName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {letter.courseName}
              </div>
            )}
            
            {letter.tuitionFees && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                {letter.tuitionFees}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Uploaded: {new Date(letter.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href={`/admin/offer-letter-info/${letter.id}`}>View Details</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}