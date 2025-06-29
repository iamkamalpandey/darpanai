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
import { DashboardLayout } from '@/components/DashboardLayout';
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
        <ul className="space-y-3">
          {lines.map((line, index) => {
            // Remove only the list marker, keep everything else
            const cleanLine = line.replace(/^[•\-\*]\s*|^\d+\.\s*|^\w\)\s*/, '').trim();
            if (cleanLine) {
              return (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="leading-relaxed text-sm">{highlightImportantTerms(cleanLine)}</span>
                </li>
              );
            }
            return null;
          })}
        </ul>
      );
    }
  }

  // Handle line breaks as separate items
  if (hasLineBreaks) {
    const lines = text
      .split('\n')
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

export default function OfferLetterDetails() {
  const { id } = useParams();

  const { data: offerLetter, isLoading, error } = useQuery({
    queryKey: ['/api/offer-letter-info', id],
    queryFn: async () => {
      const response = await fetch(`/api/offer-letter-info/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch offer letter details');
      }
      return response.json();
    },
    enabled: !!id,
  });



  if (isLoading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  if (error || !offerLetter) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Offer letter not found or access denied</p>
              <Button asChild className="mt-4">
                <Link href="/offer-letter-info">Back to List</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/offer-letter-info">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Offer Letter Details</h1>
              <p className="text-muted-foreground">{offerLetter.fileName}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {new Date(offerLetter.createdAt).toLocaleDateString()}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<Building className="h-4 w-4" />}
                label="Institution Name" 
                value={offerLetter.institutionName} 
              />
              <InfoItem 
                icon={<MapPin className="h-4 w-4" />}
                label="Address" 
                value={offerLetter.institutionAddress} 
              />
              <InfoItem 
                icon={<Phone className="h-4 w-4" />}
                label="Phone" 
                value={offerLetter.institutionPhone} 
              />
              <InfoItem 
                icon={<Mail className="h-4 w-4" />}
                label="Email" 
                value={offerLetter.institutionEmail} 
              />
              <InfoItem 
                icon={<Globe className="h-4 w-4" />}
                label="Website" 
                value={offerLetter.institutionWebsite} 
                isLink={true}
              />
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Program Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<BookOpen className="h-4 w-4" />}
                label="Program Name" 
                value={offerLetter.programName} 
              />
              <InfoItem 
                icon={<GraduationCap className="h-4 w-4" />}
                label="Level" 
                value={offerLetter.programLevel} 
              />
              <InfoItem 
                icon={<Clock className="h-4 w-4" />}
                label="Duration" 
                value={offerLetter.programDuration} 
              />
              <InfoItem 
                icon={<BookOpen className="h-4 w-4" />}
                label="Study Mode" 
                value={offerLetter.studyMode} 
              />
              <InfoItem 
                icon={<MapPin className="h-4 w-4" />}
                label="Campus Location" 
                value={offerLetter.campusLocation} 
              />
            </CardContent>
          </Card>

          {/* Academic Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Start Date" 
                value={offerLetter.startDate} 
              />
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="End Date" 
                value={offerLetter.endDate} 
              />
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Application Deadline" 
                value={offerLetter.applicationDeadline} 
              />
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Acceptance Deadline" 
                value={offerLetter.acceptanceDeadline} 
              />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Tuition Fee</div>
                  <div className="text-lg font-semibold text-green-700">
                    {offerLetter.tuitionFee || 'Not specified'}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Application Fee</div>
                  <div className="text-lg font-semibold text-blue-700">
                    {offerLetter.applicationFee || 'Not specified'}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Deposit Required</div>
                  <div className="text-lg font-semibold text-purple-700">
                    {offerLetter.depositRequired || 'Not specified'}
                  </div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Total Cost</div>
                  <div className="text-lg font-semibold text-red-700">
                    {offerLetter.totalCost || 'Not specified'}
                  </div>
                </div>
                {offerLetter.paymentSchedule && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-800 mb-2">Payment Schedule</div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {formatRequirementsText(offerLetter.paymentSchedule)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Student Name" 
                value={offerLetter.studentName} 
              />
              <InfoItem 
                icon={<FileText className="h-4 w-4" />}
                label="Student ID" 
                value={offerLetter.studentId} 
              />
              <InfoItem 
                icon={<FileText className="h-4 w-4" />}
                label="Application Number" 
                value={offerLetter.applicationNumber} 
              />
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<DollarSign className="h-4 w-4" />}
                label="Scholarship Info" 
                value={offerLetter.scholarshipInfo} 
              />
              <InfoItem 
                icon={<Home className="h-4 w-4" />}
                label="Accommodation" 
                value={offerLetter.accommodationInfo} 
              />
              <InfoItem 
                icon={<Plane className="h-4 w-4" />}
                label="Visa Information" 
                value={offerLetter.visaInfo} 
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Contact Person" 
                value={offerLetter.contactPerson} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Requirements Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
                Academic Documents Required
              </CardTitle>
              <p className="text-sm text-muted-foreground">Documents you need to provide to confirm your educational background</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offerLetter.academicRequirements ? (
                  <div>
                    {formatRequirementsText(offerLetter.academicRequirements)}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-2">What these documents are:</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {offerLetter.academicRequirements?.includes('Diploma of Community Service') && (
                          <li>• <strong>Diploma of Community Service:</strong> Completion certificate from your community service program</li>
                        )}
                        {offerLetter.academicRequirements?.includes('Year 12') && (
                          <li>• <strong>Year 12 Academic Documents:</strong> High school completion certificates and transcripts</li>
                        )}
                        {offerLetter.academicRequirements?.includes('Original') && (
                          <li>• <strong>Original documents:</strong> Certified copies or official documents from the issuing institution</li>
                        )}
                        {offerLetter.academicRequirements?.includes('SMIC') && (
                          <li>• <strong>From SMIC:</strong> Documents must be obtained from Sydney Metropolitan Institute of TAFE</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No specific academic requirements listed</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                English Language Requirements
              </CardTitle>
              <p className="text-sm text-muted-foreground">English proficiency tests and minimum scores required</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offerLetter.englishRequirements && offerLetter.englishRequirements !== 'Not specified' ? (
                  <div>
                    {formatRequirementsText(offerLetter.englishRequirements)}
                  </div>
                ) : (
                  <div>
                    <span className="text-gray-400 italic">No English requirements specified</span>
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-2">Common English Tests:</p>
                      <ul className="text-xs text-green-600 space-y-1">
                        <li>• <strong>IELTS:</strong> Usually 6.0-7.0 overall</li>
                        <li>• <strong>TOEFL:</strong> Usually 80-100 total score</li>
                        <li>• <strong>PTE Academic:</strong> Usually 58-65 overall</li>
                        <li>• <strong>Note:</strong> Check with your institution for specific requirements</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Document Requirements */}
        {offerLetter.documentRequirements && offerLetter.documentRequirements !== offerLetter.academicRequirements && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Additional Documents Required
              </CardTitle>
              <p className="text-sm text-muted-foreground">Extra documents you may need to submit</p>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {formatRequirementsText(offerLetter.documentRequirements)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes & Terms */}
        {offerLetter.additionalNotes && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Important Notes & Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm leading-relaxed">
                  {formatRequirementsText(offerLetter.additionalNotes)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Financial Summary Table */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Fee Type</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Amount</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2 font-medium">Tuition Fee</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
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
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
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
                      <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
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
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
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
            {offerLetter.scholarshipInfo && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Scholarship Information:</h4>
                <div className="text-sm text-yellow-700">
                  {formatRequirementsText(offerLetter.scholarshipInfo)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>



      </div>
    </DashboardLayout>
  );
}

function InfoItem({ 
  icon, 
  label, 
  value, 
  isLink = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | null; 
  isLink?: boolean;
}) {
  if (!value) {
    return (
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground break-words overflow-hidden">{label}</div>
          <div className="text-sm text-muted-foreground break-words overflow-hidden">Not specified</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {isLink && value.startsWith('http') ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-words overflow-hidden"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm break-words overflow-hidden">{value}</div>
        )}
      </div>
    </div>
  );
}