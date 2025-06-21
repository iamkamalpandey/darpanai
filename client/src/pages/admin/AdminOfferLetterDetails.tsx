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

        {/* Content Grid - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Institution Information */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Building className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Institution Name</div>
                      <div className="font-medium break-words">{offerLetter.institutionName || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Address</div>
                      <div className="font-medium break-words">{offerLetter.institutionAddress || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Phone</div>
                      <div className="font-medium break-words">{offerLetter.institutionPhone || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium break-words">{offerLetter.institutionEmail || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Website</div>
                      <div className="font-medium break-words">{offerLetter.institutionWebsite || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Dates */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Important Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Start Date</div>
                      <div className="font-medium">{offerLetter.startDate || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">End Date</div>
                      <div className="font-medium">{offerLetter.endDate || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Application Deadline</div>
                      <div className="font-medium">{offerLetter.applicationDeadline || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Acceptance Deadline</div>
                      <div className="font-medium">{offerLetter.acceptanceDeadline || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Student Name</div>
                      <div className="font-medium break-words">{offerLetter.studentName || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Student ID</div>
                      <div className="font-medium">{offerLetter.studentId || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Application Number</div>
                      <div className="font-medium">{offerLetter.applicationNumber || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Documents Required */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Academic Documents Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-700 break-words">
                  {formatRequirementsText(offerLetter.academicRequirements)}
                </div>
              </CardContent>
            </Card>

            {/* Additional Documents Required */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Additional Documents Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-700 break-words">
                  {formatRequirementsText(offerLetter.documentRequirements)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Program Information */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  Program Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Program Name</div>
                      <div className="font-medium break-words">{offerLetter.programName || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Qualification</div>
                      <div className="font-medium">{offerLetter.programLevel || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Duration</div>
                      <div className="font-medium">{offerLetter.programDuration || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Study Mode</div>
                      <div className="font-medium">{offerLetter.studyMode || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="text-gray-500">Campus Location</div>
                      <div className="font-medium">{offerLetter.campusLocation || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="bg-green-50 border border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-blue-800 break-words overflow-hidden text-wrap text-sm">Tuition Fee</span>
                    </div>
                    <div className="text-lg font-bold text-blue-900 break-words overflow-hidden text-wrap">
                      {offerLetter.tuitionFee || 'Not specified'}
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-800 break-words overflow-hidden text-wrap text-sm">Application Fee</span>
                    </div>
                    <div className="text-lg font-bold text-green-900 break-words overflow-hidden text-wrap">
                      {offerLetter.applicationFee || 'Not specified'}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="font-medium text-orange-800 break-words overflow-hidden text-wrap text-sm">Deposit Required</span>
                    </div>
                    <div className="text-lg font-bold text-orange-900 break-words overflow-hidden text-wrap">
                      {offerLetter.depositRequired || 'Not specified'}
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="font-medium text-purple-800 break-words overflow-hidden text-wrap text-sm">Total Cost</span>
                    </div>
                    <div className="text-lg font-bold text-purple-900 break-words overflow-hidden text-wrap">
                      {offerLetter.totalCost || 'Not specified'}
                    </div>
                  </div>
                </div>

                {/* Payment Schedule */}
                {offerLetter.paymentSchedule && (
                  <div className="bg-white p-3 rounded border mt-4">
                    <div className="text-sm text-gray-500 mb-1">Payment Schedule</div>
                    <div className="text-sm text-gray-700 break-words">
                      {offerLetter.paymentSchedule}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* English Language Requirements */}
            <Card className="bg-white border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  English Language Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-700 break-words">
                  {formatRequirementsText(offerLetter.englishRequirements)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Summary Table */}
        <Card className="mt-6 border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-sm">Fee Type</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-sm">Amount</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-sm">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 font-medium">Tuition Fee</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
                        {offerLetter.tuitionFee || 'Not specified'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      {offerLetter.paymentSchedule || 'Payment schedule not specified'}
                    </td>
                  </tr>
                  <tr className="bg-gray-25">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Application Fee</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                        {offerLetter.applicationFee || 'Not specified'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      One-time application processing fee
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 font-medium">Deposit Required</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded text-sm">
                        {offerLetter.depositRequired || 'Not specified'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      Required to secure enrollment
                    </td>
                  </tr>
                  <tr className="bg-gray-25">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Total Estimated Cost</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-sm">
                        {offerLetter.totalCost || 'Not specified'}
                      </span>
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                      Complete program cost including all fees
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Payment Schedule Information */}
            {offerLetter.paymentSchedule && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Payment Schedule</h4>
                <div className="text-sm text-green-700 break-words">
                  {offerLetter.paymentSchedule}
                </div>
              </div>
            )}

            {/* Scholarship Information */}
            {offerLetter.scholarshipInfo && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Scholarship Information</h4>
                <div className="text-sm text-yellow-700 break-words">
                  {offerLetter.scholarshipInfo}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}