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
  BarChart3
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Link } from 'wouter';
import { format } from 'date-fns';

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
          <Link href={`/offer-letter-info/${offerLetter.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </Link>
        </div>
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
          <Link href={`/coe-info/${coe.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </Link>
        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                {/* Status Filter (for COE) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                    <SelectTrigger>
                      <Shield className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Order</label>
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
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