import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ExternalLink, User, Building2 } from "lucide-react";
import { type DocumentTemplate } from "@shared/schema";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { CustomCTA } from "@/components/CustomCTA";
import { EnhancedFilters, FilterOptions, searchInText } from "@/components/EnhancedFilters";

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
  const [filters, setFilters] = useState<FilterOptions>({});

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

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Text search across multiple fields
    if (filters.searchTerm) {
      filtered = filtered.filter(template => 
        searchInText(template, filters.searchTerm!, [
          'title',
          'description',
          'category'
        ])
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(template => template.category === filters.category);
    }

    // Country filter
    if (filters.country) {
      filtered = filtered.filter(template => 
        template.countries && template.countries.includes(filters.country!)
      );
    }

    // Visa type filter
    if (filters.visaType) {
      filtered = filtered.filter(template => 
        template.visaTypes && template.visaTypes.includes(filters.visaType!)
      );
    }

    return filtered;
  }, [templates, filters]);

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Templates</h1>
          <p className="text-gray-600">
            Download sample documents and templates for your visa application
          </p>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          config={{
            showSearch: true,
            showCategory: true,
            showCountry: true,
            showVisaType: true,
          }}
          dropdownOptions={{
            countries: dropdownOptions?.countries || [],
            visaTypes: dropdownOptions?.visaTypes || [],
            categories: categories.map(c => c.value).filter(Boolean),
          }}
          resultCount={filteredTemplates.length}
        />

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-200 shadow-sm hover:shadow-md bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-800 border-purple-200"
                  >
                    {template.category}
                  </Badge>
                  {template.countries && template.countries.slice(0, 2).map((country, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Building2 className="h-3 w-3 mr-1" />
                      {country}
                    </Badge>
                  ))}
                  {template.countries && template.countries.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.countries.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-gray-600 leading-relaxed">
                  {template.description}
                </CardDescription>

                {/* File Information */}
                {(template.fileName || template.fileSize) && (
                  <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {template.fileName || 'Document Template'}
                    </span>
                    {template.fileSize && (
                      <span>{formatFileSize(template.fileSize)}</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => downloadTemplate(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {template.externalUrl && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(template.externalUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
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
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your filters or check back later for new templates.
            </p>
          </div>
        )}

        {/* Customized CTA Section */}
        <CustomCTA variant="resources" source="document-templates-page" />
      </div>
    </DashboardLayout>
  );
}