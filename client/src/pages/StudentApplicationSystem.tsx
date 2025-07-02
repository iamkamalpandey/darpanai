import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertCircle, FileText, Upload, Calendar, CheckCircle, Clock, XCircle, BookOpen, MapPin, User, DollarSign, GraduationCap, Phone } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import DashboardLayout from '@/components/DashboardLayout';

// Form schemas for each step
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(2, "Nationality is required"),
  passportNumber: z.string().optional()
});

const academicInfoSchema = z.object({
  studyLevel: z.string().min(1, "Study level is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  preferredIntake: z.string().min(1, "Preferred intake is required"),
  targetCountry: z.string().min(1, "Target country is required"),
  previousQualifications: z.string().min(10, "Previous qualifications description is required")
});

const financialInfoSchema = z.object({
  budgetRange: z.string().min(1, "Budget range is required"),
  fundingSource: z.string().min(1, "Funding source is required"),
  sponsorshipDetails: z.string().optional()
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type AcademicInfo = z.infer<typeof academicInfoSchema>;
type FinancialInfo = z.infer<typeof financialInfoSchema>;

const STUDY_LEVELS = [
  'High School',
  'Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD/Doctorate',
  'Professional Certificate'
];

const COUNTRIES = [
  'Australia', 'Canada', 'United Kingdom', 'United States', 
  'Germany', 'New Zealand', 'Ireland', 'Netherlands', 
  'France', 'Switzerland', 'Sweden', 'Norway'
];

const BUDGET_RANGES = [
  'Under $20,000',
  '$20,000 - $40,000',
  '$40,000 - $60,000',
  '$60,000 - $80,000',
  '$80,000 - $100,000',
  'Over $100,000'
];

const FUNDING_SOURCES = [
  'Self-funded',
  'Family support',
  'Student loan',
  'Scholarship/Grant',
  'Government funding',
  'Employer sponsorship',
  'Mixed funding'
];

function ApplicationForm({ onSuccess }: { onSuccess: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationData, setApplicationData] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: ''
    }
  });

  const academicForm = useForm<AcademicInfo>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      studyLevel: '',
      fieldOfStudy: '',
      preferredIntake: '',
      targetCountry: '',
      previousQualifications: ''
    }
  });

  const financialForm = useForm<FinancialInfo>({
    resolver: zodResolver(financialInfoSchema),
    defaultValues: {
      budgetRange: '',
      fundingSource: '',
      sponsorshipDetails: ''
    }
  });

  const createApplicationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/applications', data),
    onSuccess: () => {
      toast({
        title: "Application Created Successfully",
        description: "Your study abroad application has been submitted for review."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications/my'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to create application. Please try again.",
        variant: "destructive"
      });
    }
  });

  const steps = ['Personal Info', 'Academic Info', 'Financial Info', 'Review & Submit'];

  const onPersonalSubmit = (data: PersonalInfo) => {
    setApplicationData(prev => ({ ...prev, personalDetails: data }));
    setCurrentStep(1);
  };

  const onAcademicSubmit = (data: AcademicInfo) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const onFinancialSubmit = (data: FinancialInfo) => {
    setApplicationData(prev => ({ ...prev, ...data }));
    setCurrentStep(3);
  };

  const onFinalSubmit = () => {
    createApplicationMutation.mutate(applicationData);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          Create Study Abroad Application
        </CardTitle>
        <CardDescription>
          Complete your application step by step. Your progress is automatically saved.
        </CardDescription>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <span
                key={step}
                className={`text-sm ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <Progress value={stepProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentStep === 0 && (
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={personalForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., American, Canadian, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter passport number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next: Academic Information
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 1 && (
          <Form {...academicForm}>
            <form onSubmit={academicForm.handleSubmit(onAcademicSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={academicForm.control}
                  name="studyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Study Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select study level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STUDY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={academicForm.control}
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science, Business, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={academicForm.control}
                  name="targetCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Country *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={academicForm.control}
                  name="preferredIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Intake *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select intake period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Fall 2025">Fall 2025</SelectItem>
                          <SelectItem value="Spring 2026">Spring 2026</SelectItem>
                          <SelectItem value="Summer 2026">Summer 2026</SelectItem>
                          <SelectItem value="Fall 2026">Fall 2026</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={academicForm.control}
                name="previousQualifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Qualifications *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your educational background, qualifications, and relevant experience..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Next: Financial Information
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 2 && (
          <Form {...financialForm}>
            <form onSubmit={financialForm.handleSubmit(onFinancialSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={financialForm.control}
                  name="budgetRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range (Annual) *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUDGET_RANGES.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={financialForm.control}
                  name="fundingSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Funding Source *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select funding source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FUNDING_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={financialForm.control}
                name="sponsorshipDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsorship/Financial Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide additional details about your funding, sponsors, or financial arrangements..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Review Application
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review Your Application</h3>
              <p className="text-gray-600">Please review all information before submitting</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {(applicationData as any)?.personalDetails?.fullName}</div>
                  <div><strong>Email:</strong> {(applicationData as any)?.personalDetails?.email}</div>
                  <div><strong>Phone:</strong> {(applicationData as any)?.personalDetails?.phoneNumber}</div>
                  <div><strong>Nationality:</strong> {(applicationData as any)?.personalDetails?.nationality}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Study Level:</strong> {(applicationData as any)?.studyLevel}</div>
                  <div><strong>Field:</strong> {(applicationData as any)?.fieldOfStudy}</div>
                  <div><strong>Country:</strong> {(applicationData as any)?.targetCountry}</div>
                  <div><strong>Intake:</strong> {(applicationData as any)?.preferredIntake}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>Budget:</strong> {(applicationData as any)?.budgetRange}</div>
                  <div><strong>Funding:</strong> {(applicationData as any)?.fundingSource}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={goBack}>
                Back to Edit
              </Button>
              <Button 
                onClick={onFinalSubmit}
                disabled={createApplicationMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsList() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['/api/applications/my'],
  });
  
  const applications = response?.applications || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'under_review': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.length > 0 ? (
        applications.map((app: any) => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {app.fieldOfStudy} in {app.targetCountry}
                  </h3>
                  <p className="text-gray-600">Application #{app.applicationNumber}</p>
                </div>
                <Badge className={getStatusColor(app.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(app.status)}
                    {app.status.replace('_', ' ').toUpperCase()}
                  </div>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Study Level:</span>
                  <div className="font-medium">{app.studyLevel}</div>
                </div>
                <div>
                  <span className="text-gray-500">Intake:</span>
                  <div className="font-medium">{app.preferredIntake}</div>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <div className="font-medium">{app.budgetRange}</div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {app.adminNotes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Notes:</strong> {app.adminNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't created any study abroad applications yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function StudentApplicationSystem() {
  const [activeTab, setActiveTab] = useState('applications');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Study Abroad Applications
        </h1>
        <p className="text-gray-600">
          Apply to study in your desired country with our guided application system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Applications
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationsList />
        </TabsContent>

        <TabsContent value="create">
          <ApplicationForm onSuccess={() => setActiveTab('applications')} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}