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
  Info,
  CreditCard
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

// Helper component for information items
const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: any }) => {
  if (!value) return null;
  
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="flex items-start gap-2 mt-1">
        {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />}
        <div className="break-words overflow-hidden text-wrap flex-1">
          {formatText(value)}
        </div>
      </div>
    </div>
  );
};

export default function CoeDetailsNew() {
  const { id } = useParams();
  
  const { data: coe, isLoading, error } = useQuery<CoeInformation>({
    queryKey: [`/api/coe-info/${id}`],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
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
              <h3 className="text-lg font-semibold mb-2">COE Document Not Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The requested COE document could not be found or you don't have permission to view it.
              </p>
              <Link href="/coe-information">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to COE Documents
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
            <h1 className="text-3xl font-bold tracking-tight break-words overflow-hidden text-wrap">COE Document Details</h1>
            <p className="text-muted-foreground break-words overflow-hidden text-wrap">
              Complete information extracted from {coe.fileName}
            </p>
          </div>
          <Link href="/coe-information">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
              Back to Documents
            </Button>
          </Link>
        </div>

        {/* COE Reference Information */}
        {coe.coeNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 flex-shrink-0" />
                COE Reference Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="COE Number" value={coe.coeNumber} />
              <InfoItem label="COE Created Date" value={coe.coeCreatedDate} icon={Calendar} />
              <InfoItem label="COE Updated Date" value={coe.coeUpdatedDate} icon={Clock} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 flex-shrink-0" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(coe.givenNames || coe.familyName) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student Name</label>
                  <p className="font-medium break-words overflow-hidden text-wrap">{`${coe.givenNames || ''} ${coe.familyName || ''}`.trim()}</p>
                </div>
              )}
              <InfoItem label="Student ID" value={coe.providerStudentId} />
              {coe.dateOfBirth && (
                <InfoItem 
                  label="Date of Birth" 
                  value={format(new Date(coe.dateOfBirth), 'MMMM dd, yyyy')} 
                  icon={Calendar} 
                />
              )}
              <InfoItem label="Gender" value={coe.gender} />
              <InfoItem label="Nationality" value={coe.nationality} />
              <InfoItem label="Country of Birth" value={coe.countryOfBirth} />
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
              <InfoItem label="Provider Name" value={coe.providerName} />
              <InfoItem label="Trading As" value={coe.tradingAs} />
              <InfoItem label="CRICOS Code" value={coe.providerCricosCode} />
              <InfoItem label="Phone" value={coe.providerPhone} icon={Phone} />
              <InfoItem label="Fax" value={coe.providerFax} />
              <InfoItem label="Email" value={coe.providerEmail} icon={Mail} />
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
                  value={format(new Date(coe.courseStartDate), 'MMMM dd, yyyy')} 
                  icon={Calendar} 
                />
              )}
              {coe.courseEndDate && (
                <InfoItem 
                  label="Course End Date" 
                  value={format(new Date(coe.courseEndDate), 'MMMM dd, yyyy')} 
                  icon={Calendar} 
                />
              )}
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
            <CardContent className="space-y-4">
              <InfoItem label="Total Tuition Fee" value={coe.totalTuitionFee} icon={CreditCard} />
              <InfoItem label="Initial Pre-paid Tuition Fee" value={coe.initialPrePaidTuitionFee} icon={DollarSign} />
              <InfoItem label="Other Pre-paid Non-tuition Fee" value={coe.otherPrePaidNonTuitionFee} icon={DollarSign} />
              <InfoItem label="Scholarship Information" value={coe.scholarshipInfo} />
            </CardContent>
          </Card>

          {/* OSHC Information */}
          {(coe.providerArrangedOshc || coe.oshcProviderName) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 flex-shrink-0" />
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
                    value={format(new Date(coe.oshcStartDate), 'MMMM dd, yyyy')} 
                    icon={Calendar} 
                  />
                )}
                {coe.oshcEndDate && (
                  <InfoItem 
                    label="OSHC End Date" 
                    value={format(new Date(coe.oshcEndDate), 'MMMM dd, yyyy')} 
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
                    value={format(new Date(coe.englishTestDate), 'MMMM dd, yyyy')} 
                    icon={Calendar} 
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

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
              <InfoItem label="Government Data Sharing" value={coe.governmentDataSharing} />
            </CardContent>
          </Card>
        )}

        {/* Important Notes and Information */}
        {(coe.comments || coe.importantNotes || coe.qualityAssuranceInfo) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 flex-shrink-0" />
                Important Notes & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Comments" value={coe.comments} />
              <InfoItem label="Important Notes" value={coe.importantNotes} />
              <InfoItem label="Quality Assurance Information" value={coe.qualityAssuranceInfo} />
              <InfoItem label="Study Australia Link" value={coe.studyAustraliaLink} />
            </CardContent>
          </Card>
        )}

        {/* Visa Related Information */}
        {(coe.visaApplicationInfo || coe.veVOInfo || coe.homeAffairsLink) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 flex-shrink-0" />
                Visa Related Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Visa Application Information" value={coe.visaApplicationInfo} />
              <InfoItem label="VEVO Information" value={coe.veVOInfo} />
              <InfoItem label="Home Affairs Link" value={coe.homeAffairsLink} />
            </CardContent>
          </Card>
        )}

        {/* Document Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 flex-shrink-0" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="File Name" value={coe.fileName} />
            {coe.fileSize && (
              <InfoItem label="File Size" value={`${(coe.fileSize / 1024 / 1024).toFixed(2)} MB`} />
            )}
            <InfoItem 
              label="Processed On" 
              value={format(new Date(coe.createdAt), 'MMMM dd, yyyy \'at\' h:mm a')} 
              icon={Clock} 
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}