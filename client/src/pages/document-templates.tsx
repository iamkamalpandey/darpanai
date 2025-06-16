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
import { FileText, Download, Eye, Search, Filter, MapPin, Plane, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type DocumentTemplate } from "@shared/schema";

export default function DocumentTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVisaType, setSelectedVisaType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedUserType, setSelectedUserType] = useState<string>("all");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/document-templates'],
  });

  const { data: dropdownOptions } = useQuery({
    queryKey: ['/api/dropdown-options'],
  });

  const categories = ["all", "financial", "academic", "personal", "employment", "travel", "legal"];
  const countries = ["all", ...(dropdownOptions?.countries || [])];
  const visaTypes = ["all", ...(dropdownOptions?.visaTypes || [])];
  const userTypes = ["all", ...(dropdownOptions?.userTypes || [])];

  const filteredTemplates = (templates as DocumentTemplate[]).filter((template: DocumentTemplate) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesVisaType = selectedVisaType === "all" || template.visaType === selectedVisaType;
    const matchesCountry = selectedCountry === "all" || template.country === selectedCountry;
    const matchesUserType = selectedUserType === "all" || template.userType === selectedUserType;
    
    return matchesSearch && matchesCategory && matchesVisaType && matchesCountry && matchesUserType;
  });

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const generateDocument = (template: DocumentTemplate) => {
    let generatedText = template.content;
    
    // Replace placeholders with form data
    const fields = (template.fields as any[]) || [];
    fields.forEach((field: any) => {
      const placeholder = `{{${field.id}}}`;
      const value = formData[field.id] || '';
      generatedText = generatedText.replace(new RegExp(placeholder, 'g'), value);
    });

    // Create and download the document
    const blob = new Blob([generatedText], { type: 'text/plain' });
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
    const colors: Record<string, string> = {
      financial: "bg-green-100 text-green-800",
      academic: "bg-blue-100 text-blue-800",
      personal: "bg-purple-100 text-purple-800",
      employment: "bg-orange-100 text-orange-800",
      travel: "bg-indigo-100 text-indigo-800",
      legal: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading templates...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Template Library</h1>
            <p className="text-muted-foreground">
              Access ready-to-use document templates for your visa application
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Templates
            </CardTitle>
            <CardDescription>
              Find the perfect template for your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Country
                  </Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="All countries" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country === "all" ? "All Countries" : country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Plane className="h-4 w-4 mr-1" />
                    Visa Type
                  </Label>
                  <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All visa types" />
                    </SelectTrigger>
                    <SelectContent>
                      {visaTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All Visa Types" : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    User Type
                  </Label>
                  <Select value={selectedUserType} onValueChange={setSelectedUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All user types" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? "All User Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedCountry("all");
                      setSelectedVisaType("all");
                      setSelectedUserType("all");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: DocumentTemplate) => (
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
                    {template.country}
                  </Badge>
                  <Badge variant="secondary">
                    {template.visaType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {selectedTemplate?.title}
                        </DialogTitle>
                      </DialogHeader>
                      {selectedTemplate && (
                        <Tabs defaultValue="preview" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                            <TabsTrigger value="generate">Generate</TabsTrigger>
                          </TabsList>
                          <TabsContent value="preview" className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Template Content</Label>
                              <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{selectedTemplate.content}</pre>
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="generate" className="space-y-4">
                            <div className="space-y-4">
                              {((selectedTemplate.fields as any[]) || []).map((field: any) => (
                                <div key={field.id} className="space-y-2">
                                  <Label htmlFor={field.id}>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                                  {field.type === 'textarea' ? (
                                    <Textarea
                                      id={field.id}
                                      placeholder={field.placeholder}
                                      value={formData[field.id] || ''}
                                      onChange={(e) => handleInputChange(field.id, e.target.value)}
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
                                        {(field.options || []).map((option: string) => (
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
                              <Button
                                onClick={() => generateDocument(selectedTemplate)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Generate & Download Document
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
              <p className="text-muted-foreground text-center">
                No templates match your current search criteria. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}