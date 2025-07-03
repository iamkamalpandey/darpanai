import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  Plane,
  Home,
  Award
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";

interface InfoItemProps {
  label: string;
  value: string | null | undefined;
  icon?: any;
}

const InfoItem = ({ label, value, icon: Icon }: InfoItemProps) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-gray-600 flex-shrink-0" />}
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
    <p className="text-sm text-gray-900 break-words overflow-hidden text-wrap">
      {value && value !== 'Not specified' ? value : (
        <span className="text-gray-400 italic">Not specified</span>
      )}
    </p>
  </div>
);

const formatRequirementsText = (text: string | null | undefined): JSX.Element => {
  if (!text || text === 'Not specified') {
    return <span className="text-gray-400 italic">Not specified</span>;
  }

  const lines = text.split('\n').filter(line => line.trim());
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.match(/^[•\-\*]\s/)) {
          return (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-sm break-words overflow-hidden text-wrap">{trimmedLine.substring(2)}</span>
            </div>
          );
        }
        
        if (trimmedLine.match(/^\d+\.\s/)) {
          return (
            <div key={index} className="flex items-start gap-2">
              <span className="text-blue-500 font-medium">{trimmedLine.match(/^\d+\./)?.[0]}</span>
              <span className="text-sm break-words overflow-hidden text-wrap">{trimmedLine.replace(/^\d+\.\s/, '')}</span>
            </div>
          );
        }
        
        return (
          <p key={index} className="text-sm leading-relaxed break-words overflow-hidden text-wrap">
            {trimmedLine}
          </p>
        );
      })}
    </div>
  );
};

export default function OfferLetterDetailsAdmin() {
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
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Offer letter not found or access denied</p>
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
      <div className="p-6 space-y-6">
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
              <h1 className="text-3xl font-bold">Admin Offer Letter Details</h1>
              <p className="text-gray-600 break-words overflow-hidden text-wrap">{offerLetter.fileName}</p>
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
                <Building className="h-5 w-5 flex-shrink-0" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Institution Name" value={offerLetter.institutionName} icon={Building} />
              <InfoItem label="Institution Address" value={offerLetter.institutionAddress} icon={MapPin} />
              <InfoItem label="Institution Phone" value={offerLetter.institutionPhone} icon={Phone} />
              <InfoItem label="Institution Email" value={offerLetter.institutionEmail} icon={Mail} />
              <InfoItem label="Institution Website" value={offerLetter.institutionWebsite} icon={Globe} />
            </CardContent>
          </Card>

          {/* Program Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                Program Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Course Name" value={offerLetter.courseName} icon={BookOpen} />
              <InfoItem label="Course Level" value={offerLetter.courseLevel} icon={GraduationCap} />
              <InfoItem label="Course Duration" value={offerLetter.courseDuration} icon={Clock} />
              <InfoItem label="Study Mode" value={offerLetter.studyMode} icon={BookOpen} />
              <InfoItem label="Campus Location" value={offerLetter.campusLocation} icon={MapPin} />
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 flex-shrink-0" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Commencement Date" value={offerLetter.commencementDate} icon={Calendar} />
              <InfoItem label="Completion Date" value={offerLetter.completionDate} icon={Calendar} />
              <InfoItem label="Enrollment Deadline" value={offerLetter.enrollmentDeadline} icon={Calendar} />
              <InfoItem label="Acceptance Deadline" value={offerLetter.acceptanceDeadline} icon={Calendar} />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-700">Tuition Fees</span>
                  </div>
                  <p className="text-lg font-bold text-green-800 break-words overflow-hidden text-wrap">
                    {offerLetter.tuitionFees || 'Not specified'}
                  </p>
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
      </div>
    </AdminLayout>
  );
}