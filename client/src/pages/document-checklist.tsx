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
      const matchesCountry = !selectedCountry || checklist.country === selectedCountry;
      const matchesVisaType = !selectedVisaType || checklist.visaType === selectedVisaType;
      const matchesUserType = !selectedUserType || checklist.userType === selectedUserType;
      
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
                      <SelectItem value="">All Countries</SelectItem>
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
                      <SelectItem value="">All Visa Types</SelectItem>
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
                      <SelectItem value="">All User Types</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist: DocumentChecklist) => (
              <Card key={checklist.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{checklist.title}</CardTitle>
                  <CardDescription>{checklist.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{checklist.country}</Badge>
                      <Badge variant="outline">{checklist.visaType}</Badge>
                      <Badge variant="outline">{checklist.userType}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {checklist.items?.length || 0} documents required
                    </div>
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