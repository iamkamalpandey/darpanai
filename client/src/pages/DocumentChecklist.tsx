import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { 
  FileText,
  CheckCircle2,
  Circle,
  Download,
  Clock,
  AlertTriangle,
  Globe,
  GraduationCap
} from 'lucide-react';

export default function DocumentChecklist() {
  const [selectedCountry, setSelectedCountry] = useState('australia');
  const [checkedItems, setCheckedItems] = useState<{[key: string]: boolean}>({});

  const countries = [
    { id: 'australia', name: 'Australia', flag: '🇦🇺' },
    { id: 'canada', name: 'Canada', flag: '🇨🇦' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'usa', name: 'United States', flag: '🇺🇸' },
    { id: 'germany', name: 'Germany', flag: '🇩🇪' }
  ];

  const checklists = {
    australia: {
      title: "Australia Student Visa Checklist",
      subtitle: "Subclass 500 Student Visa Requirements",
      documents: [
        {
          category: "Academic Documents",
          required: true,
          items: [
            "Confirmation of Enrollment (CoE)",
            "Academic transcripts (certified copies)",
            "English language test results (IELTS/PTE/TOEFL)",
            "Graduation certificates",
            "Statement of Purpose"
          ]
        },
        {
          category: "Financial Documents",
          required: true,
          items: [
            "Bank statements (last 3 months)",
            "Financial capacity evidence",
            "Scholarship letters (if applicable)",
            "Education loan documents",
            "Sponsor's financial documents"
          ]
        },
        {
          category: "Personal Documents",
          required: true,
          items: [
            "Valid passport",
            "Passport-size photographs",
            "Birth certificate",
            "Health insurance (OSHC)",
            "Medical examination results"
          ]
        },
        {
          category: "Additional Requirements",
          required: false,
          items: [
            "Work experience certificates",
            "Character certificates",
            "Previous visa records",
            "Family relationship documents"
          ]
        }
      ]
    }
  };

  const currentChecklist = checklists[selectedCountry as keyof typeof checklists] || checklists.australia;

  const handleItemCheck = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getTotalProgress = () => {
    const totalItems = currentChecklist.documents.reduce((sum, category) => sum + category.items.length, 0);
    const checkedItemsCount = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checkedItemsCount / totalItems) * 100);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Checklist</h1>
          <p className="text-gray-600">Complete visa application checklist for your destination</p>
        </div>

        {/* Country Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Your Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {countries.map((country) => (
                <Button
                  key={country.id}
                  variant={selectedCountry === country.id ? "default" : "outline"}
                  onClick={() => setSelectedCountry(country.id)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{country.flag}</span>
                  {country.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentChecklist.title}</h3>
                <p className="text-gray-600">{currentChecklist.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{getTotalProgress()}%</div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Categories */}
        <div className="space-y-6">
          {currentChecklist.documents.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                  <Badge variant={category.required ? "destructive" : "secondary"}>
                    {category.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {category.items.map((item, itemIndex) => {
                    const itemId = `${categoryIndex}-${itemIndex}`;
                    const isChecked = checkedItems[itemId] || false;
                    
                    return (
                      <div
                        key={itemIndex}
                        className={`flex items-center gap-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          isChecked ? 'bg-green-50' : ''
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleItemCheck(itemId)}
                          className="h-5 w-5"
                        />
                        <div className="flex-1">
                          <span className={`${isChecked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item}
                          </span>
                        </div>
                        {isChecked && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button className="flex-1" size="lg">
            <Download className="h-5 w-5 mr-2" />
            Download PDF Checklist
          </Button>
          <Button variant="outline" size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Print Checklist
          </Button>
        </div>

        {/* Important Notes */}
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important Notes</h3>
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li>• All documents must be in English or officially translated</li>
                  <li>• Ensure all documents are current and not expired</li>
                  <li>• Keep both original and certified copies of all documents</li>
                  <li>• Requirements may vary by institution and course level</li>
                  <li>• Always verify with official embassy/consulate websites</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}