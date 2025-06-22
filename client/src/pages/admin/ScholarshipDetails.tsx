import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Edit, DollarSign, Globe, Calendar, Users, BookOpen, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// @ts-ignore
import ScholarshipSectionEditor from "../../components/admin/ScholarshipSectionEditor";
import { Label } from "@/components/ui/label";

interface Scholarship {
  id: number;
  scholarshipId: string;
  scholarshipName: string;
  providerName: string;
  providerType: string;
  providerCountry: string;
  description: string;
  shortDescription: string;
  applicationUrl: string;
  studyLevel: string;
  fieldCategory: string;
  targetCountries: string[];
  fundingType: string;
  fundingAmount: number;
  fundingCurrency: string;
  applicationDeadline: string;
  eligibilityRequirements: string[];
  languageRequirements: string[];
  difficultyLevel: string;
  dataSource: string;
  verified: boolean;
  status: string;
  createdDate: string;
  updatedDate: string;
}

const editingSections = [
  {
    key: 'basic',
    title: 'Basic Information',
    icon: BookOpen,
    fields: ['scholarshipName', 'providerName', 'providerType', 'providerCountry', 'description', 'shortDescription', 'applicationUrl']
  },
  {
    key: 'funding',
    title: 'Funding Details',
    icon: DollarSign,
    fields: ['fundingType', 'fundingAmount', 'fundingCurrency']
  },
  {
    key: 'eligibility',
    title: 'Eligibility & Requirements',
    icon: Users,
    fields: ['studyLevel', 'fieldCategory', 'targetCountries', 'eligibilityRequirements', 'languageRequirements']
  },
  {
    key: 'application',
    title: 'Application Process',
    icon: Calendar,
    fields: ['applicationDeadline', 'difficultyLevel']
  },
  {
    key: 'additional',
    title: 'Additional Settings',
    icon: GraduationCap,
    fields: ['dataSource', 'verified', 'status']
  }
];

export default function ScholarshipDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scholarshipResponse, isLoading, error } = useQuery({
    queryKey: ['/api/admin/scholarships', id],
    queryFn: () => apiRequest('GET', `/api/admin/scholarships/${id}`)
  });

  const scholarship = scholarshipResponse as unknown as Scholarship;

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: Partial<Scholarship> }) => 
      apiRequest('PUT', `/api/admin/scholarships/${data.id}`, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/scholarships', id] });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      toast({
        title: "Success",
        description: "Scholarship updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update scholarship",
        variant: "destructive"
      });
    }
  });

  const handleSectionEdit = (sectionKey: string) => {
    setEditingSection(sectionKey);
    setIsEditDialogOpen(true);
  };

  const handleSectionUpdate = (data: Partial<Scholarship>) => {
    if (!scholarship || !editingSection) return;
    
    updateMutation.mutate({
      id: scholarship.id,
      data
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Failed to load scholarship details</p>
          <Button onClick={() => setLocation('/admin/scholarships')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scholarships
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'very-hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation('/admin/scholarships')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scholarships
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{scholarship.scholarshipName}</h1>
            <p className="text-gray-600">{scholarship.providerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(scholarship.status?.toString() || 'active')}>
            {scholarship.status}
          </Badge>
          {scholarship.verified && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Verified
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Funding Amount</p>
                <p className="font-semibold">{formatCurrency(scholarship.fundingAmount, scholarship.fundingCurrency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Target Countries</p>
                <p className="font-semibold">{scholarship.targetCountries?.length || 0} Countries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="font-semibold">{scholarship.applicationDeadline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <Badge className={getDifficultyColor(scholarship.difficultyLevel)}>
                  {scholarship.difficultyLevel}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionEdit('basic')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Scholarship ID</Label>
                  <p className="mt-1">{scholarship.scholarshipId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Provider Type</Label>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {scholarship.providerType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Provider Country</Label>
                  <p className="mt-1">{scholarship.providerCountry}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="mt-1 text-sm text-gray-700">{scholarship.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application URL</Label>
                  <a 
                    href={scholarship.applicationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 text-blue-600 hover:underline block break-all"
                  >
                    {scholarship.applicationUrl}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Study Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionEdit('eligibility')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Study Level</Label>
                  <p className="mt-1">{scholarship.studyLevel}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Field Category</Label>
                  <p className="mt-1">{scholarship.fieldCategory}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Target Countries</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {scholarship.targetCountries?.map((country: string, index: number) => (
                      <Badge key={index} variant="outline">{country}</Badge>
                    )) || <p className="text-gray-500">No countries specified</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funding">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Funding Details
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSectionEdit('funding')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Funding Type</Label>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {scholarship.fundingType?.replace('-', ' ') || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(scholarship.fundingAmount, scholarship.fundingCurrency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Currency</Label>
                  <p className="mt-1">{scholarship.fundingCurrency}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Eligibility & Requirements
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSectionEdit('eligibility')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-600">Eligibility Requirements</Label>
                <ul className="mt-2 space-y-2">
                  {scholarship.eligibilityRequirements?.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{req}</span>
                    </li>
                  )) || <p className="text-gray-500">No requirements specified</p>}
                </ul>
              </div>
              
              {scholarship.languageRequirements?.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Language Requirements</Label>
                  <ul className="mt-2 space-y-2">
                    {scholarship.languageRequirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Application Process
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSectionEdit('application')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Application Deadline</Label>
                  <p className="mt-1 text-lg font-semibold">{scholarship.applicationDeadline}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Difficulty Level</Label>
                  <Badge className={getDifficultyColor(scholarship.difficultyLevel) + " mt-1"}>
                    {scholarship.difficultyLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Additional Settings
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSectionEdit('additional')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data Source</Label>
                  <p className="mt-1">{scholarship.dataSource}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Verified</Label>
                  <Badge variant={scholarship.verified ? "default" : "secondary"} className="mt-1">
                    {scholarship.verified ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(scholarship.status) + " mt-1"}>
                    {scholarship.status}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                    <p className="mt-1">{new Date(scholarship.createdDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                    <p className="mt-1">{new Date(scholarship.updatedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editingSections.find(s => s.key === editingSection)?.title}
            </DialogTitle>
            <DialogDescription>
              Update scholarship information for the selected section
            </DialogDescription>
          </DialogHeader>
          {editingSection && scholarship && (
            <ScholarshipSectionEditor
              scholarship={scholarship}
              section={editingSection}
              onSubmit={handleSectionUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}