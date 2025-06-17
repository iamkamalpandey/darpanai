import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConsultationForm } from '@/components/ConsultationForm';
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Info,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface DocumentChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: string;
  tips?: string[];
}

interface DocumentChecklist {
  id: number;
  title: string;
  description: string;
  country: string;
  visaType: string;
  userType: string;
  items: DocumentChecklistItem[];
  totalFees?: string;
  estimatedProcessingTime?: string;
  importantNotes?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function DocumentChecklistGenerator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [selectedUserType, setSelectedUserType] = useState('');
  const [viewingChecklist, setViewingChecklist] = useState<DocumentChecklist | null>(null);
  const [completedDocuments, setCompletedDocuments] = useState<Set<string>>(new Set());

  // Load dropdown options
  const { data: dropdownOptions = { countries: [], visaTypes: [], userTypes: [] } } = useQuery({
    queryKey: ['/api/dropdown-options'],
  });

  const countries = (dropdownOptions as any)?.countries || [];
  const visaTypes = (dropdownOptions as any)?.visaTypes || [];
  const userTypes = (dropdownOptions as any)?.userTypes || [];

  // Load document checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['/api/document-checklists'],
  });

  // Calculate filtered checklists based on search and filters
  const filteredChecklists = useMemo(() => {
    return (checklists as DocumentChecklist[]).filter((checklist: DocumentChecklist) => {
      const matchesSearch = checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           checklist.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = !selectedCountry || selectedCountry === 'all' || checklist.country === selectedCountry;
      const matchesVisaType = !selectedVisaType || selectedVisaType === 'all' || checklist.visaType === selectedVisaType;
      const matchesUserType = !selectedUserType || selectedUserType === 'all' || checklist.userType === selectedUserType;
      
      return matchesSearch && matchesCountry && matchesVisaType && matchesUserType && checklist.isActive;
    });
  }, [checklists, searchTerm, selectedCountry, selectedVisaType, selectedUserType]);

  // Check if any filters are active
  const hasActiveFilters = searchTerm || (selectedCountry && selectedCountry !== 'all') || 
                          (selectedVisaType && selectedVisaType !== 'all') || 
                          (selectedUserType && selectedUserType !== 'all');

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedVisaType('');
    setSelectedUserType('');
  };

  const items = viewingChecklist?.items || [];
  const progress = items.length > 0 
    ? (items.filter((item: DocumentChecklistItem) => completedDocuments.has(item.id)).length / items.length) * 100 
    : 0;

  const exportChecklistToCSV = () => {
    if (!viewingChecklist) return;
    
    const headerData = [
      ['Checklist Export Report'],
      ['Generated Date', new Date().toLocaleDateString()],
      [''],
      ['Checklist Details'],
      ['Title', viewingChecklist.title],
      ['Destination Country', viewingChecklist.country],
      ['Visa Type', viewingChecklist.visaType],
      ['User Type', viewingChecklist.userType],
      ['Description', viewingChecklist.description],
      ['Total Fees', viewingChecklist.totalFees || 'Not specified'],
      ['Processing Time', viewingChecklist.estimatedProcessingTime || 'Not specified'],
      ['Overall Progress', `${Math.round(progress)}%`],
      [''],
      ['Document Checklist Items'],
      ['Document Name', 'Category', 'Required', 'Status', 'Tips']
    ];

    const itemsData = items.map((item: DocumentChecklistItem) => [
      item.name,
      item.category,
      item.required ? 'Required' : 'Optional',
      completedDocuments.has(item.id) ? 'Completed' : 'Pending',
      item.tips ? item.tips.join('; ') : 'No tips available'
    ]);

    const notesData = [
      [''],
      ['Important Notes']
    ];
    
    if (viewingChecklist.importantNotes && viewingChecklist.importantNotes.length > 0) {
      viewingChecklist.importantNotes.forEach((note: string, index: number) => {
        notesData.push([`Note ${index + 1}`, note]);
      });
    } else {
      notesData.push(['No important notes available']);
    }

    const summaryData = [
      [''],
      ['Progress Summary'],
      ['Total Documents', items.length.toString()],
      ['Completed', items.filter((item: DocumentChecklistItem) => completedDocuments.has(item.id)).length.toString()],
      ['Pending', items.filter((item: DocumentChecklistItem) => !completedDocuments.has(item.id)).length.toString()],
      ['Required Documents', items.filter((item: DocumentChecklistItem) => item.required).length.toString()],
      ['Optional Documents', items.filter((item: DocumentChecklistItem) => !item.required).length.toString()]
    ];

    const csvData = [...headerData, ...itemsData, ...notesData, ...summaryData];
    const csvContent = csvData.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa-checklist-${viewingChecklist.country}-${viewingChecklist.visaType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportChecklistToExcel = () => {
    if (!viewingChecklist) return;
    
    const headerData = [
      ['Checklist Export Report'],
      ['Generated Date', new Date().toLocaleDateString()],
      [''],
      ['Checklist Details'],
      ['Title', viewingChecklist.title],
      ['Destination Country', viewingChecklist.country],
      ['Visa Type', viewingChecklist.visaType],
      ['User Type', viewingChecklist.userType],
      ['Description', viewingChecklist.description],
      ['Total Fees', viewingChecklist.totalFees || 'Not specified'],
      ['Processing Time', viewingChecklist.estimatedProcessingTime || 'Not specified'],
      ['Overall Progress', `${Math.round(progress)}%`],
      [''],
      ['Document Checklist Items'],
      ['Document Name', 'Category', 'Required', 'Status', 'Tips']
    ];

    const itemsData = items.map((item: DocumentChecklistItem) => [
      item.name,
      item.category,
      item.required ? 'Required' : 'Optional',
      completedDocuments.has(item.id) ? 'Completed' : 'Pending',
      item.tips ? item.tips.join('; ') : 'No tips available'
    ]);

    const notesData = [
      [''],
      ['Important Notes']
    ];
    
    if (viewingChecklist.importantNotes && viewingChecklist.importantNotes.length > 0) {
      viewingChecklist.importantNotes.forEach((note: string, index: number) => {
        notesData.push([`Note ${index + 1}`, note]);
      });
    } else {
      notesData.push(['No important notes available']);
    }

    const summaryData = [
      [''],
      ['Progress Summary'],
      ['Total Documents', items.length.toString()],
      ['Completed', items.filter((item: DocumentChecklistItem) => completedDocuments.has(item.id)).length.toString()],
      ['Pending', items.filter((item: DocumentChecklistItem) => !completedDocuments.has(item.id)).length.toString()],
      ['Required Documents', items.filter((item: DocumentChecklistItem) => item.required).length.toString()],
      ['Optional Documents', items.filter((item: DocumentChecklistItem) => !item.required).length.toString()]
    ];

    const excelData = [...headerData, ...itemsData, ...notesData, ...summaryData];
    const tsvContent = excelData.map(row => 
      row.map(cell => String(cell).replace(/\t/g, ' ')).join('\t')
    ).join('\n');
    
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa-checklist-${viewingChecklist.country}-${viewingChecklist.visaType}-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleDocumentCompletion = (documentId: string) => {
    setCompletedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">Document Checklist Generator</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Get personalized document checklists for your visa application
              </p>
            </div>
            {viewingChecklist && (
              <Button onClick={() => setViewingChecklist(null)} variant="outline" className="self-center sm:self-auto">
                ← Back to Checklists
              </Button>
            )}
          </div>

          {/* Search and Filters - Only show on list page */}
          {!viewingChecklist && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Find Your Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar - Full Width */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search checklists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Destination Country</Label>
                      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Countries</SelectItem>
                          {countries.map((country: string) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Visa Type</Label>
                      <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select visa type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Visa Types</SelectItem>
                          {visaTypes.map((visaType: string) => (
                            <SelectItem key={visaType} value={visaType}>{visaType}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>User Type</Label>
                      <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All User Types</SelectItem>
                          {userTypes.map((userType: string) => (
                            <SelectItem key={userType} value={userType}>{userType}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Results and Clear Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      {filteredChecklists.length} checklist{filteredChecklists.length !== 1 ? 's' : ''} found
                    </span>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Area */}
        {viewingChecklist ? (
          // Detail View
          <>
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{viewingChecklist.title}</CardTitle>
                    <CardDescription>
                      {viewingChecklist.country} • {viewingChecklist.visaType} • {viewingChecklist.userType}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
            </Card>

            {/* Fees Information */}
            {viewingChecklist.totalFees && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Application Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Total Application Fees</div>
                        <div className="text-sm text-muted-foreground">All required fees combined</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{viewingChecklist.totalFees}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Document Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Document Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: DocumentChecklistItem) => (
                    <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={item.id}
                        checked={completedDocuments.has(item.id)}
                        onCheckedChange={() => toggleDocumentCompletion(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={item.id} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant={item.required ? "destructive" : "secondary"}>
                              {item.required ? "Required" : "Optional"}
                            </Badge>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          {item.tips && item.tips.length > 0 && (
                            <div className="text-sm">
                              <strong>Tips:</strong>
                              <ul className="list-disc list-inside mt-1 text-muted-foreground">
                                {item.tips.map((tip: string, index: number) => (
                                  <li key={index}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            {viewingChecklist.importantNotes && viewingChecklist.importantNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {viewingChecklist.importantNotes.map((note: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Time */}
            {viewingChecklist.estimatedProcessingTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{viewingChecklist.estimatedProcessingTime}</p>
                      <p className="text-sm text-muted-foreground">Estimated processing time</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="text-lg">{viewingChecklist.country} • {viewingChecklist.visaType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={exportChecklistToCSV} variant="outline" className="flex-1">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={exportChecklistToExcel} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>

            {/* Strategic CTA for Checklist Completion */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-purple-900 mb-3">
                  Overwhelmed by This Checklist?
                </h3>
                <p className="text-purple-700 mb-4 max-w-2xl mx-auto">
                  Don't navigate the complex visa requirements alone. Our experts help you prioritize documents, avoid common mistakes, and ensure nothing is missed for your {viewingChecklist.visaType} application.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <ConsultationForm 
                    buttonSize="lg"
                    buttonText="Get Expert Checklist Review"
                    subject={`Checklist Guidance for ${viewingChecklist.country} ${viewingChecklist.visaType}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  />
                  <Button 
                    variant="outline" 
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => setViewingChecklist(null)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Browse More Checklists
                  </Button>
                </div>
                <p className="text-sm text-purple-600 mt-3">
                  Priority guidance • Embassy-specific tips • 88% faster application completion
                </p>
              </div>
            </div>
          </>
        ) : (
          // List View
          <>
            {isLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading checklists...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredChecklists.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No checklists found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0 auto-rows-fr">
                {filteredChecklists.map((checklist: DocumentChecklist) => (
                  <Card 
                    key={checklist.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md w-full min-w-0 max-w-full overflow-hidden"
                    onClick={() => setViewingChecklist(checklist)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between min-w-0">
                        <div className="flex items-start space-x-3 min-w-0 flex-1 overflow-hidden">
                          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <CardTitle className="text-lg lg:text-xl leading-tight mb-2 text-gray-900 truncate">
                              {checklist.title}
                            </CardTitle>
                            <CardDescription className="text-sm lg:text-base text-gray-600 line-clamp-2 break-words">
                              {checklist.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-2">
                          <Badge variant="default" className="bg-green-600 text-white text-xs whitespace-nowrap">
                            {checklist.items?.length || 0} docs
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Route Information */}
                        <div className="bg-white p-3 rounded-lg border min-w-0 overflow-hidden">
                          <div className="flex items-center mb-3">
                            <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">Application Route</span>
                          </div>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-500">From:</span>
                                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 self-start max-w-full">
                                  <span className="truncate">{checklist.country}</span>
                                </Badge>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-500">Type:</span>
                                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 self-start max-w-full">
                                  <span className="truncate break-words">{checklist.visaType}</span>
                                </Badge>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <span className="text-xs text-gray-500">User:</span>
                                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 self-start max-w-full">
                                  <span className="truncate">{checklist.userType}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Info */}
                        <div className="space-y-3 text-sm min-w-0">
                          {checklist.totalFees && (
                            <div className="bg-green-50 rounded-lg p-3 min-w-0">
                              <div className="flex items-center mb-2">
                                <DollarSign className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-green-700 font-medium text-xs">Total Fees</span>
                              </div>
                              <div className="text-green-800 font-semibold text-sm break-words">
                                {checklist.totalFees}
                              </div>
                            </div>
                          )}
                          {checklist.estimatedProcessingTime && (
                            <div className="bg-blue-50 rounded-lg p-3 min-w-0">
                              <div className="flex items-center mb-2">
                                <Clock className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                                <span className="text-blue-700 font-medium text-xs">Processing Time</span>
                              </div>
                              <div className="text-blue-800 font-semibold text-sm break-words">
                                {checklist.estimatedProcessingTime}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                          View Complete Checklist
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}