import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  FileText, 
  GraduationCap, 
  Building2, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  CreditCard,
  Shield,
  BookOpen,
  Globe,
  Users,
  FileCheck
} from "lucide-react";

interface OfferLetterInfo {
  id: number;
  fileName: string;
  institutionName: string | null;
  tradingAs: string | null;
  institutionAddress: string | null;
  institutionPhone: string | null;
  institutionEmail: string | null;
  institutionWebsite: string | null;
  cricosProviderCode: string | null;
  abn: string | null;
  
  studentName: string | null;
  studentId: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  citizenship: string | null;
  passportNumber: string | null;
  emailAddress: string | null;
  contactNumber: string | null;
  
  courseName: string | null;
  courseLevel: string | null;
  cricosCode: string | null;
  courseDuration: string | null;
  courseStartDate: string | null;
  courseEndDate: string | null;
  studyMode: string | null;
  campusLocation: string | null;
  
  totalTuitionFees: string | null;
  enrollmentFee: string | null;
  totalFeeDue: string | null;
  paymentSchedule: any;
  scholarshipAmount: string | null;
  paymentMethods: any;
  bankDetails: any;
  
  offerConditions: any;
  attendanceRequirements: string | null;
  academicProgressRequirements: string | null;
  refundPolicy: string | null;
  refundConditions: any;
  
  oshcRequirement: string | null;
  visaRequirements: string | null;
  workRights: string | null;
  
  admissionsOfficer: string | null;
  admissionsEmail: string | null;
  studentServicesContact: string | null;
  
  acceptanceDeadline: string | null;
  applicationId: string | null;
  offerDate: string | null;
  
  createdAt: string;
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  className = "" 
}: { 
  icon: React.ComponentType<any>; 
  label: string; 
  value: string | null; 
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-700 block break-words overflow-hidden text-wrap">
          {label}:
        </span>
        <span className="text-sm text-gray-900 block break-words overflow-hidden text-wrap">
          {value || "Not specified in document"}
        </span>
      </div>
    </div>
  );
}

function formatPaymentSchedule(schedule: any): string {
  if (!schedule) return "Not specified in document";
  
  try {
    const parsedSchedule = typeof schedule === 'string' ? JSON.parse(schedule) : schedule;
    if (Array.isArray(parsedSchedule)) {
      return parsedSchedule.map((payment: any) => 
        `${payment.studyPeriod || 'Period'}: ${payment.fee || 'N/A'} (Due: ${payment.dueDate || 'TBA'})`
      ).join('; ');
    }
    return JSON.stringify(parsedSchedule);
  } catch {
    return schedule.toString();
  }
}

function formatRefundConditions(conditions: any): string {
  if (!conditions) return "Not specified in document";
  
  try {
    const parsedConditions = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
    if (Array.isArray(parsedConditions)) {
      return parsedConditions.map((condition: any) => 
        `${condition.reason || 'Condition'}: ${condition.refundAmount || 'N/A'} - ${condition.conditions || 'No details'}`
      ).join('; ');
    }
    return JSON.stringify(parsedConditions);
  } catch {
    return conditions.toString();
  }
}

function formatOfferConditions(conditions: any): string {
  if (!conditions) return "Not specified in document";
  
  try {
    const parsedConditions = typeof conditions === 'string' ? JSON.parse(conditions) : conditions;
    if (Array.isArray(parsedConditions)) {
      return parsedConditions.map((condition: any) => 
        `${condition.type || 'General'}: ${condition.condition || condition.requirements || 'No details specified'}`
      ).join('; ');
    }
    return JSON.stringify(parsedConditions);
  } catch {
    return conditions.toString();
  }
}

function formatBankDetails(details: any): string {
  if (!details) return "Not specified in document";
  
  try {
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    return `${parsedDetails.accountName || 'N/A'} - BSB: ${parsedDetails.bsb || 'N/A'} - Account: ${parsedDetails.accountNumber || 'N/A'}`;
  } catch {
    return details.toString();
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "Not specified in document";
  
  try {
    // Handle various date formats safely
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if not parseable
    }
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch {
    return dateString; // Return original if parsing fails
  }
}

export default function OfferLetterDetailsNew() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: offerLetterInfo, isLoading, error } = useQuery({
    queryKey: ['/api/offer-letter-information', id],
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offer letter information...</p>
        </div>
      </div>
    );
  }

  if (error || !offerLetterInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load offer letter information</p>
          <Button 
            onClick={() => setLocation('/offer-letter-information')}
            className="mt-4"
          >
            Back to Offer Letters
          </Button>
        </div>
      </div>
    );
  }

  const info = offerLetterInfo as OfferLetterInfo;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/offer-letter-information')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Offer Letter Information
          </Button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 break-words overflow-hidden text-wrap">
                    {info.fileName}
                  </h1>
                  <p className="text-gray-600 mt-1 break-words overflow-hidden text-wrap">
                    Institution: {info.institutionName || "Not specified"}
                  </p>
                  <p className="text-gray-600 break-words overflow-hidden text-wrap">
                    Course: {info.courseName || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">
                  {info.courseLevel || "Level Not Specified"}
                </Badge>
                <p className="text-sm text-gray-500">
                  Processed: {formatDate(info.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Institution Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={Building2} label="Institution Name" value={info.institutionName} />
                <InfoItem icon={Building2} label="Trading As" value={info.tradingAs} />
                <InfoItem icon={MapPin} label="Address" value={info.institutionAddress} />
                <InfoItem icon={Phone} label="Phone" value={info.institutionPhone} />
                <InfoItem icon={Mail} label="Email" value={info.institutionEmail} />
                <InfoItem icon={Globe} label="Website" value={info.institutionWebsite} />
                <InfoItem icon={FileCheck} label="CRICOS Provider Code" value={info.cricosProviderCode} />
                <InfoItem icon={Building2} label="ABN" value={info.abn} />
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600 flex-shrink-0" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={User} label="Student Name" value={info.studentName} />
                <InfoItem icon={FileText} label="Student ID" value={info.studentId} />
                <InfoItem icon={Calendar} label="Date of Birth" value={info.dateOfBirth} />
                <InfoItem icon={User} label="Gender" value={info.gender} />
                <InfoItem icon={Globe} label="Citizenship" value={info.citizenship} />
                <InfoItem icon={FileCheck} label="Passport Number" value={info.passportNumber} />
                <InfoItem icon={Mail} label="Email Address" value={info.emailAddress} />
                <InfoItem icon={Phone} label="Contact Number" value={info.contactNumber} />
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={BookOpen} label="Course Name" value={info.courseName} />
                <InfoItem icon={GraduationCap} label="Course Level" value={info.courseLevel} />
                <InfoItem icon={FileCheck} label="CRICOS Code" value={info.cricosCode} />
                <InfoItem icon={Clock} label="Duration" value={info.courseDuration} />
                <InfoItem icon={Calendar} label="Start Date" value={info.courseStartDate} />
                <InfoItem icon={Calendar} label="End Date" value={info.courseEndDate} />
                <InfoItem icon={BookOpen} label="Study Mode" value={info.studyMode} />
                <InfoItem icon={MapPin} label="Campus Location" value={info.campusLocation} />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={User} label="Admissions Officer" value={info.admissionsOfficer} />
                <InfoItem icon={Mail} label="Admissions Email" value={info.admissionsEmail} />
                <InfoItem icon={Users} label="Student Services Contact" value={info.studentServicesContact} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={DollarSign} label="Total Tuition Fees" value={info.totalTuitionFees} />
                <InfoItem icon={DollarSign} label="Enrollment Fee" value={info.enrollmentFee} />
                <InfoItem icon={DollarSign} label="Total Fee Due" value={info.totalFeeDue} />
                <InfoItem icon={DollarSign} label="Scholarship Amount" value={info.scholarshipAmount} />
                <InfoItem icon={Calendar} label="Payment Schedule" value={formatPaymentSchedule(info.paymentSchedule)} />
                <InfoItem icon={CreditCard} label="Bank Details" value={formatBankDetails(info.bankDetails)} />
              </CardContent>
            </Card>

            {/* Offer Conditions & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  Offer Conditions & Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={FileCheck} label="Offer Conditions" value={formatOfferConditions(info.offerConditions)} />
                <InfoItem icon={Clock} label="Attendance Requirements" value={info.attendanceRequirements} />
                <InfoItem icon={GraduationCap} label="Academic Progress Requirements" value={info.academicProgressRequirements} />
              </CardContent>
            </Card>

            {/* Visa & Immigration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  Visa & Immigration Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={Shield} label="OSHC Requirement" value={info.oshcRequirement} />
                <InfoItem icon={FileCheck} label="Visa Requirements" value={info.visaRequirements} />
                <InfoItem icon={Users} label="Work Rights" value={info.workRights} />
              </CardContent>
            </Card>

            {/* Refund Policy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  Refund Policy & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={Info} label="Refund Policy" value={info.refundPolicy} />
                <InfoItem icon={FileText} label="Refund Conditions" value={formatRefundConditions(info.refundConditions)} />
              </CardContent>
            </Card>

            {/* Administrative Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  Administrative Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoItem icon={Calendar} label="Acceptance Deadline" value={info.acceptanceDeadline} />
                <InfoItem icon={FileText} label="Application ID" value={info.applicationId} />
                <InfoItem icon={Calendar} label="Offer Date" value={info.offerDate} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}