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
  Home,
  Plane,
  ArrowLeft
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Link } from 'wouter';

export function OfferLetterDetails() {
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
              <InfoItem 
                icon={<DollarSign className="h-4 w-4" />}
                label="Tuition Fee" 
                value={offerLetter.tuitionFee} 
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
                icon={<DollarSign className="h-4 w-4" />}
                label="Total Cost" 
                value={offerLetter.totalCost} 
              />
              <InfoItem 
                icon={<Calendar className="h-4 w-4" />}
                label="Payment Schedule" 
                value={offerLetter.paymentSchedule} 
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
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {offerLetter.academicRequirements || 'Not specified'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>English Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {offerLetter.englishRequirements || 'Not specified'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {offerLetter.documentRequirements || 'Not specified'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Notes */}
        {offerLetter.additionalNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {offerLetter.additionalNotes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Processing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(offerLetter.fileSize / 1024 / 1024).toFixed(2)} MB
              </div>
              <div className="text-sm text-muted-foreground">File Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {offerLetter.tokensUsed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Tokens Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {offerLetter.processingTime ? `${(offerLetter.processingTime / 1000).toFixed(1)}s` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Processing Time</div>
            </div>
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
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="text-sm text-muted-foreground">Not specified</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {isLink && value.startsWith('http') ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <div className="text-sm">{value}</div>
        )}
      </div>
    </div>
  );
}