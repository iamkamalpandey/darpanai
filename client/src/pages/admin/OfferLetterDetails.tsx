import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  User, 
  Clock,
  BookOpen,
  Award,
  Search,
  Loader2,
  ExternalLink,
  Home,
  Plane,
  ArrowLeft
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Link } from 'wouter';

// Helper function to format requirements text with proper lists and highlighting
function formatRequirementsText(text: string | null): JSX.Element {
  if (!text || text === 'Not specified') {
    return <span className="text-gray-400 italic">Not specified</span>;
  }

  // Check for explicit list markers first
  const hasExplicitListMarkers = /[•\-\*]\s/.test(text);
  const hasNumberedList = /^\d+\.\s/.test(text);
  const hasLetterList = /^\w\)\s/.test(text);
  const hasLineBreaks = text.includes('\n');
  
  if (hasExplicitListMarkers || hasNumberedList || hasLetterList) {
    // Split by list markers and preserve full content
    const lines = text
      .split(/(?=\s*[•\-\*]\s)|(?=\s*\d+\.\s)|(?=\s*\w\)\s)/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length > 1) {
      return (
        <ul className="space-y-2">
          {lines.map((line, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
              <span className="leading-relaxed text-sm">{highlightImportantTerms(line)}</span>
            </li>
          ))}
        </ul>
      );
    }
  }

  // Check for line breaks
  if (hasLineBreaks) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 1) {
      return (
        <ul className="space-y-2">
          {lines.map((line, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
              <span className="leading-relaxed text-sm">{highlightImportantTerms(line)}</span>
            </li>
          ))}
        </ul>
      );
    }
  }

  // Check for sentences separated by periods or semicolons only if text is very long
  if (text.length > 200) {
    const sentences = text.split(/\.\s+/).filter(s => s.trim().length > 20);
    if (sentences.length > 2) {
      return (
        <ul className="space-y-2">
          {sentences.map((sentence, index) => {
            const cleanSentence = sentence.trim();
            if (cleanSentence) {
              return (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed text-sm">{highlightImportantTerms(cleanSentence + '.')}</span>
                </li>
              );
            }
            return null;
          })}
        </ul>
      );
    }
  }

  return <div className="leading-relaxed text-sm">{highlightImportantTerms(text)}</div>;
}

// Helper function to highlight important terms and conditions
function highlightImportantTerms(text: string): JSX.Element {
  const importantTerms = [
    'minimum', 'required', 'must', 'mandatory', 'deadline', 'fee', 'cost', 
    'tuition', 'deposit', 'scholarship', 'IELTS', 'TOEFL', 'GPA', 'grade',
    'certificate', 'transcript', 'visa', 'passport', 'insurance', 'accommodation',
    'terms', 'conditions', 'policy', 'refund', 'withdrawal', 'academic', 'attendance'
  ];

  let highlightedText = text;
  
  importantTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<mark class="bg-orange-100 text-orange-800 px-1 rounded">${term}</mark>`);
  });

  // Highlight monetary amounts
  highlightedText = highlightedText.replace(/\$[\d,]+(?:\.\d{2})?/g, '<span class="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">$&</span>');
  
  // Highlight percentages
  highlightedText = highlightedText.replace(/\b\d+(?:\.\d+)?%/g, '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">$&</span>');
  
  // Highlight dates
  highlightedText = highlightedText.replace(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/g, '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">$&</span>');

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
}

export default function AdminOfferLetterDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: offerLetter, isLoading, error } = useQuery({
    queryKey: ['/api/admin/offer-letter-info', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/offer-letter-info/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch offer letter details');
      }
      const data = await response.json();
      console.log('Admin Offer Letter Data:', data);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  console.log('Debug - ID:', id, 'Data:', offerLetter, 'Loading:', isLoading, 'Error:', error);

  if (error || !offerLetter) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {error ? `Error: ${error.message}` : 'Offer letter not found or access denied'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
              <Button asChild className="mt-4">
                <Link href="/admin/information-reports">Back to Information Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/information-reports">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Information Reports
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Offer Letter Information</h1>
              <p className="text-muted-foreground">{offerLetter.fileName}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Admin View
          </Badge>
        </div>

        {/* Document Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">User ID</p>
                <p className="font-semibold">{offerLetter.userId}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">File Name</p>
                <p className="font-semibold">{offerLetter.fileName}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Upload Date</p>
                <p className="font-semibold">{offerLetter.createdAt ? new Date(offerLetter.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Institution Name</p>
                <p className="font-semibold">{offerLetter.institutionName || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <p>{offerLetter.institutionAddress || 'Not specified'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{offerLetter.institutionPhone || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{offerLetter.institutionEmail || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p>{offerLetter.institutionWebsite || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-600" />
              Program Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Program Details</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">{offerLetter.programName || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <p>{offerLetter.programLevel || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Timeline</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>Start: {offerLetter.startDate || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>End: {offerLetter.endDate || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>Duration: {offerLetter.duration || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-800">Total Tuition</p>
                </div>
                <p className="text-lg font-bold text-green-900">{offerLetter.totalTuition || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <p className="font-medium text-blue-800">Application Fee</p>
                </div>
                <p className="text-lg font-bold text-blue-900">{offerLetter.applicationFee || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <p className="font-medium text-orange-800">Deposit Required</p>
                </div>
                <p className="text-lg font-bold text-orange-900">{offerLetter.depositRequired || 'Not specified'}</p>
              </div>
            </div>
            
            {/* Additional Financial Details */}
            <div className="mt-6 space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-2">Payment Information</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>Due Date: {offerLetter.paymentDueDate || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              {(offerLetter.scholarshipAmount || offerLetter.scholarshipConditions) && (
                <div>
                  <p className="font-medium text-muted-foreground mb-2">Scholarship Information</p>
                  <div className="space-y-2">
                    {offerLetter.scholarshipAmount && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <p>Amount: {offerLetter.scholarshipAmount}</p>
                      </div>
                    )}
                    {offerLetter.scholarshipConditions && (
                      <div>
                        <p className="font-medium mb-1">Conditions:</p>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          {formatRequirementsText(offerLetter.scholarshipConditions)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Requirements & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {offerLetter.academicRequirements && (
              <div>
                <p className="font-medium mb-2">Academic Requirements</p>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  {formatRequirementsText(offerLetter.academicRequirements)}
                </div>
              </div>
            )}

            {offerLetter.languageRequirements && (
              <div>
                <p className="font-medium mb-2">Language Requirements</p>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  {formatRequirementsText(offerLetter.languageRequirements)}
                </div>
              </div>
            )}

            {offerLetter.visaRequirements && (
              <div>
                <p className="font-medium mb-2">Visa Requirements</p>
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  {formatRequirementsText(offerLetter.visaRequirements)}
                </div>
              </div>
            )}

            {offerLetter.requiredDocuments && (
              <div>
                <p className="font-medium mb-2">Required Documents</p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  {formatRequirementsText(offerLetter.requiredDocuments)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {offerLetter.acceptanceDeadline && (
              <div>
                <p className="font-medium mb-2">Acceptance Deadline</p>
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <p className="font-semibold text-red-800">{offerLetter.acceptanceDeadline}</p>
                  </div>
                </div>
              </div>
            )}

            {offerLetter.importantNotes && (
              <div>
                <p className="font-medium mb-2">Important Notes</p>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  {formatRequirementsText(offerLetter.importantNotes)}
                </div>
              </div>
            )}

            {offerLetter.termsConditions && (
              <div>
                <p className="font-medium mb-2">Terms & Conditions</p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  {formatRequirementsText(offerLetter.termsConditions)}
                </div>
              </div>
            )}

            {offerLetter.contactPerson && (
              <div>
                <p className="font-medium mb-2">Contact Person</p>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <p>{offerLetter.contactPerson}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}