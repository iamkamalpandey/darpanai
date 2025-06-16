import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Eye, Search, Filter } from "lucide-react";
import { documentTemplates, getTemplatesByCategory, getTemplatesByVisaType, type DocumentTemplate } from "@shared/document-templates";

export default function DocumentTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVisaType, setSelectedVisaType] = useState<string>("all");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const categories = ["all", "financial", "academic", "personal", "employment", "travel", "legal"];
  const visaTypes = [
    "all",
    "Student Visa (F-1)",
    "Tourist Visa (B-2)",
    "Work Visa (H-1B)",
    "Student Visa (UK)",
    "Study Permit (Canada)",
    "Student Visa (Australia)",
    "Business Visa (B-1)",
    "Family Visa",
    "Schengen Visa"
  ];

  const filteredTemplates = documentTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesVisaType = selectedVisaType === "all" || template.visaTypes.includes(selectedVisaType);
    
    return matchesSearch && matchesCategory && matchesVisaType;
  });

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const generateDocument = (template: DocumentTemplate) => {
    let generatedText = template.template;
    
    // Replace placeholders with form data
    template.fields.forEach(field => {
      const value = formData[field.id] || `[${field.label.toUpperCase()}]`;
      const placeholder = `[${field.id.toUpperCase()}]`;
      generatedText = generatedText.replace(new RegExp(placeholder, 'g'), value);
    });

    // Handle common derived fields
    const relationship = formData['relationship'];
    if (relationship === 'Father' || relationship === 'Mother') {
      generatedText = generatedText.replace(/\[HIS_HER\]/g, relationship === 'Father' ? 'his' : 'her');
    }

    return generatedText;
  };

  const downloadDocument = (template: DocumentTemplate) => {
    const content = generateDocument(template);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      financial: 'bg-green-100 text-green-800',
      academic: 'bg-blue-100 text-blue-800',
      personal: 'bg-purple-100 text-purple-800',
      employment: 'bg-orange-100 text-orange-800',
      travel: 'bg-cyan-100 text-cyan-800',
      legal: 'bg-red-100 text-red-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Template Library</h1>
          <p className="text-gray-600">Pre-built templates for common visa application documents with step-by-step guidance</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Templates</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visa-type">Visa Type</Label>
                <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Visa Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      {template.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge variant="outline">
                    {template.countries.length} countries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Applicable for:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.visaTypes.slice(0, 2).map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {template.visaTypes.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.visaTypes.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.title}</DialogTitle>
                        </DialogHeader>
                        {selectedTemplate && (
                          <Tabs defaultValue="form" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="form">Fill Form</TabsTrigger>
                              <TabsTrigger value="preview">Preview</TabsTrigger>
                              <TabsTrigger value="guidance">Guidance</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="form" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedTemplate.fields.map(field => (
                                  <div key={field.id}>
                                    <Label htmlFor={field.id}>
                                      {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>
                                    {field.type === 'textarea' ? (
                                      <Textarea
                                        id={field.id}
                                        placeholder={field.placeholder}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                        rows={3}
                                      />
                                    ) : field.type === 'select' ? (
                                      <Select 
                                        value={formData[field.id] || ''} 
                                        onValueChange={(value) => handleInputChange(field.id, value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={field.placeholder} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {field.options?.map(option => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : (
                                      <Input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.id] || ''}
                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="preview" className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm">
                                  {generateDocument(selectedTemplate)}
                                </pre>
                              </div>
                              <Button 
                                onClick={() => downloadDocument(selectedTemplate)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Document
                              </Button>
                            </TabsContent>
                            
                            <TabsContent value="guidance" className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Instructions</h4>
                                  <ul className="space-y-2">
                                    {selectedTemplate.instructions.map((instruction, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span className="text-sm">{instruction}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-3">Tips</h4>
                                  <ul className="space-y-2">
                                    {selectedTemplate.tips.map((tip, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                        <span className="text-sm">{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3">Required Supporting Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {selectedTemplate.requiredDocuments.map((doc, index) => (
                                    <Badge key={index} variant="outline" className="justify-start">
                                      {doc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500 text-center">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}