import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  FileText,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star
} from 'lucide-react';

export default function DocumentTemplates() {
  const templates = [
    {
      title: "Visa Application Template",
      description: "Comprehensive visa application form template with guidelines",
      category: "Visa Documents",
      format: "PDF",
      size: "2.5 MB",
      downloads: "12.3k",
      rating: 4.8,
      premium: false
    },
    {
      title: "Statement of Purpose Template",
      description: "Professional SOP template for university applications",
      category: "Academic Documents",
      format: "DOCX",
      size: "1.2 MB",
      downloads: "8.7k",
      rating: 4.9,
      premium: true
    },
    {
      title: "Financial Documentation Guide",
      description: "Complete financial proof documentation template",
      category: "Financial Documents",
      format: "PDF",
      size: "3.1 MB",
      downloads: "5.2k",
      rating: 4.7,
      premium: false
    },
    {
      title: "Letter of Recommendation Template",
      description: "Professional LOR template for academic applications",
      category: "Academic Documents",
      format: "DOCX",
      size: "0.8 MB",
      downloads: "9.1k",
      rating: 4.8,
      premium: true
    }
  ];

  const categories = ["All", "Visa Documents", "Academic Documents", "Financial Documents"];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Templates</h1>
          <p className="text-gray-600">Professional templates to streamline your application process</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  {template.premium && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {template.title}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{template.category}</span>
                  <span>{template.format} • {template.size}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {template.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {template.rating}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Need Help with Templates?</h3>
                <p className="text-gray-600 mb-4">
                  Our templates are professionally designed and regularly updated to meet current requirements.
                  Each template includes detailed instructions and examples.
                </p>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}