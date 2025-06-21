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
  ArrowLeft,
  Shield,
  CreditCard,
  Heart
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

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

export default function UserCoeDetails() {
  const { id } = useParams();

  const { data: coe, isLoading, error } = useQuery({
    queryKey: ['/api/coe-info', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading COE details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !coe) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">COE Not Found</h3>
          <p className="text-gray-600 mb-4">The requested COE details could not be found.</p>
          <Link href="/coe-info">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
              Back to COE Information
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 flex-shrink-0" />
              </div>
              <div>
                <h1 className="text-2xl font-bold break-words overflow-hidden text-wrap">COE Certificate Information</h1>
                <p className="text-blue-100 break-words overflow-hidden text-wrap">Comprehensive certificate of enrollment details</p>
              </div>
            </div>
            <Link href="/coe-info">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                Back to COE List
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">COE Number</p>
                    <p className="text-white font-medium break-words overflow-hidden text-wrap">{coe.coeNumber || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Analysis Date</p>
                    <p className="text-white font-medium break-words overflow-hidden text-wrap">
                      {coe.createdAt ? new Date(coe.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-200 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-200">Provider</p>
                    <p className="text-white font-medium break-words overflow-hidden text-wrap">{coe.providerName || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COE Reference Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                COE Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="COE Number" value={coe.coeNumber} icon={FileText} />
              <InfoItem label="COE Issue Date" value={coe.coeIssueDate} icon={Calendar} />
              <InfoItem label="Document Type" value={coe.documentType} />
              <InfoItem label="Provider Name" value={coe.providerName} icon={Building} />
              <InfoItem label="Provider CRICOS Code" value={coe.providerCricosCode} />
              <InfoItem label="Provider Registration" value={coe.providerRegistration} />
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 flex-shrink-0" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Given Names" value={coe.givenNames} icon={User} />
              <InfoItem label="Family Name" value={coe.familyName} icon={User} />
              <InfoItem label="Date of Birth" value={coe.dateOfBirth} icon={Calendar} />
              <InfoItem label="Gender" value={coe.gender} />
              <InfoItem label="Nationality" value={coe.nationality} />
              <InfoItem label="Passport Number" value={coe.passportNumber} />
              <InfoItem label="Student ID" value={coe.studentId} />
              <InfoItem label="Previous Study" value={coe.previousStudy} />
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 flex-shrink-0" />
                Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Provider Name" value={coe.providerName} icon={Building} />
              <InfoItem label="Provider CRICOS Code" value={coe.providerCricosCode} />
              <InfoItem label="Provider Address" value={coe.providerAddress} icon={MapPin} />
              <InfoItem label="Provider Contact" value={coe.providerContact} icon={Phone} />
              <InfoItem label="Provider Email" value={coe.providerEmail} icon={Mail} />
              <InfoItem label="Campus Name" value={coe.campusName} />
              <InfoItem label="Campus Address" value={coe.campusAddress} icon={MapPin} />
              <InfoItem label="Postal Address" value={coe.postalAddress} icon={MapPin} />
            </CardContent>
          </Card>

          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 flex-shrink-0" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Course Name" value={coe.courseName} />
              <InfoItem label="Course Level" value={coe.courseLevel} />
              <InfoItem label="Course CRICOS Code" value={coe.courseCricosCode} />
              {coe.courseStartDate && (
                <InfoItem 
                  label="Course Start Date" 
                  value={(() => {
                    try {
                      const date = new Date(coe.courseStartDate);
                      return isNaN(date.getTime()) ? coe.courseStartDate : format(date, 'MMMM dd, yyyy');
                    } catch {
                      return coe.courseStartDate;
                    }
                  })()} 
                  icon={Calendar} 
                />
              )}
              {coe.courseEndDate && (
                <InfoItem 
                  label="Course End Date" 
                  value={(() => {
                    try {
                      const date = new Date(coe.courseEndDate);
                      return isNaN(date.getTime()) ? coe.courseEndDate : format(date, 'MMMM dd, yyyy');
                    } catch {
                      return coe.courseEndDate;
                    }
                  })()} 
                  icon={Calendar} 
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 flex-shrink-0" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-700">Initial Pre-paid Tuition</span>
                </div>
                <p className="text-lg font-bold text-green-800 break-words overflow-hidden text-wrap">
                  {coe.initialPrePaidTuitionFee || 'Not specified'}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-700">Total Tuition Fee</span>
                </div>
                <p className="text-lg font-bold text-blue-800 break-words overflow-hidden text-wrap">
                  {coe.totalTuitionFee || 'Not specified'}
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-purple-700">Non-tuition Fees</span>
                </div>
                <p className="text-lg font-bold text-purple-800 break-words overflow-hidden text-wrap">
                  {coe.nonTuitionFees || 'Not specified'}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-orange-700">Weekly Expenses</span>
                </div>
                <p className="text-lg font-bold text-orange-800 break-words overflow-hidden text-wrap">
                  {coe.weeklyExpenses || 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <InfoItem label="Currency" value={coe.currency} icon={DollarSign} />
              <InfoItem label="Payment Terms" value={coe.paymentTerms} />
              <InfoItem label="Refund Policy" value={coe.refundPolicy} />
              <InfoItem label="Financial Hardship Policy" value={coe.financialHardshipPolicy} />
            </div>
          </CardContent>
        </Card>

        {/* OSHC Information */}
        {(coe.providerArrangedOshc || coe.oshcProviderName || coe.oshcCoverType) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 flex-shrink-0" />
                OSHC Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Provider Arranged OSHC" value={coe.providerArrangedOshc} />
              <InfoItem label="OSHC Provider Name" value={coe.oshcProviderName} />
              <InfoItem label="OSHC Cover Type" value={coe.oshcCoverType} />
              {coe.oshcStartDate && (
                <InfoItem 
                  label="OSHC Start Date" 
                  value={(() => {
                    try {
                      const date = new Date(coe.oshcStartDate);
                      return isNaN(date.getTime()) ? coe.oshcStartDate : format(date, 'MMMM dd, yyyy');
                    } catch {
                      return coe.oshcStartDate;
                    }
                  })()} 
                  icon={Calendar} 
                />
              )}
              {coe.oshcEndDate && (
                <InfoItem 
                  label="OSHC End Date" 
                  value={(() => {
                    try {
                      const date = new Date(coe.oshcEndDate);
                      return isNaN(date.getTime()) ? coe.oshcEndDate : format(date, 'MMMM dd, yyyy');
                    } catch {
                      return coe.oshcEndDate;
                    }
                  })()} 
                  icon={Calendar} 
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* English Language Test Information */}
        {(coe.englishTestType || coe.englishTestScore) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                English Language Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Test Type" value={coe.englishTestType} />
              <InfoItem label="Test Score" value={coe.englishTestScore} />
              {coe.englishTestDate && (
                <InfoItem 
                  label="Test Date" 
                  value={(() => {
                    try {
                      const date = new Date(coe.englishTestDate);
                      return isNaN(date.getTime()) ? coe.englishTestDate : format(date, 'MMMM dd, yyyy');
                    } catch {
                      return coe.englishTestDate;
                    }
                  })()} 
                  icon={Calendar} 
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Compliance and Legal Information */}
        {(coe.esosActCompliance || coe.cricosRegistration || coe.nationalCodeCompliance) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 flex-shrink-0" />
                Compliance & Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="ESOS Act Compliance" value={coe.esosActCompliance} />
              <InfoItem label="CRICOS Registration" value={coe.cricosRegistration} />
              <InfoItem label="National Code Compliance" value={coe.nationalCodeCompliance} />
              <InfoItem label="Migration Regulations" value={coe.migrationRegulations} />
              <InfoItem label="Visa Conditions" value={coe.visaConditions} />
              <InfoItem label="Legal Disclaimers" value={coe.legalDisclaimers} />
              <InfoItem label="Student Rights" value={coe.studentRights} />
              <InfoItem label="Complaints Process" value={coe.complaintsProcess} />
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(coe.additionalRequirements || coe.specialConditions || coe.additionalNotes) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Additional Requirements" value={coe.additionalRequirements} />
              <InfoItem label="Special Conditions" value={coe.specialConditions} />
              <InfoItem label="Additional Notes" value={coe.additionalNotes} />
              <InfoItem label="Orientation Information" value={coe.orientationInformation} />
              <InfoItem label="Support Services" value={coe.supportServices} />
              <InfoItem label="Academic Calendar" value={coe.academicCalendar} />
              <InfoItem label="Assessment Methods" value={coe.assessmentMethods} />
              <InfoItem label="Credit Transfer" value={coe.creditTransfer} />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}