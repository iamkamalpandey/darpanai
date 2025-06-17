import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, Filter } from "lucide-react";
import { type DocumentTemplate } from "@shared/schema";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";

const categories = [
  { value: "financial", label: "Financial" },
  { value: "academic", label: "Academic" },
  { value: "personal", label: "Personal" },
  { value: "employment", label: "Employment" },
  { value: "travel", label: "Travel" },
  { value: "legal", label: "Legal" },
  { value: "medical", label: "Medical" },
  { value: "insurance", label: "Insurance" },
  { value: "accommodation", label: "Accommodation" },
  { value: "language", label: "Language" },
  { value: "others", label: "Others" }
];

export default function DocumentTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedVisaType, setSelectedVisaType] = useState("");

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/document-templates'],
  });

  const { data: dropdownOptions = { countries: [], visaTypes: [] } } = useQuery<{
    countries: string[];
    visaTypes: string[];
    userTypes: string[];
  }>({
    queryKey: ['/api/dropdown-options'],
  });

  const filteredTemplates = templates.filter((template: DocumentTemplate) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesCountry = !selectedCountry || (template.countries && template.countries.includes(selectedCountry));
    const matchesVisaType = !selectedVisaType || (template.visaTypes && template.visaTypes.includes(selectedVisaType));
    
    return matchesSearch && matchesCategory && matchesCountry && matchesVisaType;
  });

  const downloadTemplate = (template: DocumentTemplate) => {
    if (template.externalUrl) {
      window.open(template.externalUrl, '_blank');
    } else if (template.filePath) {
      const link = document.createElement('a');
      link.href = `/api/document-templates/${template.id}/download`;
      link.download = template.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedVisaType("");
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedCountry || selectedVisaType;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center">Loading document templates...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Document Templates</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Download sample documents and templates for your visa application
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-4">
          {/* Search Bar - Full Width */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            >
              <option value="">All Countries</option>
              {(dropdownOptions?.countries || []).map((country: string) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={selectedVisaType}
              onChange={(e) => setSelectedVisaType(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
            >
              <option value="">All Visa Types</option>
              {(dropdownOptions?.visaTypes || []).map((visaType: string) => (
                <option key={visaType} value={visaType}>{visaType}</option>
              ))}
            </select>
          </div>

          {/* Results and Clear Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </span>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                Clear All Filters
              </Button>
            )}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full min-w-0">
          {filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md bg-white w-full min-w-0 max-w-full overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3 min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 truncate">
                      {template.category}
                    </Badge>
                  </div>
                  {template.fileName && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0 ml-2">
                      File Available
                    </div>
                  )}
                </div>
                
                <CardTitle className="text-base sm:text-lg leading-tight mb-2 group-hover:text-blue-700 transition-colors truncate">
                  {template.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-gray-600 line-clamp-3 leading-relaxed break-words">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4 min-w-0 overflow-hidden">
                {/* Countries and Visa Types */}
                <div className="space-y-3 min-w-0">
                  {template.countries && template.countries.length > 0 && (
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-700 mb-1 truncate">Countries:</div>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {template.countries.slice(0, 2).map((country) => (
                          <Badge key={country} variant="secondary" className="text-xs truncate max-w-full">
                            {country}
                          </Badge>
                        ))}
                        {template.countries.length > 2 && (
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            +{template.countries.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {template.visaTypes && template.visaTypes.length > 0 && (
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-700 mb-1 truncate">Visa Types:</div>
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {template.visaTypes.slice(0, 2).map((visaType) => (
                          <Badge key={visaType} variant="outline" className="text-xs truncate max-w-full">
                            {visaType}
                          </Badge>
                        ))}
                        {template.visaTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            +{template.visaTypes.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions Preview */}
                {template.instructions && template.instructions.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Key Instructions:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {template.instructions.slice(0, 2).map((instruction, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <span className="line-clamp-2">{instruction}</span>
                        </div>
                      ))}
                      {template.instructions.length > 2 && (
                        <div className="text-xs text-blue-600">+{template.instructions.length - 2} more instructions</div>
                      )}
                    </div>
                  </div>
                )}

                {/* File Details */}
                <div className="space-y-2">
                  {template.fileName && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">File:</span>
                      <span className="font-medium truncate ml-2 max-w-[60%]">{template.fileName}</span>
                    </div>
                  )}
                  
                  {template.fileSize && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Size:</span>
                      <span>{formatFileSize(template.fileSize)}</span>
                    </div>
                  )}

                  {template.countries && template.countries.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-1">Countries:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.countries.slice(0, 3).map((country, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {country}
                          </Badge>
                        ))}
                        {template.countries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.countries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {template.visaTypes && template.visaTypes.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500 block mb-1">Visa Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.visaTypes.slice(0, 2).map((visa, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {visa}
                          </Badge>
                        ))}
                        {template.visaTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.visaTypes.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tips Preview */}
                {template.tips && template.tips.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">Expert Tips:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {template.tips.slice(0, 2).map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <span className="line-clamp-2">{tip}</span>
                        </div>
                      ))}
                      {template.tips.length > 2 && (
                        <div className="text-xs text-green-600">+{template.tips.length - 2} more tips</div>
                      )}
                    </div>
                  </div>
                )}

                {/* File Information */}
                {(template.fileName || template.fileSize) && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {template.fileName && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">File:</span>
                        <span className="font-medium text-gray-800 truncate ml-2">{template.fileName}</span>
                      </div>
                    )}
                    {template.fileSize && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-800">{formatFileSize(template.fileSize)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Download Action */}
                <div className="pt-2">
                  <Button
                    variant={template.filePath || template.externalUrl ? "default" : "outline"}
                    size="sm"
                    onClick={() => downloadTemplate(template)}
                    disabled={!template.filePath && !template.externalUrl}
                    className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {template.filePath || template.externalUrl ? "Download Template" : "Not Available"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters 
                ? "Try adjusting your search or filter criteria to find relevant templates."
                : "Document templates are currently being prepared. Please check back soon."
              }
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {/* Strategic CTA for Document Assistance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6 mt-6 sm:mt-8">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-3">
              Need Help Customizing These Documents?
            </h3>
            <p className="text-sm sm:text-base text-green-700 mb-4 max-w-2xl mx-auto">
              These templates are just the starting point. Get personalized guidance from our visa experts to ensure your documents meet specific embassy requirements and maximize approval chances.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ConsultationForm 
                buttonSize="lg"
                buttonText="Get Document Review & Guidance"
                subject="Document Template Customization Assistance"
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              />
              <Link href="/document-checklist" className="w-full sm:w-auto">
                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  View Document Checklists
                </Button>
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-green-600 mt-3">
              Document review • Embassy-specific requirements • 92% document approval rate
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}