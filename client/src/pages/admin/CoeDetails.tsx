import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { ArrowLeft, Building, GraduationCap, Calendar, DollarSign, Shield, Phone, Mail, Globe, MapPin, User, Clock, BookOpen, Info, FileCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/AdminLayout';
import { format } from 'date-fns';
import { Link } from 'wouter';

// Helper component for consistent info display
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-500 mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 mt-1">{value || 'Not specified in document'}</p>
    </div>
  </div>
);

export default function AdminCoeDetails() {
  const [match, params] = useRoute('/admin/coe-details/:id');
  const coeId = params?.id;

  const { data: coe, isLoading, error } = useQuery({
    queryKey: [`/api/admin/coe-info/${coeId}`],
    enabled: !!coeId,
  }) as { data: any; isLoading: boolean; error: any };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !coe) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/information-reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Information Reports
              </Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">COE Document Not Found</h3>
            <p className="text-gray-600">The COE document details could not be loaded.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/information-reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Information Reports
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">COE Document Details</h1>
              <p className="text-gray-600">{coe.fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            COE Information
          </Badge>
        </div>

        {/* Document Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="File Name" 
              value={coe.fileName} 
            />
            <InfoItem 
              icon={<User className="h-4 w-4" />}
              label="User ID" 
              value={coe.userId?.toString()} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Upload Date" 
              value={coe.createdAt ? format(new Date(coe.createdAt), 'MMM dd, yyyy HH:mm') : 'Not available'} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Last Updated" 
              value={coe.updatedAt ? format(new Date(coe.updatedAt), 'MMM dd, yyyy HH:mm') : 'Not available'} 
            />
          </CardContent>
        </Card>

        {/* Institution Information */}
        <div className="grid md:grid-cols-2 gap-4">
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
                value={coe.institutionName} 
              />
              <InfoItem 
                icon={<MapPin className="h-4 w-4" />}
                label="Address" 
                value={coe.institutionAddress} 
              />
              <InfoItem 
                icon={<Phone className="h-4 w-4" />}
                label="Phone" 
                value={coe.institutionPhone} 
              />
              <InfoItem 
                icon={<Mail className="h-4 w-4" />}
                label="Email" 
                value={coe.institutionEmail} 
              />
              <InfoItem 
                icon={<Info className="h-4 w-4" />}
                label="CRICOS Code" 
                value={coe.cricosCode} 
              />
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
                value={coe.studentName} 
              />
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Date of Birth" 
                value={coe.dateOfBirth} 
              />
              <InfoItem 
                icon={<Globe className="h-4 w-4" />}
                label="Nationality" 
                value={coe.nationality} 
              />
              <InfoItem 
                icon={<FileText className="h-4 w-4" />}
                label="Passport Number" 
                value={coe.passportNumber} 
              />
              <InfoItem 
                icon={<Info className="h-4 w-4" />}
                label="Student ID" 
                value={coe.studentId} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Course Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Course Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <InfoItem 
              icon={<BookOpen className="h-4 w-4" />}
              label="Course Name" 
              value={coe.courseName} 
            />
            <InfoItem 
              icon={<Info className="h-4 w-4" />}
              label="Course Code" 
              value={coe.courseCode} 
            />
            <InfoItem 
              icon={<GraduationCap className="h-4 w-4" />}
              label="Course Level" 
              value={coe.courseLevel} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Course Start Date" 
              value={coe.courseStartDate} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Course End Date" 
              value={coe.courseEndDate} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Duration" 
              value={coe.duration} 
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
          <CardContent className="grid md:grid-cols-3 gap-4">
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Total Tuition" 
              value={coe.totalTuition} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Tuition Per Year" 
              value={coe.tuitionPerYear} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Non-Tuition Fees" 
              value={coe.nonTuitionFees} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="OSHC Cost" 
              value={coe.oshcCost} 
            />
            <InfoItem 
              icon={<Info className="h-4 w-4" />}
              label="OSHC Provider" 
              value={coe.oshcProvider} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="OSHC Period" 
              value={coe.oshcPeriod} 
            />
          </CardContent>
        </Card>

        {/* Compliance Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<FileCheck className="h-4 w-4" />}
              label="Visa Conditions" 
              value={coe.visaConditions} 
            />
            <InfoItem 
              icon={<Info className="h-4 w-4" />}
              label="Work Rights" 
              value={coe.workRights} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Reporting Requirements" 
              value={coe.reportingRequirements} 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="Important Notes" 
              value={coe.importantNotes} 
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}