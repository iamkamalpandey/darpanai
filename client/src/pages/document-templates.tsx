import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, Filter } from "lucide-react";
import { type DocumentTemplate } from "@shared/schema";
import { DashboardLayout } from "@/components/DashboardLayout";

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
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-gray-600 mt-2">
            Download sample documents and templates for your visa application
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Countries</option>
            {(dropdownOptions?.countries || []).map((country: string) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={selectedVisaType}
            onChange={(e) => setSelectedVisaType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Visa Types</option>
            {(dropdownOptions?.visaTypes || []).map((visaType: string) => (
              <option key={visaType} value={visaType}>{visaType}</option>
            ))}
          </select>

          <div className="flex items-center justify-between">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <span className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="flex flex-col hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base lg:text-lg leading-tight line-clamp-2 mb-1">
                        {template.title}
                      </CardTitle>
                      <CardDescription className="text-xs lg:text-sm">
                        {template.documentType ? 
                          template.documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                          'Document'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 flex-1 flex flex-col">
                <p className="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
                  {template.description}
                </p>
                
                <div className="space-y-2 mb-4">
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

                {/* Instructions */}
                {template.instructions && template.instructions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Instructions:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {template.instructions.slice(0, 3).map((instruction, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                      {template.instructions.length > 3 && (
                        <li className="text-gray-500 italic">
                          +{template.instructions.length - 3} more instructions
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {template.tips && template.tips.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tips:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {template.tips.slice(0, 2).map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                      {template.tips.length > 2 && (
                        <li className="text-gray-500 italic">
                          +{template.tips.length - 2} more tips
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Download Button */}
                <div className="pt-3 border-t mt-auto">
                  {template.filePath ? (
                    <Button
                      onClick={() => downloadTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full"
                      size="sm"
                      variant="secondary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Template Info Only
                    </Button>
                  )}
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
      </div>
    </DashboardLayout>
  );
}