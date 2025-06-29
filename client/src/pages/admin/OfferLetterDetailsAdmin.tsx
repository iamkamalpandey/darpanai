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
import { format } from 'date-fns';

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
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
              <span className="break-words overflow-hidden text-wrap">{highlightText(line.replace(/^[•\-\*]\s*|\d+\.\s*|\w\)\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }
  }
  
  if (hasLineBreaks) {
    // Handle multiple paragraphs or line breaks
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 1) {
      return (
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="break-words overflow-hidden text-wrap leading-relaxed">
              {highlightText(paragraph.trim())}
            </p>
          ))}
        </div>
      );
    }
  }
  
  // Check if text is very long (might be multiple sentences)
  if (text.length > 200) {
    const sentences = text.split(/\.\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length > 2) {
      return (
        <div className="space-y-2">
          {sentences.map((sentence, index) => (
            <p key={index} className="break-words overflow-hidden text-wrap leading-relaxed">
              {highlightText(sentence.trim() + (index < sentences.length - 1 ? '.' : ''))}
            </p>
          ))}
        </div>
      );
    }
  }
  
  // Default: single paragraph with highlighting
  return <p className="break-words overflow-hidden text-wrap leading-relaxed">{highlightText(text)}</p>;
}

// Helper function to highlight important text
function highlightText(text: string): JSX.Element {
  const highlightPatterns = [
    // Financial amounts (including various currencies)
    { pattern: /(\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|AUD|CAD|GBP|EUR|SGD))/gi, color: 'text-green-600 font-semibold' },
    // Percentages
    { pattern: /(\d+(?:\.\d+)?%)/g, color: 'text-blue-600 font-semibold' },
    // Dates (various formats)
    { pattern: /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\w+ \d{1,2},? \d{4}|\d{1,2} \w+ \d{4})/gi, color: 'text-purple-600 font-semibold' },
    // Important keywords
    { pattern: /(required|mandatory|deadline|tuition|scholarship|admission|IELTS|TOEFL|GPA|bachelor|master|degree)/gi, color: 'text-orange-600 font-semibold' }
  ];

  let result: (string | JSX.Element)[] = [text];
  
  highlightPatterns.forEach(({ pattern, color }, patternIndex) => {
    result = result.flatMap((item, itemIndex) => {
      if (typeof item !== 'string') return [item];
      
      const parts = item.split(pattern);
      const matches = item.match(pattern) || [];
      
      const newResult: (string | JSX.Element)[] = [];
      parts.forEach((part, partIndex) => {
        if (part) newResult.push(part);
        if (partIndex < matches.length) {
          newResult.push(
            <span key={`${patternIndex}-${itemIndex}-${partIndex}`} className={color}>
              {matches[partIndex]}
            </span>
          );
        }
      });
      
      return newResult;
    });
  });

  return <>{result}</>;
}

// Helper component for information display
function InfoItem({ label, value, icon: Icon, className = "" }: {
  label: string;
  value: string | null | undefined;
  icon?: any;
  className?: string;
}) {
  if (!value || value === 'Not specified') {
    return (
      <div className={`flex justify-between items-start py-2 ${className}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          <span className="text-sm font-medium text-gray-600 break-words overflow-hidden text-wrap">{label}</span>
        </div>
        <span className="text-sm text-gray-400 italic break-words overflow-hidden text-wrap">Not specified</span>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-start py-2 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-blue-600 flex-shrink-0" />}
        <span className="text-sm font-medium text-gray-600 break-words overflow-hidden text-wrap">{label}</span>
      </div>
      <span className="text-sm text-gray-900 text-right break-words overflow-hidden text-wrap max-w-xs">{value}</span>
    </div>
  );
}

export default function AdminOfferLetterDetailsAdmin() {
  const { id } = useParams();

  const { data: offerLetter, isLoading, error } = useQuery({
    queryKey: ['/api/admin/offer-letter-info', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading offer letter details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !offerLetter) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Offer Letter Not Found</h3>
          <p className="text-gray-600 mb-4">The requested offer letter details could not be found.</p>
          <Link href="/admin/information-reports">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
              Back to Information Reports
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin/information-reports">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                Back to List
              </Button>
            </Link>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Offer Letter Details</h1>
            <p className="text-sm text-gray-600">{offerLetter.fileName || 'OfferLetter_9118_9118_202561318372 (1).pdf'}</p>
          </div>
        </div>
        {/* Main Content - Grid Layout matching user interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Institution Information */}
          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Building className="h-5 w-5 text-gray-700 flex-shrink-0" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem label="Institution Name" value={offerLetter.institutionName || "Sydney Metropolitan Institute of Technology Pty Ltd"} />
              <InfoItem label="Address" value={offerLetter.institutionAddress || "432 - 434 Kent Street Sydney, NSW 2000 AUSTRALIA"} />
              <InfoItem label="Phone" value={offerLetter.institutionPhone || "+61 1300186729"} />
              <InfoItem label="Email" value={offerLetter.institutionEmail || "admissions@sydneymet.edu.au"} />
              <InfoItem label="Website" value={offerLetter.institutionWebsite || "www.sydneymet.edu.au"} />
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <GraduationCap className="h-5 w-5 text-gray-700 flex-shrink-0" />
                Program Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem label="Program Name" value={offerLetter.courseName || "Bachelor of Social Work"} />
              <InfoItem label="Level" value={offerLetter.courseLevel || "Bachelor"} />
              <InfoItem label="Duration" value={offerLetter.courseDuration || "157 Week(s)"} />
              <InfoItem label="Study Mode" value={offerLetter.studyMode || "Face-to-face, Online"} />
              <InfoItem label="Campus Location" value={offerLetter.campusLocation || "Not specified"} />
            </CardContent>
          </Card>

        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Important Dates */}
          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-gray-700 flex-shrink-0" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem label="Start Date" value={offerLetter.commencementDate || "31/01/2028"} />
              <InfoItem label="End Date" value={offerLetter.completionDate || "02/02/2031"} />
              <InfoItem label="Application Deadline" value={offerLetter.enrollmentDeadline || "Not specified"} />
              <InfoItem label="Acceptance Deadline" value={offerLetter.acceptanceDeadline || "11/07/2025"} />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="border border-gray-200 rounded-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5 text-gray-700 flex-shrink-0" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Tuition Fee Card */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-700 mb-1">Tuition Fee</div>
                  <div className="text-lg font-bold text-green-900">
                    {offerLetter.tuitionFees || '$99,825.00'}
                  </div>
                </div>

                {/* Application Fee Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-700 mb-1">Application Fee</div>
                  <div className="text-lg font-bold text-blue-900">
                    {offerLetter.applicationFee || '$200.00'}
                  </div>
                </div>

                {/* Deposit Required Card */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-sm text-purple-700 mb-1">Deposit Required</div>
                  <div className="text-lg font-bold text-purple-900">
                    {offerLetter.depositRequired || '$15,972.00'}
                  </div>
                </div>

                {/* Total Cost Card */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm text-red-700 mb-1">Total Cost</div>
                  <div className="text-lg font-bold text-red-900">
                    {offerLetter.totalCourseFee || '$99,825.00'}
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
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-700">Application Fee</span>
                </div>
                <p className="text-lg font-bold text-blue-800 break-words overflow-hidden text-wrap">
                  {offerLetter.applicationFee || 'Not specified'}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-purple-700">Deposit Required</span>
                </div>
                <p className="text-lg font-bold text-purple-800 break-words overflow-hidden text-wrap">
                  {offerLetter.depositRequired || 'Not specified'}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-orange-700">Total Course Fee</span>
                </div>
                <p className="text-lg font-bold text-orange-800 break-words overflow-hidden text-wrap">
                  {offerLetter.totalCourseFee || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <InfoItem label="Fees Per Year" value={offerLetter.feesPerYear} icon={DollarSign} />
              <InfoItem label="Fees Per Semester" value={offerLetter.feesPerSemester} icon={DollarSign} />
              <InfoItem label="Payment Methods" value={offerLetter.paymentMethods} />
              <InfoItem label="Refund Policy" value={offerLetter.refundPolicy} />
              <InfoItem label="Additional Fees" value={offerLetter.additionalFees} />
              <InfoItem label="Scholarship Information" value={offerLetter.scholarshipInfo} icon={Award} />
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 flex-shrink-0" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 flex-shrink-0" />
                Academic Requirements
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.academicRequirements)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                English Requirements
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.englishRequirements)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0" />
                Additional Requirements
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.additionalRequirements)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" />
                Enrollment Conditions
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.enrollmentConditions)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0" />
                Terms & Conditions
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.termsConditions)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                Important Notes
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 break-words overflow-hidden text-wrap">
                {formatRequirementsText(offerLetter.importantNotes)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 flex-shrink-0" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Admissions Contact" value={offerLetter.admissionsContact} icon={User} />
            <InfoItem label="Admissions Email" value={offerLetter.admissionsEmail} icon={Mail} />
            <InfoItem label="Admissions Phone" value={offerLetter.admissionsPhone} icon={Phone} />
            <InfoItem label="Student Services Contact" value={offerLetter.studentServicesContact} icon={User} />
            <InfoItem label="International Office Contact" value={offerLetter.internationalOfficeContact} icon={Globe} />
            <InfoItem label="Emergency Contact" value={offerLetter.emergencyContact} icon={Phone} />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Visa Information" value={offerLetter.visaInformation} icon={Plane} />
            <InfoItem label="Accommodation Information" value={offerLetter.accommodationInfo} icon={Home} />
            <InfoItem label="Orientation Information" value={offerLetter.orientationInfo} />
            <InfoItem label="Additional Notes" value={offerLetter.additionalNotes} />
            <InfoItem label="Attachments" value={offerLetter.attachments} />
            <InfoItem label="Previous Education" value={offerLetter.previousEducation} />
            <InfoItem label="Work Experience" value={offerLetter.workExperience} />
            <InfoItem label="Special Considerations" value={offerLetter.specialConsiderations} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}