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
import { AdminLayout } from '@/components/AdminLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface CoeInformation {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number | null;
  documentText: string | null;
  coeNumber: string | null;
  coeCreatedDate: string | null;
  coeUpdatedDate: string | null;
  providerName: string | null;
  providerCricosCode: string | null;
  tradingAs: string | null;
  providerPhone: string | null;
  providerFax: string | null;
  providerEmail: string | null;
  courseName: string | null;
  courseCricosCode: string | null;
  courseLevel: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  initialPrePaidTuitionFee: string | null;
  otherPrePaidNonTuitionFee: string | null;
  totalTuitionFee: string | null;
  providerStudentId: string | null;
  familyName: string | null;
  givenNames: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  countryOfBirth: string | null;
  nationality: string | null;
  providerArrangedOshc: string | null;
  oshcStartDate: string | null;
  oshcEndDate: string | null;
  oshcProviderName: string | null;
  oshcCoverType: string | null;
  englishTestType: string | null;
  englishTestScore: string | null;
  englishTestDate: string | null;
  comments: string | null;
  scholarshipInfo: string | null;
  esosActCompliance: string | null;
  cricosRegistration: string | null;
  nationalCodeCompliance: string | null;
  governmentDataSharing: string | null;
  importantNotes: string | null;
  studyAustraliaLink: string | null;
  qualityAssuranceInfo: string | null;
  visaApplicationInfo: string | null;
  veVOInfo: string | null;
  homeAffairsLink: string | null;
  campusLocation: string | null;
  startDate: string | null;
  endDate: string | null;
  totalTuition: string | null;
  tuitionPerSemester: string | null;
  applicationFee: string | null;
  materialFee: string | null;
  otherFees: string | null;
  paymentSchedule: string | null;
  oshcProvider: string | null;
  oshcCoverage: string | null;
  oshcCost: string | null;
  oshcDuration: string | null;
  languageRequirement: string | null;
  minimumScore: string | null;
  testDate: string | null;
  healthInsuranceRequired: boolean | null;
  accommodationInfo: string | null;
  visaConditions: string | null;
  workRights: string | null;
  attendanceRequirement: string | null;
  academicRequirements: string | null;
  complianceNotes: string | null;
  keyFindings: string | null;
  nextSteps: string | null;
  riskAssessment: string | null;
  recommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCoeDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: coeInfo, isLoading, error } = useQuery({
    queryKey: ['/api/admin/coe-info', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/coe-info/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch COE details');
      }
      const data = await response.json();
      console.log('Admin COE Data:', data);
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

  if (error || !coeInfo) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">COE document not found or access denied</p>
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
              <h1 className="text-3xl font-bold">COE Information</h1>
              <p className="text-muted-foreground">{coeInfo.fileName}</p>
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
                <p className="font-semibold">{coeInfo.userId}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">File Name</p>
                <p className="font-semibold break-words overflow-hidden" title={coeInfo.fileName}>{coeInfo.fileName}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Upload Date</p>
                <p className="font-semibold">{coeInfo.createdAt ? new Date(coeInfo.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Personal Details</p>
                <div className="space-y-2">
                  <p className="font-semibold break-words overflow-hidden">{coeInfo.studentName || 'Not specified'}</p>
                  <p className="text-sm text-muted-foreground break-words overflow-hidden">Student ID: {coeInfo.studentId || 'Not specified'}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Date of Birth</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="break-words overflow-hidden">{coeInfo.dateOfBirth || 'Not specified'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Nationality</p>
                <p className="break-words overflow-hidden">{coeInfo.nationality || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Passport Number</p>
                <p className="font-mono text-sm break-words overflow-hidden">{coeInfo.passportNumber || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Institution Details</p>
                <div className="space-y-2">
                  <p className="font-semibold break-words overflow-hidden">{coeInfo.institutionName || 'Not specified'}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Code: {coeInfo.institutionCode || 'N/A'}</Badge>
                    <Badge variant="outline">CRICOS: {coeInfo.cricosCode || 'N/A'}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Address</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <p className="text-sm break-words overflow-hidden">{coeInfo.institutionAddress || 'Not specified'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Contact Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm break-words overflow-hidden">{coeInfo.institutionPhone || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm break-words overflow-hidden">{coeInfo.institutionEmail || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Course Details</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="font-semibold break-words overflow-hidden">{coeInfo.courseName || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Code: {coeInfo.courseCode || 'N/A'}</Badge>
                    <Badge variant="outline">Level: {coeInfo.courseLevel || 'N/A'}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Field of Study</p>
                <p className="break-words overflow-hidden">{coeInfo.fieldOfStudy || 'Not specified'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Duration & Mode</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">Duration: {coeInfo.courseDuration || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">Mode: {coeInfo.studyMode || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-1">Study Period</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">Start: {coeInfo.startDate || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">End: {coeInfo.endDate || 'Not specified'}</p>
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
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="font-medium text-green-800">Total Tuition</p>
                </div>
                <p className="text-lg font-bold text-green-900 break-words overflow-hidden">{coeInfo.totalTuition || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="font-medium text-blue-800">Per Semester</p>
                </div>
                <p className="text-lg font-bold text-blue-900 break-words overflow-hidden">{coeInfo.tuitionPerSemester || 'Not specified'}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <p className="font-medium text-orange-800">Application Fee</p>
                </div>
                <p className="text-lg font-bold text-orange-900 break-words overflow-hidden">{coeInfo.applicationFee || 'Not specified'}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="font-medium text-muted-foreground mb-2">Additional Fees</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Material Fee:</span>
                    <span className="font-medium break-words overflow-hidden">{coeInfo.materialFee || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Fees:</span>
                    <span className="font-medium break-words overflow-hidden">{coeInfo.otherFees || 'Not specified'}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium text-muted-foreground mb-2">Payment Schedule</p>
                <p className="text-sm bg-gray-50 p-3 rounded border break-words overflow-hidden">
                  {coeInfo.paymentSchedule || 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Insurance (OSHC) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Health Insurance (OSHC)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Provider Details</p>
                <div className="space-y-2">
                  <p className="font-semibold break-words overflow-hidden">{coeInfo.oshcProvider || 'Not specified'}</p>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm break-words overflow-hidden">Coverage: {coeInfo.oshcCoverage || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-muted-foreground mb-1">Cost & Duration</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">Cost: {coeInfo.oshcCost || 'Not specified'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="break-words overflow-hidden">Duration: {coeInfo.oshcDuration || 'Not specified'}</p>
                  </div>
                </div>
              </div>
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
            {coeInfo.languageRequirement && (
              <div>
                <p className="font-medium mb-2">Language Requirements</p>
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <div className="space-y-2">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.languageRequirement}</p>
                    {coeInfo.minimumScore && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Min Score: {coeInfo.minimumScore}</Badge>
                        {coeInfo.testDate && <Badge variant="outline">Test Date: {coeInfo.testDate}</Badge>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {coeInfo.academicRequirements && (
              <div>
                <p className="font-medium mb-2">Academic Requirements</p>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <p className="text-sm break-words overflow-hidden">{coeInfo.academicRequirements}</p>
                </div>
              </div>
            )}

            {coeInfo.attendanceRequirement && (
              <div>
                <p className="font-medium mb-2">Attendance Requirements</p>
                <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <p className="text-sm break-words overflow-hidden">{coeInfo.attendanceRequirement}</p>
                </div>
              </div>
            )}

            {coeInfo.visaConditions && (
              <div>
                <p className="font-medium mb-2">Visa Conditions</p>
                <div className="bg-purple-50 p-4 rounded border border-purple-200">
                  <p className="text-sm break-words overflow-hidden">{coeInfo.visaConditions}</p>
                </div>
              </div>
            )}

            {coeInfo.workRights && (
              <div>
                <p className="font-medium mb-2">Work Rights</p>
                <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
                  <p className="text-sm break-words overflow-hidden">{coeInfo.workRights}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        {(coeInfo.accommodationInfo || coeInfo.complianceNotes || coeInfo.keyFindings || coeInfo.nextSteps || coeInfo.riskAssessment || coeInfo.recommendations) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {coeInfo.accommodationInfo && (
                <div>
                  <p className="font-medium mb-2">Accommodation Information</p>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.accommodationInfo}</p>
                  </div>
                </div>
              )}

              {coeInfo.keyFindings && (
                <div>
                  <p className="font-medium mb-2">Key Findings</p>
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.keyFindings}</p>
                  </div>
                </div>
              )}

              {coeInfo.riskAssessment && (
                <div>
                  <p className="font-medium mb-2">Risk Assessment</p>
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.riskAssessment}</p>
                  </div>
                </div>
              )}

              {coeInfo.recommendations && (
                <div>
                  <p className="font-medium mb-2">Recommendations</p>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.recommendations}</p>
                  </div>
                </div>
              )}

              {coeInfo.nextSteps && (
                <div>
                  <p className="font-medium mb-2">Next Steps</p>
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.nextSteps}</p>
                  </div>
                </div>
              )}

              {coeInfo.complianceNotes && (
                <div>
                  <p className="font-medium mb-2">Compliance Notes</p>
                  <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <p className="text-sm break-words overflow-hidden">{coeInfo.complianceNotes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}