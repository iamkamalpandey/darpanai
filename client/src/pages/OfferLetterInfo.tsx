import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Building, GraduationCap, DollarSign, Calendar, Phone, Mail, Globe } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';

export function OfferLetterInfo() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch offer letter list
  const { data: offerLetters = [], isLoading } = useQuery({
    queryKey: ['/api/offer-letter-info'],
    enabled: true,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/offer-letter-info', {
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
      queryClient.invalidateQueries({ queryKey: ['/api/offer-letter-info'] });
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
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Offer Letter Information</h1>
            <p className="text-muted-foreground">Upload offer letters to extract and store all document information</p>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Offer Letter
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

        {/* Offer Letters List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Offer Letters</h2>
          
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
                <p className="text-muted-foreground">No offer letters uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {offerLetters.map((letter: any) => (
                <OfferLetterCard key={letter.id} letter={letter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function OfferLetterCard({ letter }: { letter: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">{letter.fileName}</h3>
            </div>
            
            {letter.institutionName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                {letter.institutionName}
              </div>
            )}
            
            {letter.programName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {letter.programName}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Uploaded: {new Date(letter.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild>
            <a href={`/offer-letter-info/${letter.id}`}>View Details</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}