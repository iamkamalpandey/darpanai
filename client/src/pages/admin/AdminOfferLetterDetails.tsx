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
        <ul className="space-y-1.5 mt-2">
          {lines.map((line, index) => (
            <li key={index} className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
              <span className="leading-relaxed text-sm break-words overflow-hidden text-wrap">{highlightImportantTerms(line)}</span>
            </li>
          ))}
        </ul>
      );
    }
  }
  
  // Split by line breaks if present
  if (hasLineBreaks) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length > 1) {
      return (
        <ul className="space-y-1.5 mt-2">
          {lines.map((line, index) => {
            const cleanLine = line.trim();
            if (cleanLine.length > 50) {
              // Long lines - likely sentences
              return (
                <li key={index} className="text-sm leading-relaxed break-words overflow-hidden text-wrap">
                  {highlightImportantTerms(cleanLine)}
                </li>
              );
            } else {
              // Short lines - treat as list items
              return (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed text-sm break-words overflow-hidden text-wrap">{highlightImportantTerms(cleanLine)}</span>
                </li>
              );
            }
          })}
        </ul>
      );
    }
  }
  
  // If no clear list structure, try to detect sentences and create list
  if (text.length > 100) {
    const sentences = text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Only meaningful sentences
    
    if (sentences.length > 1) {
      return (
        <ul className="space-y-1.5 mt-2">
          {sentences.map((sentence, index) => {
            const cleanSentence = sentence.trim();
            if (cleanSentence) {
              return (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed text-sm break-words overflow-hidden text-wrap">{highlightImportantTerms(cleanSentence + '.')}</span>
                </li>
              );
            }
            return null;
          })}
        </ul>
      );
    }
  }

  return <div className="leading-relaxed text-sm break-words overflow-hidden text-wrap">{highlightImportantTerms(text)}</div>;
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
    highlightedText = highlightedText.replace(regex, `<span class="font-semibold text-orange-800 bg-orange-100 px-1 py-0.5 rounded text-xs">$&</span>`);
  });

  // Highlight monetary amounts
  highlightedText = highlightedText.replace(/\$[\d,]+(?:\.\d{2})?/g, '<span class="font-semibold text-green-700 bg-green-100 px-1 py-0.5 rounded text-xs">$&</span>');
  
  // Highlight percentages
  highlightedText = highlightedText.replace(/\d+%/g, '<span class="font-semibold text-blue-700 bg-blue-100 px-1 py-0.5 rounded text-xs">$&</span>');
  
  // Highlight dates
  highlightedText = highlightedText.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g, '<span class="font-semibold text-purple-700 bg-purple-100 px-1 py-0.5 rounded text-xs">$&</span>');

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
}

// InfoItem component with text overflow protection
function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: any; 
  label: string; 
  value: string | null | undefined; 
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-muted-foreground break-words overflow-hidden text-wrap">{label}</div>
        <div className="text-sm mt-1 break-words overflow-hidden text-wrap">
          {value || <span className="text-gray-400 italic">Not specified</span>}
        </div>
      </div>
    </div>
  );
}

export default function AdminOfferLetterDetails() {
  const { id } = useParams();

  const { data: offerLetter, isLoading, error } = useQuery({
    queryKey: ['/api/admin/offer-letter-info', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/offer-letter-info/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch offer letter details');
      }
      return response.json();
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

  if (error || !offerLetter) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Offer letter not found or access denied</p>
              <Button asChild className="mt-4">
                <Link href="/admin/offer-letter-info">Back to List</Link>
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
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/offer-letter-info">
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                Back to All Offer Letters
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold break-words overflow-hidden text-wrap">Offer Letter Details</h1>
              <p className="text-muted-foreground break-words overflow-hidden text-wrap">
                {offerLetter.fileName || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Document Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm opacity-90">File Name</div>
                <div className="font-semibold break-words overflow-hidden text-wrap">
                  {offerLetter.fileName || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm opacity-90">Analysis Date</div>
                <div className="font-semibold break-words overflow-hidden text-wrap">
                  {offerLetter.createdAt ? new Date(offerLetter.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-sm opacity-90">Document Type</div>
                <div className="font-semibold">Offer Letter</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6">
          {/* File Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 flex-shrink-0" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={FileText} 
                  label="File Name" 
                  value={offerLetter.fileName} 
                />
                <InfoItem 
                  icon={FileText} 
                  label="File Size" 
                  value={offerLetter.fileSize ? `${(offerLetter.fileSize / 1024).toFixed(2)} KB` : null} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 flex-shrink-0" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={User} 
                  label="Student Name" 
                  value={offerLetter.studentName} 
                />
                <InfoItem 
                  icon={FileText} 
                  label="Student ID" 
                  value={offerLetter.studentId} 
                />
                <InfoItem 
                  icon={FileText} 
                  label="Application Number" 
                  value={offerLetter.applicationNumber} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Institution Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 flex-shrink-0" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Building} 
                  label="Institution Name" 
                  value={offerLetter.institutionName} 
                />
                <InfoItem 
                  icon={MapPin} 
                  label="Institution Address" 
                  value={offerLetter.institutionAddress} 
                />
                <InfoItem 
                  icon={Phone} 
                  label="Institution Phone" 
                  value={offerLetter.institutionPhone} 
                />
                <InfoItem 
                  icon={Mail} 
                  label="Institution Email" 
                  value={offerLetter.institutionEmail} 
                />
                <InfoItem 
                  icon={Globe} 
                  label="Institution Website" 
                  value={offerLetter.institutionWebsite} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                Program Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={BookOpen} 
                  label="Program Name" 
                  value={offerLetter.programName} 
                />
                <InfoItem 
                  icon={Award} 
                  label="Program Level" 
                  value={offerLetter.programLevel} 
                />
                <InfoItem 
                  icon={Clock} 
                  label="Program Duration" 
                  value={offerLetter.programDuration} 
                />
                <InfoItem 
                  icon={FileText} 
                  label="Study Mode" 
                  value={offerLetter.studyMode} 
                />
                <InfoItem 
                  icon={MapPin} 
                  label="Campus Location" 
                  value={offerLetter.campusLocation} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Calendar} 
                  label="Start Date" 
                  value={offerLetter.startDate} 
                />
                <InfoItem 
                  icon={Calendar} 
                  label="End Date" 
                  value={offerLetter.endDate} 
                />
                <InfoItem 
                  icon={Clock} 
                  label="Application Deadline" 
                  value={offerLetter.applicationDeadline} 
                />
                <InfoItem 
                  icon={Clock} 
                  label="Acceptance Deadline" 
                  value={offerLetter.acceptanceDeadline} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-blue-800 break-words overflow-hidden text-wrap">Tuition Fee</span>
                  </div>
                  <div className="text-lg font-bold text-blue-900 break-words overflow-hidden text-wrap">
                    {offerLetter.tuitionFee || 'Not specified'}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium text-green-800 break-words overflow-hidden text-wrap">Application Fee</span>
                  </div>
                  <div className="text-lg font-bold text-green-900 break-words overflow-hidden text-wrap">
                    {offerLetter.applicationFee || 'Not specified'}
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium text-orange-800 break-words overflow-hidden text-wrap">Deposit Required</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900 break-words overflow-hidden text-wrap">
                    {offerLetter.depositRequired || 'Not specified'}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-purple-800 break-words overflow-hidden text-wrap">Total Cost</span>
                  </div>
                  <div className="text-lg font-bold text-purple-900 break-words overflow-hidden text-wrap">
                    {offerLetter.totalCost || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Additional Financial Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Calendar} 
                  label="Payment Schedule" 
                  value={offerLetter.paymentSchedule} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 flex-shrink-0" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 break-words overflow-hidden text-wrap">Academic Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border break-words overflow-hidden text-wrap">
                    {formatRequirementsText(offerLetter.academicRequirements)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 break-words overflow-hidden text-wrap">English Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border break-words overflow-hidden text-wrap">
                    {formatRequirementsText(offerLetter.englishRequirements)}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2 break-words overflow-hidden text-wrap">Document Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border break-words overflow-hidden text-wrap">
                    {formatRequirementsText(offerLetter.documentRequirements)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </AdminLayout>
  );
}