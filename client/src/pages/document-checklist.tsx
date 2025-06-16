import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Plane
} from "lucide-react";
import { documentChecklists, getChecklistByCountryAndVisa, type DocumentChecklist, type ChecklistDocument } from "@shared/document-templates";

export default function DocumentChecklistGenerator() {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedVisaType, setSelectedVisaType] = useState<string>("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [checklist, setChecklist] = useState<DocumentChecklist | null>(null);
  const [completedDocuments, setCompletedDocuments] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const countries = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Singapore"];
  const visaTypes = {
    "USA": ["Student Visa (F-1)", "Tourist Visa (B-2)", "Work Visa (H-1B)", "Business Visa (B-1)"],
    "UK": ["Student Visa (Tier 4)", "Tourist Visa", "Work Visa (Tier 2)", "Business Visa"],
    "Canada": ["Study Permit", "Visitor Visa", "Work Permit", "Business Visa"],
    "Australia": ["Student Visa (500)", "Tourist Visa (600)", "Work Visa (482)", "Business Visa"]
  };
  const userTypes = ["student", "tourist", "work", "family", "business"];

  const generateChecklist = () => {
    if (selectedCountry && selectedVisaType && selectedUserType) {
      const foundChecklist = getChecklistByCountryAndVisa(selectedCountry, selectedVisaType);
      if (foundChecklist) {
        setChecklist(foundChecklist);
        setCompletedDocuments(new Set());
        setExpandedCategories(new Set(foundChecklist.categories.map(cat => cat.id)));
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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const calculateProgress = () => {
    if (!checklist) return 0;
    const totalDocuments = checklist.categories.reduce(
      (total, category) => total + category.documents.length, 0
    );
    const completedCount = completedDocuments.size;
    return totalDocuments > 0 ? (completedCount / totalDocuments) * 100 : 0;
  };

  const getRequiredDocumentsCount = () => {
    if (!checklist) return { total: 0, required: 0 };
    const total = checklist.categories.reduce(
      (sum, category) => sum + category.documents.length, 0
    );
    const required = checklist.categories.reduce(
      (sum, category) => sum + category.documents.filter(doc => doc.required).length, 0
    );
    return { total, required };
  };

  const exportChecklist = () => {
    if (!checklist) return;

    const content = `
VISA APPLICATION CHECKLIST
${checklist.country} - ${checklist.visaType}
Generated on: ${new Date().toLocaleDateString()}

ESTIMATED PROCESSING TIME: ${checklist.estimatedProcessingTime}

REQUIRED FEES:
${checklist.fees.map(fee => `- ${fee.name}: ${fee.amount} ${fee.currency} (${fee.description})`).join('\n')}

DOCUMENT CATEGORIES:
${checklist.categories.map(category => `
${category.name.toUpperCase()} ${category.required ? '(REQUIRED)' : '(OPTIONAL)'}
${category.description}

Documents:
${category.documents.map(doc => `
□ ${doc.name} ${doc.required ? '(REQUIRED)' : '(OPTIONAL)'}
  Description: ${doc.description}
  Format: ${doc.format}
  Validity: ${doc.validity}
  ${doc.tips.length > 0 ? `Tips: ${doc.tips.join('; ')}` : ''}
  ${doc.alternatives.length > 0 ? `Alternatives: ${doc.alternatives.join(', ')}` : ''}
`).join('')}
`).join('')}

IMPORTANT NOTES:
${checklist.importantNotes.map(note => `- ${note}`).join('\n')}

Last Updated: ${checklist.lastUpdated.toLocaleDateString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${checklist.country}_${checklist.visaType.replace(/\s+/g, '_')}_Checklist.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDocumentStatusIcon = (documentId: string, required: boolean) => {
    const isCompleted = completedDocuments.has(documentId);
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return required ? 
      <Circle className="h-5 w-5 text-red-500" /> : 
      <Circle className="h-5 w-5 text-gray-400" />;
  };

  const { total, required } = getRequiredDocumentsCount();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Checklist Generator</h1>
          <p className="text-gray-600">Generate country-specific document checklists based on your visa type and profile</p>
        </div>

        {/* Selection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Generate Your Checklist
            </CardTitle>
            <CardDescription>
              Select your destination, visa type, and profile to get a personalized document checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="country">Destination Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="visa-type">Visa Type</Label>
                <Select 
                  value={selectedVisaType} 
                  onValueChange={setSelectedVisaType}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCountry && visaTypes[selectedCountry as keyof typeof visaTypes]?.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4" />
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="user-type">Application Type</Label>
                <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={generateChecklist}
                  disabled={!selectedCountry || !selectedVisaType || !selectedUserType}
                  className="w-full"
                >
                  Generate Checklist
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Checklist */}
        {checklist && (
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {checklist.country} - {checklist.visaType}
                    </CardTitle>
                    <CardDescription>
                      Track your document preparation progress
                    </CardDescription>
                  </div>
                  <Button onClick={exportChecklist} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Checklist
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress: {completedDocuments.size} of {total} documents</span>
                      <span>{Math.round(calculateProgress())}% complete</span>
                    </div>
                    <Progress value={calculateProgress()} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Processing Time</p>
                        <p className="text-sm text-gray-600">{checklist.estimatedProcessingTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Total Fees</p>
                        <p className="text-sm text-gray-600">
                          {checklist.fees.reduce((total, fee) => total + parseFloat(fee.amount), 0)} {checklist.fees[0]?.currency}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Required Docs</p>
                        <p className="text-sm text-gray-600">{required} of {total} mandatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fees Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Application Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.fees.map((fee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{fee.name}</p>
                        <p className="text-sm text-gray-600">{fee.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{fee.amount} {fee.currency}</p>
                        {fee.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Categories */}
            <div className="space-y-4">
              {checklist.categories.map(category => (
                <Card key={category.id}>
                  <Collapsible 
                    open={expandedCategories.has(category.id)}
                    onOpenChange={() => toggleCategory(category.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedCategories.has(category.id) ? 
                              <ChevronDown className="h-5 w-5" /> : 
                              <ChevronRight className="h-5 w-5" />
                            }
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {category.name}
                                {category.required && <Badge variant="destructive">Required</Badge>}
                              </CardTitle>
                              <CardDescription>{category.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {category.documents.filter(doc => completedDocuments.has(doc.id)).length} / {category.documents.length}
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-4">
                          {category.documents.map(document => (
                            <div key={document.id} className="border rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleDocumentComplete(document.id)}
                                  className="mt-0.5"
                                >
                                  {getDocumentStatusIcon(document.id, document.required)}
                                </button>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{document.name}</h4>
                                    {document.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  </div>
                                  
                                  <p className="text-sm text-gray-600 mb-3">{document.description}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p><span className="font-medium">Format:</span> {document.format}</p>
                                      <p><span className="font-medium">Validity:</span> {document.validity}</p>
                                    </div>
                                    
                                    {document.alternatives.length > 0 && (
                                      <div>
                                        <p className="font-medium">Alternatives:</p>
                                        <ul className="list-disc list-inside text-gray-600">
                                          {document.alternatives.map((alt, index) => (
                                            <li key={index}>{alt}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {document.tips.length > 0 && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                      <p className="font-medium text-blue-800 mb-2">Tips:</p>
                                      <ul className="space-y-1">
                                        {document.tips.map((tip, index) => (
                                          <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {document.templateId && (
                                    <div className="mt-3">
                                      <Button variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Use Template
                                      </Button>
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

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklist.importantNotes.map((note, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{note}</AlertDescription>
                    </Alert>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  Last updated: {checklist.lastUpdated.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}