import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Building, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Shield,
  BookOpen,
  Home,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface CoeInformation {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number | null;
  documentText: string | null;
  studentName: string | null;
  studentId: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  institutionName: string | null;
  institutionCode: string | null;
  cricosCode: string | null;
  institutionAddress: string | null;
  institutionPhone: string | null;
  institutionEmail: string | null;
  courseName: string | null;
  courseCode: string | null;
  courseLevel: string | null;
  fieldOfStudy: string | null;
  courseDuration: string | null;
  studyMode: string | null;
  campusLocation: string | null;
  commencementDate: string | null;
  completionDate: string | null;
  expectedGraduation: string | null;
  enrollmentStatus: string | null;
  studyLoad: string | null;
  tuitionFees: string | null;
  totalCourseFee: string | null;
  feesPerYear: string | null;
  feesPerSemester: string | null;
  oshcProvider: string | null;
  oshcCost: string | null;
  oshcDuration: string | null;
  visaSubclass: string | null;
  visaConditions: string | null;
  workRights: string | null;
  studyRequirements: string | null;
  academicRequirements: string | null;
  englishRequirements: string | null;
  attendanceRequirements: string | null;
  progressRequirements: string | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  studentSupportContact: string | null;
  accommodationInfo: string | null;
  orientationInfo: string | null;
  additionalNotes: string | null;
  terms: string | null;
  isPublic: boolean | null;
  createdAt: string;
}

// Helper function to format and highlight text
const formatText = (text: string | null) => {
  if (!text) return null;
  
  // Split by common delimiters and format as list items
  const items = text.split(/[•\-\*]\s+|(?:\r?\n)+/).filter(item => item.trim());
  
  if (items.length > 1) {
    return (
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>{highlightImportantTerms(item.trim())}</span>
          </li>
        ))}
      </ul>
    );
  }
  
  return <span>{highlightImportantTerms(text)}</span>;
};

// Helper function to highlight important terms
const highlightImportantTerms = (text: string) => {
  // Patterns for highlighting
  const patterns = [
    { regex: /\$[\d,]+(?:\.\d{2})?/g, className: 'bg-green-100 text-green-800 px-1 rounded' }, // Money
    { regex: /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{1,2} \w+ \d{4}/g, className: 'bg-purple-100 text-purple-800 px-1 rounded' }, // Dates
    { regex: /\d+%/g, className: 'bg-blue-100 text-blue-800 px-1 rounded' }, // Percentages
    { regex: /\b(?:CRICOS|OSHC|IELTS|TOEFL|PTE|GPA)\b/gi, className: 'bg-orange-100 text-orange-800 px-1 rounded' }, // Important terms
  ];

  let result = text;
  patterns.forEach(({ regex, className }) => {
    result = result.replace(regex, (match) => `<span class="${className}">${match}</span>`);
  });

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

export default function CoeDetails() {
  const params = useParams<{ id: string }>();
  const coeId = params?.id;

  const { data: coe, isLoading, error } = useQuery<CoeInformation>({
    queryKey: [`/api/coe-info/${coeId}`],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !coe) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">COE document not found</h3>
              <p className="text-muted-foreground text-center">
                The requested COE document could not be found or you don't have permission to view it.
              </p>
              <Link href="/coe-info">
                <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to COE Information
                </Button>
              </Link>
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/coe-info">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{coe.fileName}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Uploaded: {format(new Date(coe.createdAt), 'MMMM dd, yyyy')}</span>
              {coe.fileSize && (
                <span>Size: {(coe.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.studentName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student Name</label>
                  <p className="font-medium">{coe.studentName}</p>
                </div>
              )}
              {coe.studentId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                  <p className="font-medium">{coe.studentId}</p>
                </div>
              )}
              {coe.dateOfBirth && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p>{highlightImportantTerms(coe.dateOfBirth)}</p>
                </div>
              )}
              {coe.nationality && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <p>{coe.nationality}</p>
                </div>
              )}
              {coe.passportNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                  <p className="font-mono">{coe.passportNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.institutionName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution Name</label>
                  <p className="font-medium">{coe.institutionName}</p>
                </div>
              )}
              {coe.cricosCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CRICOS Code</label>
                  <p className="font-mono">{highlightImportantTerms(coe.cricosCode)}</p>
                </div>
              )}
              {coe.institutionCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Institution Code</label>
                  <p className="font-mono">{coe.institutionCode}</p>
                </div>
              )}
              {coe.institutionAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    {coe.institutionAddress}
                  </p>
                </div>
              )}
              {coe.institutionPhone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {coe.institutionPhone}
                  </p>
                </div>
              )}
              {coe.institutionEmail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {coe.institutionEmail}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.courseName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course Name</label>
                  <p className="font-medium">{coe.courseName}</p>
                </div>
              )}
              {coe.courseCode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course Code</label>
                  <p className="font-mono">{coe.courseCode}</p>
                </div>
              )}
              {coe.courseLevel && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Course Level</label>
                  <Badge variant="secondary">{coe.courseLevel}</Badge>
                </div>
              )}
              {coe.fieldOfStudy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Field of Study</label>
                  <p>{coe.fieldOfStudy}</p>
                </div>
              )}
              {coe.courseDuration && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {coe.courseDuration}
                  </p>
                </div>
              )}
              {coe.studyMode && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Study Mode</label>
                  <Badge variant="outline">{coe.studyMode}</Badge>
                </div>
              )}
              {coe.campusLocation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Campus Location</label>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {coe.campusLocation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enrollment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Enrollment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.commencementDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commencement Date</label>
                  <p>{highlightImportantTerms(coe.commencementDate)}</p>
                </div>
              )}
              {coe.completionDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Completion Date</label>
                  <p>{highlightImportantTerms(coe.completionDate)}</p>
                </div>
              )}
              {coe.expectedGraduation && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expected Graduation</label>
                  <p>{highlightImportantTerms(coe.expectedGraduation)}</p>
                </div>
              )}
              {coe.enrollmentStatus && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Enrollment Status</label>
                  <Badge variant="default">{coe.enrollmentStatus}</Badge>
                </div>
              )}
              {coe.studyLoad && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Study Load</label>
                  <p>{coe.studyLoad}</p>
                </div>
              )}
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
              {coe.tuitionFees && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tuition Fees</label>
                  <p className="font-medium">{highlightImportantTerms(coe.tuitionFees)}</p>
                </div>
              )}
              {coe.totalCourseFee && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Course Fee</label>
                  <p className="font-medium">{highlightImportantTerms(coe.totalCourseFee)}</p>
                </div>
              )}
              {coe.feesPerYear && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fees Per Year</label>
                  <p>{highlightImportantTerms(coe.feesPerYear)}</p>
                </div>
              )}
              {coe.feesPerSemester && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fees Per Semester</label>
                  <p>{highlightImportantTerms(coe.feesPerSemester)}</p>
                </div>
              )}
              {coe.oshcProvider && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">OSHC Provider</label>
                  <p>{highlightImportantTerms(coe.oshcProvider)}</p>
                </div>
              )}
              {coe.oshcCost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">OSHC Cost</label>
                  <p>{highlightImportantTerms(coe.oshcCost)}</p>
                </div>
              )}
              {coe.oshcDuration && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">OSHC Duration</label>
                  <p>{coe.oshcDuration}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visa Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Visa Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.visaSubclass && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visa Subclass</label>
                  <Badge variant="default">{coe.visaSubclass}</Badge>
                </div>
              )}
              {coe.visaConditions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Visa Conditions</label>
                  <div className="text-sm">{formatText(coe.visaConditions)}</div>
                </div>
              )}
              {coe.workRights && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Work Rights</label>
                  <div className="text-sm">{formatText(coe.workRights)}</div>
                </div>
              )}
              {coe.studyRequirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Study Requirements</label>
                  <div className="text-sm">{formatText(coe.studyRequirements)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requirements Section */}
        {(coe.academicRequirements || coe.englishRequirements || coe.attendanceRequirements || coe.progressRequirements) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {coe.academicRequirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Academic Requirements</label>
                  <div className="mt-2 text-sm">{formatText(coe.academicRequirements)}</div>
                </div>
              )}
              {coe.englishRequirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">English Requirements</label>
                  <div className="mt-2 text-sm">{formatText(coe.englishRequirements)}</div>
                </div>
              )}
              {coe.attendanceRequirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Attendance Requirements</label>
                  <div className="mt-2 text-sm">{formatText(coe.attendanceRequirements)}</div>
                </div>
              )}
              {coe.progressRequirements && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Progress Requirements</label>
                  <div className="mt-2 text-sm">{formatText(coe.progressRequirements)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        {(coe.contactPerson || coe.contactEmail || coe.contactPhone || coe.studentSupportContact) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coe.contactPerson && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                  <p className="font-medium">{coe.contactPerson}</p>
                </div>
              )}
              {coe.contactEmail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {coe.contactEmail}
                  </p>
                </div>
              )}
              {coe.contactPhone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Phone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {coe.contactPhone}
                  </p>
                </div>
              )}
              {coe.studentSupportContact && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student Support Contact</label>
                  <p>{coe.studentSupportContact}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(coe.accommodationInfo || coe.orientationInfo || coe.additionalNotes || coe.terms) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {coe.accommodationInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Accommodation Information</label>
                  <div className="mt-2 text-sm">{formatText(coe.accommodationInfo)}</div>
                </div>
              )}
              {coe.orientationInfo && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Orientation Information</label>
                  <div className="mt-2 text-sm">{formatText(coe.orientationInfo)}</div>
                </div>
              )}
              {coe.additionalNotes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                  <div className="mt-2 text-sm">{formatText(coe.additionalNotes)}</div>
                </div>
              )}
              {coe.terms && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Terms and Conditions</label>
                  <div className="mt-2 text-sm">{formatText(coe.terms)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}