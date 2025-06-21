import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  Eye,
  FileCheck,
  Shield,
  Info,
  CalendarRange,
  Download,
  BarChart3,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { format } from 'date-fns';

// Detail Report Components
const OfferLetterDetailReport = ({ offerLetterId }: { offerLetterId: number }) => {
  const { data: offerLetter, isLoading } = useQuery({
    queryKey: [`/api/admin/offer-letter-info/${offerLetterId}`],
    enabled: !!offerLetterId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!offerLetter) {
    return <div className="text-red-600">Failed to load offer letter details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Complete Offer Letter Information</h3>
      </div>

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
      </div>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
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
                    <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      {offerLetter.depositRequired || 'Not specified'}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                    Initial deposit to secure admission
                  </td>
                </tr>
                <tr className="bg-gray-25">
                  <td className="border border-gray-200 px-4 py-2 font-medium">Total Cost</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
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
        </CardContent>
      </Card>

      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Program Start Date" 
              value={offerLetter.startDate} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Program End Date" 
              value={offerLetter.endDate} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Application Deadline" 
              value={offerLetter.applicationDeadline} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Acceptance Deadline" 
              value={offerLetter.acceptanceDeadline} 
            />
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
          <div className="grid md:grid-cols-2 gap-4">
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
              icon={<FileCheck className="h-4 w-4" />}
              label="Application Number" 
              value={offerLetter.applicationNumber} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem 
            icon={<GraduationCap className="h-4 w-4" />}
            label="Academic Requirements" 
            value={offerLetter.academicRequirements} 
          />
          <InfoItem 
            icon={<Globe className="h-4 w-4" />}
            label="English Requirements" 
            value={offerLetter.englishRequirements} 
          />
          <InfoItem 
            icon={<FileText className="h-4 w-4" />}
            label="Document Requirements" 
            value={offerLetter.documentRequirements} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

// COE Detail Report Component
const CoeDetailReport = ({ coeId }: { coeId: number }) => {
  const { data: coe, isLoading } = useQuery({
    queryKey: [`/api/admin/coe-info/${coeId}`],
    enabled: !!coeId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!coe) {
    return <div className="text-red-600">Failed to load COE details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Complete COE Information</h3>
      </div>

      {/* Student Information */}
      <div className="grid md:grid-cols-2 gap-4">
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
              icon={<FileText className="h-4 w-4" />}
              label="Student ID" 
              value={coe.studentId} 
            />
            <InfoItem 
              icon={<Globe className="h-4 w-4" />}
              label="Nationality" 
              value={coe.nationality} 
            />
            <InfoItem 
              icon={<FileCheck className="h-4 w-4" />}
              label="Enrollment Status" 
              value={coe.enrollmentStatus} 
            />
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
              label="Contact" 
              value={coe.institutionContact} 
            />
            <InfoItem 
              icon={<FileText className="h-4 w-4" />}
              label="CRICOS Code" 
              value={coe.cricosCode} 
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
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<BookOpen className="h-4 w-4" />}
              label="Course Name" 
              value={coe.courseName} 
            />
            <InfoItem 
              icon={<GraduationCap className="h-4 w-4" />}
              label="Course Level" 
              value={coe.courseLevel} 
            />
            <InfoItem 
              icon={<Clock className="h-4 w-4" />}
              label="Duration" 
              value={coe.courseDuration} 
            />
            <InfoItem 
              icon={<BookOpen className="h-4 w-4" />}
              label="Study Mode" 
              value={coe.studyMode} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Commencement Date" 
              value={coe.commencementDate} 
            />
            <InfoItem 
              icon={<Calendar className="h-4 w-4" />}
              label="Completion Date" 
              value={coe.completionDate} 
            />
          </div>
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
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Tuition Fees</label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-semibold text-green-700">
                  {coe.tuitionFees || 'Not specified'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">OSHC Details</label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-blue-700">
                  {coe.oshcDetails || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visa & Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Visa & Compliance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem 
            icon={<FileText className="h-4 w-4" />}
            label="Visa Subclass" 
            value={coe.visaSubclass} 
          />
          <InfoItem 
            icon={<Shield className="h-4 w-4" />}
            label="Visa Obligations" 
            value={coe.visaObligations} 
          />
          <InfoItem 
            icon={<Clock className="h-4 w-4" />}
            label="Work Rights" 
            value={coe.workRights} 
          />
          <InfoItem 
            icon={<Info className="h-4 w-4" />}
            label="Compliance Requirements" 
            value={coe.complianceRequirements} 
          />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem 
            icon={<Phone className="h-4 w-4" />}
            label="Emergency Contact" 
            value={coe.emergencyContact} 
          />
          <InfoItem 
            icon={<User className="h-4 w-4" />}
            label="Academic Advisor" 
            value={coe.academicAdvisor} 
          />
          <InfoItem 
            icon={<Mail className="h-4 w-4" />}
            label="Student Services" 
            value={coe.studentServices} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

interface OfferLetterInfo {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number | null;
  institutionName: string | null;
  programName: string | null;
  studentName: string | null;
  tuitionFees: string | null;
  totalCost: string | null;
  commencementDate: string | null;
  createdAt: string;
}

interface CoeInfo {
  id: number;
  userId: number;
  fileName: string;
  fileSize: number | null;
  studentName: string | null;
  institutionName: string | null;
  courseName: string | null;
  tuitionFees: string | null;
  commencementDate: string | null;
  enrollmentStatus: string | null;
  createdAt: string;
}

// Helper component for displaying information items with icons
const InfoItem = ({ 
  icon, 
  label, 
  value, 
  isLink = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | null; 
  isLink?: boolean;
}) => {
  if (!value || value === 'Not specified') {
    return (
      <div className="flex items-start gap-3">
        <div className="text-gray-400 mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <div className="text-sm text-gray-400 italic">Not specified</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <div className="text-sm text-gray-900">
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {value}
            </a>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for financial cards with color coding
const FinancialCard = ({ 
  title, 
  value, 
  colorScheme 
}: { 
  title: string; 
  value: string | null; 
  colorScheme: 'green' | 'blue' | 'purple' | 'red' | 'gray';
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-800 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-800 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-800 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-800 text-gray-700'
  };

  const [bgColor, borderColor, titleColor, valueColor] = colorClasses[colorScheme].split(' ');

  return (
    <div className={`p-3 ${bgColor} border ${borderColor} rounded-lg`}>
      <div className={`text-sm font-medium ${titleColor}`}>{title}</div>
      <div className={`text-lg font-semibold ${valueColor}`}>
        {value || 'Not specified'}
      </div>
    </div>
  );
};

export default function InformationReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('offer-letters');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'institution'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedOfferLetter, setExpandedOfferLetter] = useState<number | null>(null);
  const [expandedCoe, setExpandedCoe] = useState<number | null>(null);

  const { data: offerLetters, isLoading: offerLettersLoading } = useQuery({
    queryKey: ['/api/admin/offer-letter-info'],
    staleTime: 30 * 60 * 1000,
  }) as { data: OfferLetterInfo[] | undefined; isLoading: boolean };

  const { data: coeInfo, isLoading: coeLoading } = useQuery({
    queryKey: ['/api/admin/coe-info'],
    staleTime: 30 * 60 * 1000,
  }) as { data: CoeInfo[] | undefined; isLoading: boolean };

  // Helper function to filter by date
  const filterByDate = (date: string) => {
    const itemDate = new Date(date);
    const now = new Date();
    
    switch (dateFilter) {
      case '7days':
        return itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return itemDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90days':
        return itemDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  };

  // Advanced filtering for offer letters
  const filteredOfferLetters = useMemo(() => {
    return offerLetters?.filter(item => {
      const matchesSearch = !searchTerm || (
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDate = filterByDate(item.createdAt);
      
      const matchesInstitution = !institutionFilter || 
        item.institutionName?.toLowerCase().includes(institutionFilter.toLowerCase());

      return matchesSearch && matchesDate && matchesInstitution;
    })?.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.fileName || '').localeCompare(b.fileName || '');
          break;
        case 'institution':
          comparison = (a.institutionName || '').localeCompare(b.institutionName || '');
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    }) || [];
  }, [offerLetters, searchTerm, dateFilter, institutionFilter, sortBy, sortOrder]);

  // Advanced filtering for COE info
  const filteredCoeInfo = useMemo(() => {
    return coeInfo?.filter(item => {
      const matchesSearch = !searchTerm || (
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesDate = filterByDate(item.createdAt);
      
      const matchesInstitution = !institutionFilter || 
        item.institutionName?.toLowerCase().includes(institutionFilter.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        item.enrollmentStatus?.toLowerCase() === statusFilter;

      return matchesSearch && matchesDate && matchesInstitution && matchesStatus;
    })?.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.fileName || '').localeCompare(b.fileName || '');
          break;
        case 'institution':
          comparison = (a.institutionName || '').localeCompare(b.institutionName || '');
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    }) || [];
  }, [coeInfo, searchTerm, dateFilter, institutionFilter, statusFilter, sortBy, sortOrder]);

  const OfferLetterCard = ({ offerLetter }: { offerLetter: OfferLetterInfo }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{offerLetter.fileName}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {format(new Date(offerLetter.createdAt), 'MMM dd, yyyy')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoItem 
            icon={<Building className="h-4 w-4" />}
            label="Institution" 
            value={offerLetter.institutionName} 
          />
          <InfoItem 
            icon={<GraduationCap className="h-4 w-4" />}
            label="Program" 
            value={offerLetter.programName} 
          />
          <InfoItem 
            icon={<User className="h-4 w-4" />}
            label="Student" 
            value={offerLetter.studentName} 
          />
          <InfoItem 
            icon={<Calendar className="h-4 w-4" />}
            label="Commencement" 
            value={offerLetter.commencementDate} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <FinancialCard 
            title="Tuition Fees" 
            value={offerLetter.tuitionFees} 
            colorScheme="green" 
          />
          <FinancialCard 
            title="Total Cost" 
            value={offerLetter.totalCost} 
            colorScheme="red" 
          />
        </div>

        <div className="pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setExpandedOfferLetter(expandedOfferLetter === offerLetter.id ? null : offerLetter.id)}
          >
            {expandedOfferLetter === offerLetter.id ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </Button>
        </div>
        
        {/* Expanded Details Section */}
        {expandedOfferLetter === offerLetter.id && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <OfferLetterDetailReport offerLetterId={offerLetter.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CoeCard = ({ coe }: { coe: CoeInfo }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">{coe.fileName}</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {format(new Date(coe.createdAt), 'MMM dd, yyyy')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <InfoItem 
            icon={<Building className="h-4 w-4" />}
            label="Institution" 
            value={coe.institutionName} 
          />
          <InfoItem 
            icon={<BookOpen className="h-4 w-4" />}
            label="Course" 
            value={coe.courseName} 
          />
          <InfoItem 
            icon={<User className="h-4 w-4" />}
            label="Student" 
            value={coe.studentName} 
          />
          <InfoItem 
            icon={<Calendar className="h-4 w-4" />}
            label="Commencement" 
            value={coe.commencementDate} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <FinancialCard 
            title="Tuition Fees" 
            value={coe.tuitionFees} 
            colorScheme="blue" 
          />
          <FinancialCard 
            title="Enrollment Status" 
            value={coe.enrollmentStatus} 
            colorScheme="purple" 
          />
        </div>

        <div className="pt-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setExpandedCoe(expandedCoe === coe.id ? null : coe.id)}
          >
            {expandedCoe === coe.id ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </Button>
        </div>
        
        {/* Expanded Details Section */}
        {expandedCoe === coe.id && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <CoeDetailReport coeId={coe.id} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Analytics */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Information Reports</h1>
            <p className="text-muted-foreground">View and manage all offer letter and COE information</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="h-3 w-3 mr-1" />
                {offerLetters?.length || 0} Offer Letters
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                {coeInfo?.length || 0} COE Documents
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                <BarChart3 className="h-3 w-3 mr-1" />
                {(offerLetters?.length || 0) + (coeInfo?.length || 0)} Total
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Advanced Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by file name, institution, program, or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date Range</label>
                  <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
                    <SelectTrigger>
                      <CalendarRange className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Institution Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Institution</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Filter by institution..."
                      value={institutionFilter}
                      onChange={(e) => setInstitutionFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort By</label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">File Name</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>
                    Showing {filteredOfferLetters.length + filteredCoeInfo.length} of {(offerLetters?.length || 0) + (coeInfo?.length || 0)} documents
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                    setStatusFilter('all');
                    setInstitutionFilter('');
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different information types */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offer-letters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Offer Letters ({filteredOfferLetters.length})
            </TabsTrigger>
            <TabsTrigger value="coe-info" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              COE Information ({filteredCoeInfo.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offer-letters" className="space-y-4">
            {offerLettersLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOfferLetters.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Offer Letters Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No offer letter information has been uploaded yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOfferLetters.map((offerLetter) => (
                  <OfferLetterCard key={offerLetter.id} offerLetter={offerLetter} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="coe-info" className="space-y-4">
            {coeLoading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCoeInfo.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No COE Information Found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms.' : 'No COE information has been uploaded yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCoeInfo.map((coe) => (
                  <CoeCard key={coe.id} coe={coe} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}