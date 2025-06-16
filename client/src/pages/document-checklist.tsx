import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Download, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Info,
  User,
  MapPin,
  Plane,
  Search
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type DocumentChecklist } from "@shared/schema";

interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documents: ChecklistDocument[];
}

interface ChecklistDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  alternatives: string[];
  format: string;
  validity: string;
  tips: string[];
  templateId?: string;
}

interface ChecklistFee {
  name: string;
  amount: string;
  currency: string;
  description: string;
  required: boolean;
}

export default function DocumentChecklistGenerator() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedVisaType, setSelectedVisaType] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [checklist, setChecklist] = useState<DocumentChecklist | null>(null);
  const [completedDocuments, setCompletedDocuments] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { data: checklists = [], isLoading } = useQuery({
    queryKey: ['/api/document-checklists'],
  });

  const countries = ["Nepal", "India", "Pakistan", "Bangladesh", "Sri Lanka", "Vietnam", "China", "USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands"];
  const visaTypes = ["Student F-1", "Tourist B-2", "Work H-1B", "Study Permit", "Visitor Visa", "Business B-1", "Transit C-1", "Family Reunification"];
  const userTypes = ["student", "tourist", "work", "family", "business"];

  const generateChecklist = () => {
    if (selectedCountry && selectedVisaType && selectedUserType) {
      const foundChecklist = (checklists as DocumentChecklist[]).find((checklist: DocumentChecklist) => 
        checklist.country === selectedCountry && 
        checklist.visaType === selectedVisaType && 
        checklist.userType === selectedUserType &&
        checklist.isActive
      );
      if (foundChecklist) {
        setChecklist(foundChecklist);
        setCompletedDocuments(new Set());
        const categories = (foundChecklist.categories as ChecklistCategory[]) || [];
        setExpandedCategories(new Set(categories.map(cat => cat.id)));
      }
    }
  };

  const toggleDocumentComplete = (documentId: string) => {
    const newCompleted = new Set(completedDocuments);
    if (newCompleted.has(documentId)) {
      newCompleted.delete(documentId);
    } else {
      newCompleted.add(documentId);
    }
    setCompletedDocuments(newCompleted);
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = (checklist?.categories as ChecklistCategory[]) || [];
  const fees = (checklist?.fees as ChecklistFee[]) || [];
  
  const totalDocuments = categories.reduce((total, category) => {
    return total + (category.documents?.length || 0);
  }, 0);

  const completedCount = categories.reduce((sum, category) => {
    return sum + (category.documents?.reduce((sum, doc) => {
      return sum + (completedDocuments.has(doc.id) ? 1 : 0);
    }, 0) || 0);
  }, 0);

  const progress = totalDocuments > 0 ? (completedCount / totalDocuments) * 100 : 0;

  const exportChecklist = () => {
    if (!checklist) return;

    const requiredFees = fees.filter(fee => fee.required);
    const totalFees = requiredFees.reduce((total, fee) => {
      const amount = parseFloat(fee.amount.replace(/[^0-9.]/g, ''));
      return total + amount;
    }, 0);

    const categoryProgress = categories.map(category => {
      const categoryDocs = category.documents || [];
      const completedInCategory = categoryDocs.filter(doc => 
        completedDocuments.has(doc.id)
      ).length;
      return {
        name: category.name,
        completed: completedInCategory,
        total: categoryDocs.length,
        percentage: categoryDocs.length > 0 ? (completedInCategory / categoryDocs.length) * 100 : 0
      };
    });

    const exportData = {
      country: checklist.country,
      visaType: checklist.visaType,
      userType: checklist.userType,
      estimatedProcessingTime: checklist.estimatedProcessingTime,
      lastUpdated: checklist.updatedAt || checklist.createdAt,
      progress: {
        overall: Math.round(progress),
        completed: completedCount,
        total: totalDocuments
      },
      categories: categoryProgress,
      fees: {
        total: totalFees,
        currency: requiredFees[0]?.currency || 'USD',
        breakdown: requiredFees
      },
      importantNotes: checklist.importantNotes
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${checklist.country}-${checklist.visaType}-checklist.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Checklist Generator</h1>
            <p className="text-muted-foreground">
              Generate country-specific document checklists based on your visa type and profile
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Find Your Checklist
            </CardTitle>
            <CardDescription>
              Select your details to generate a personalized document checklist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Destination Country
                </label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Plane className="h-4 w-4 mr-2" />
                  Visa Type
                </label>
                <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Application Type
                </label>
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={generateChecklist} 
              disabled={!selectedCountry || !selectedVisaType || !selectedUserType || isLoading}
              className="w-full"
            >
              Generate Checklist
            </Button>
          </CardContent>
        </Card>

        {checklist && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {checklist.country} - {checklist.visaType}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Application type: {checklist.userType.charAt(0).toUpperCase() + checklist.userType.slice(1)}
                    </CardDescription>
                  </div>
                  <Button onClick={exportChecklist} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {checklist.estimatedProcessingTime}
                  </div>
                  <Badge variant="outline">
                    {completedCount} of {totalDocuments} completed
                  </Badge>
                </div>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
            </Card>

            {fees.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Application Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fees.map((fee, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{fee.name}</div>
                          <div className="text-sm text-muted-foreground">{fee.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{fee.amount} {fee.currency}</div>
                          <Badge variant={fee.required ? "default" : "secondary"} className="text-xs">
                            {fee.required ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <Collapsible
                    open={expandedCategories.has(category.id)}
                    onOpenChange={() => toggleCategoryExpanded(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {expandedCategories.has(category.id) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                            <div>
                              <CardTitle className="text-lg">{category.name}</CardTitle>
                              <CardDescription>{category.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={category.required ? "default" : "secondary"}>
                              {category.required ? "Required" : "Optional"}
                            </Badge>
                            <Badge variant="outline">
                              {category.documents?.filter(doc => completedDocuments.has(doc.id)).length || 0} / {category.documents?.length || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {(category.documents || []).map((document) => (
                            <div key={document.id} className="border rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  checked={completedDocuments.has(document.id)}
                                  onCheckedChange={() => toggleDocumentComplete(document.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{document.name}</h4>
                                    <Badge variant={document.required ? "default" : "secondary"} className="text-xs">
                                      {document.required ? "Required" : "Optional"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{document.description}</p>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Format:</span> {document.format}
                                    </div>
                                    <div>
                                      <span className="font-medium">Validity:</span> {document.validity}
                                    </div>
                                  </div>
                                  {document.alternatives && document.alternatives.length > 0 && (
                                    <div>
                                      <span className="font-medium text-sm">Alternatives:</span>
                                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                        {document.alternatives.map((alt, index) => (
                                          <li key={index} className="flex items-center">
                                            <Circle className="h-2 w-2 mr-2 fill-current" />
                                            {alt}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {document.tips && document.tips.length > 0 && (
                                    <div>
                                      <span className="font-medium text-sm">Tips:</span>
                                      <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                        {document.tips.map((tip, index) => (
                                          <li key={index} className="flex items-start">
                                            <Info className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>

            {checklist.importantNotes && checklist.importantNotes.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">Important Notes:</div>
                    <ul className="space-y-1">
                      {checklist.importantNotes.map((note, index) => (
                        <li key={index} className="text-sm">• {note}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  Last updated: {checklist.updatedAt ? new Date(checklist.updatedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!checklist && selectedCountry && selectedVisaType && selectedUserType && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Checklist Available</h3>
              <p className="text-muted-foreground text-center">
                We don't have a checklist for {selectedCountry} - {selectedVisaType} ({selectedUserType}) yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}