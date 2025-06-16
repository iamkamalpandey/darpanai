import { useState, useEffect, useMemo } from 'react';
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
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Info,
  Download
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
  const [completedDocuments, setCompletedDocuments] = useState<Set<string>>(new Set());

  // Load dropdown options
  const { data: dropdownOptions = { countries: [], visaTypes: [], userTypes: [] } } = useQuery({
    queryKey: ['/api/dropdown-options'],
  });

  // Type the dropdown options properly
  const countries = (dropdownOptions as any)?.countries || [];
  const visaTypes = (dropdownOptions as any)?.visaTypes || [];
  const userTypes = (dropdownOptions as any)?.userTypes || [];

  // Load document checklists
  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['/api/document-checklists'],
  });

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

  const selectedChecklist = filteredChecklists.length === 1 ? filteredChecklists[0] : null;
  const items = selectedChecklist?.items || [];

  const progress = items.length > 0 
    ? (items.filter(item => completedDocuments.has(item.id)).length / items.length) * 100 
    : 0;

  const exportChecklist = () => {
    if (!selectedChecklist) return;
    
    const data = {
      checklist: selectedChecklist.title,
      country: selectedChecklist.country,
      visaType: selectedChecklist.visaType,
      userType: selectedChecklist.userType,
      progress: `${Math.round(progress)}%`,
      completedItems: items.filter(item => completedDocuments.has(item.id)).map(item => item.name),
      pendingItems: items.filter(item => !completedDocuments.has(item.id)).map(item => item.name)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklist-progress-${selectedChecklist.country}-${selectedChecklist.visaType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Document Checklist Generator</h1>
              <p className="text-muted-foreground">
                Get personalized document checklists for your visa application
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Find Your Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search checklists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
            </CardContent>
          </Card>
        </div>

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
        ) : filteredChecklists.length > 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredChecklists.map((checklist: DocumentChecklist) => (
              <Card key={checklist.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg lg:text-xl leading-tight line-clamp-2 mb-2 text-gray-900">
                          {checklist.title}
                        </CardTitle>
                        <CardDescription className="text-sm lg:text-base line-clamp-2 text-gray-600">
                          {checklist.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-4">
                      <Badge variant="default" className="bg-green-600 text-white">
                        {checklist.items?.length || 0} docs
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {/* Route Information */}
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Application Route</span>
                        <Info className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                          From: {checklist.country}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200">
                          {checklist.visaType}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200">
                          {checklist.userType}
                        </Badge>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      {checklist.totalFees && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-yellow-600" />
                            <div>
                              <div className="text-xs text-yellow-600 font-medium">Total Fees</div>
                              <div className="text-sm font-bold text-yellow-800">{checklist.totalFees}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {checklist.estimatedProcessingTime && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                              <div className="text-xs text-blue-600 font-medium">Processing</div>
                              <div className="text-sm font-bold text-blue-800">{checklist.estimatedProcessingTime}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Important Notes Preview */}
                    {checklist.importantNotes && checklist.importantNotes.length > 0 && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-orange-600 font-medium mb-1">Important Notes</div>
                            <div className="text-sm text-orange-800 line-clamp-2">
                              {checklist.importantNotes[0]}
                              {checklist.importantNotes.length > 1 && ` +${checklist.importantNotes.length - 1} more`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setSelectedCountry(checklist.country);
                        setSelectedVisaType(checklist.visaType);
                        setSelectedUserType(checklist.userType);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Complete Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedChecklist?.title}</CardTitle>
                    <CardDescription>
                      {selectedChecklist?.country} • {selectedChecklist?.visaType} • {selectedChecklist?.userType}
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
            {selectedChecklist?.totalFees && (
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
                        <div className="font-bold text-lg">{selectedChecklist.totalFees}</div>
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
                  {items.map((item: DocumentChecklistItem, index: number) => (
                    <div key={item.id || index} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        checked={completedDocuments.has(item.id)}
                        onCheckedChange={(checked) => {
                          const newCompleted = new Set(completedDocuments);
                          if (checked) {
                            newCompleted.add(item.id);
                          } else {
                            newCompleted.delete(item.id);
                          }
                          setCompletedDocuments(newCompleted);
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.required ? "destructive" : "secondary"} className="text-xs">
                              {item.required ? "Required" : "Optional"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        {item.tips && item.tips.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">Tips:</Label>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {item.tips.map((tip: string, tipIndex: number) => (
                                <li key={tipIndex} className="flex items-start space-x-1">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            {selectedChecklist?.importantNotes && selectedChecklist.importantNotes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedChecklist.importantNotes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                        <span className="text-sm">{note}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Processing Information */}
            {selectedChecklist?.estimatedProcessingTime && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Processing Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Estimated Processing Time</Label>
                      <p className="text-lg font-semibold">{selectedChecklist.estimatedProcessingTime}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Application Type</Label>
                      <p className="text-lg">{selectedChecklist.country} • {selectedChecklist.visaType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Actions */}
            <div className="flex gap-4">
              <Button onClick={exportChecklist} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Progress
              </Button>
              <Button onClick={() => window.print()} variant="outline" className="flex-1">
                Print Checklist
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}