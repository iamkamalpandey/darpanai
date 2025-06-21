import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { ArrowLeft, Building, GraduationCap, Calendar, DollarSign, FileText, Phone, Mail, Globe, MapPin, User, Clock, BookOpen, Info, FileCheck, Shield } from 'lucide-react';
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

export default function AdminOfferLetterDetails() {
  const [match, params] = useRoute('/admin/offer-letter-details/:id');
  const offerLetterId = params?.id;

  const { data: offerLetter, isLoading, error } = useQuery({
    queryKey: [`/api/admin/offer-letter-info/${offerLetterId}`],
    enabled: !!offerLetterId,
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

  if (error || !offerLetter) {
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Offer Letter Not Found</h3>
            <p className="text-gray-600">The offer letter details could not be loaded.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Offer Letter Details</h1>
              <p className="text-gray-600">{offerLetter.fileName}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Offer Letter Information
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
              value={offerLetter.fileName} 
            />
            <InfoItem 
              icon={<User className="h-4 w-4" />}
              label="User ID" 
              value={offerLetter.userId?.toString()} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Upload Date" 
              value={offerLetter.createdAt ? format(new Date(offerLetter.createdAt), 'MMM dd, yyyy HH:mm') : 'Not available'} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Last Updated" 
              value={offerLetter.updatedAt ? format(new Date(offerLetter.updatedAt), 'MMM dd, yyyy HH:mm') : 'Not available'} 
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
                label="Program Level" 
                value={offerLetter.programLevel} 
              />
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
                icon={<Clock className="h-4 w-4" />}
                label="Duration" 
                value={offerLetter.duration} 
              />
            </CardContent>
          </Card>
        </div>

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
              value={offerLetter.totalTuition} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Application Fee" 
              value={offerLetter.applicationFee} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Deposit Required" 
              value={offerLetter.depositRequired} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Payment Due Date" 
              value={offerLetter.paymentDueDate} 
            />
            <InfoItem 
              icon={<DollarSign className="h-4 w-4" />}
              label="Scholarship Amount" 
              value={offerLetter.scholarshipAmount} 
            />
            <InfoItem 
              icon={<Info className="h-4 w-4" />}
              label="Scholarship Conditions" 
              value={offerLetter.scholarshipConditions} 
            />
          </CardContent>
        </Card>

        {/* Requirements & Compliance */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<Info className="h-4 w-4" />}
                label="Academic Requirements" 
                value={offerLetter.academicRequirements} 
              />
              <InfoItem 
                icon={<Globe className="h-4 w-4" />}
                label="Language Requirements" 
                value={offerLetter.languageRequirements} 
              />
              <InfoItem 
                icon={<Shield className="h-4 w-4" />}
                label="Visa Requirements" 
                value={offerLetter.visaRequirements} 
              />
              <InfoItem 
                icon={<FileText className="h-4 w-4" />}
                label="Required Documents" 
                value={offerLetter.requiredDocuments} 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Acceptance Deadline" 
                value={offerLetter.acceptanceDeadline} 
              />
              <InfoItem 
                icon={<Info className="h-4 w-4" />}
                label="Important Notes" 
                value={offerLetter.importantNotes} 
              />
              <InfoItem 
                icon={<FileText className="h-4 w-4" />}
                label="Terms & Conditions" 
                value={offerLetter.termsConditions} 
              />
              <InfoItem 
                icon={<User className="h-4 w-4" />}
                label="Contact Person" 
                value={offerLetter.contactPerson} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}