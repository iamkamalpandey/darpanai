import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
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
  User, 
  Clock,
  Search,
  Filter,
  Eye,
  FileCheck,
  Shield,
  Info,
  CalendarRange,
  Download,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { format } from 'date-fns';

export default function InformationReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch offer letter information
  const { data: offerLetters = [], isLoading: isLoadingOfferLetters } = useQuery({
    queryKey: ['/api/admin/offer-letter-info'],
  });

  // Fetch COE information
  const { data: coeInfo = [], isLoading: isLoadingCoe } = useQuery({
    queryKey: ['/api/admin/coe-info'],
  });

  // Filter and search logic
  const filteredOfferLetters = useMemo(() => {
    return offerLetters.filter((item: any) => {
      const matchesSearch = 
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.programName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [offerLetters, searchTerm]);

  const filteredCoeInfo = useMemo(() => {
    return coeInfo.filter((item: any) => {
      const matchesSearch = 
        item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [coeInfo, searchTerm]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Information Reports</h1>
            <p className="text-gray-600">View and manage all document information extractions</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              {offerLetters.length + coeInfo.length} Total Reports
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by filename, institution, or program..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="offer-letter">Offer Letters</SelectItem>
                    <SelectItem value="coe">COE Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="offer-letters" className="space-y-4">
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

          {/* Offer Letters Tab */}
          <TabsContent value="offer-letters" className="space-y-4">
            {isLoadingOfferLetters ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOfferLetters.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Offer Letters Found</h3>
                    <p className="text-gray-600">No offer letter information reports match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredOfferLetters.map((report: any) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{report.fileName}</h3>
                            <Badge variant="outline" className="text-xs">
                              Offer Letter
                            </Badge>
                          </div>

                          {/* Quick Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.institutionName || 'Institution not specified'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.programName || 'Program not specified'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy') : 'Date not available'}
                              </span>
                            </div>
                          </div>

                          {/* Financial Info */}
                          {report.totalTuition && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">Total Tuition: {report.totalTuition}</span>
                            </div>
                          )}

                          {/* User Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>User ID: {report.userId}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/offer-letter-details/${report.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* COE Information Tab */}
          <TabsContent value="coe-info" className="space-y-4">
            {isLoadingCoe ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCoeInfo.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No COE Information Found</h3>
                    <p className="text-gray-600">No COE information reports match your search criteria.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCoeInfo.map((report: any) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-gray-900">{report.fileName}</h3>
                            <Badge variant="outline" className="text-xs">
                              COE Document
                            </Badge>
                          </div>

                          {/* Quick Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.institutionName || 'Institution not specified'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.courseName || 'Course not specified'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {report.createdAt ? format(new Date(report.createdAt), 'MMM dd, yyyy') : 'Date not available'}
                              </span>
                            </div>
                          </div>

                          {/* Financial Info */}
                          {report.totalTuition && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">Total Tuition: {report.totalTuition}</span>
                            </div>
                          )}

                          {/* Student Info */}
                          {report.studentName && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-700">Student: {report.studentName}</span>
                            </div>
                          )}

                          {/* User Info */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>User ID: {report.userId}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/coe-details/${report.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}