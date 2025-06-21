import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, GraduationCap, DollarSign, Calendar, ExternalLink, Award, Clock, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { scholarshipSearchSchema, type ScholarshipSearch, type Scholarship } from '@shared/scholarshipSchema';

// Utility function to format dates safely
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not specified';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString; // Return original string if parsing fails
  }
};

interface ScholarshipResearchResponse {
  success: boolean;
  scholarships: Scholarship[];
  researchMetadata?: {
    tokensUsed: number;
    researchQuality: 'High' | 'Medium' | 'Low';
    sourceUrls: string[];
    researchDate: Date;
  };
  isFromCache: boolean;
  message: string;
  researchGroups?: Array<{
    groupName: string;
    scholarships: Scholarship[];
    totalFunding: string;
    averageAmount: string;
  }>;
}

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Not specified' || dateStr === 'Deadline not specified') {
      return 'Not specified';
    }
    return dateStr;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-blue-900 mb-2">
              {scholarship.scholarshipName}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                {scholarship.fundingType || 'Type not specified'}
              </Badge>
              {scholarship.researchQuality && (
                <Badge className={`text-xs ${getQualityColor(scholarship.researchQuality)}`}>
                  {scholarship.researchQuality} Quality
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <CardDescription className="text-sm text-gray-600 leading-relaxed">
          {scholarship.description || 'Description not available'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Funding Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-1">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Available Funds</span>
            </div>
            <div className="text-sm font-semibold text-green-700">
              {scholarship.availableFunds || 'Amount not specified'}
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Deadline</span>
            </div>
            <div className="text-sm font-semibold text-blue-700">
              {scholarship.applicationDeadline ? formatDate(scholarship.applicationDeadline) : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Awards and Renewal */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center mb-1">
              <Users className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Awards Available</span>
            </div>
            <div className="text-sm font-semibold text-purple-700">
              {scholarship.numberOfAwards || 'Number not specified'}
            </div>
          </div>
          
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center mb-1">
              <RefreshCw className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-800">Renewable</span>
            </div>
            <div className="text-sm font-semibold text-orange-700">
              {scholarship.renewalCriteria !== 'Renewal criteria not specified' ? 'Yes' : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        {scholarship.eligibilityCriteria && scholarship.eligibilityCriteria !== 'Criteria not specified' && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-800 mb-2">Eligibility Criteria</div>
            <div className="text-sm text-gray-700 leading-relaxed">
              {scholarship.eligibilityCriteria}
            </div>
          </div>
        )}

        {/* Application Process */}
        {scholarship.applicationProcess && scholarship.applicationProcess !== 'Process not specified' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Application Process</div>
            <div className="text-sm text-blue-700 leading-relaxed">
              {scholarship.applicationProcess}
            </div>
          </div>
        )}

        {/* Additional Benefits */}
        {scholarship.additionalBenefits && scholarship.additionalBenefits !== 'Additional benefits not specified' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800 mb-2">Additional Benefits</div>
            <div className="text-sm text-green-700 leading-relaxed">
              {scholarship.additionalBenefits}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {scholarship.scholarshipUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => scholarship.scholarshipUrl && window.open(scholarship.scholarshipUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}
          {scholarship.contactEmail && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => window.location.href = `mailto:${scholarship.contactEmail}`}
            >
              Contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ScholarshipResearch() {
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScholarshipSearch>({
    resolver: zodResolver(scholarshipSearchSchema),
    defaultValues: {
      institutionName: '',
      programName: '',
      programLevel: 'Bachelor\'s'
    }
  });

  // Research scholarships mutation
  const researchMutation = useMutation({
    mutationFn: async (data: ScholarshipSearch): Promise<ScholarshipResearchResponse> => {
      const response = await fetch('/api/scholarships/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to research scholarships');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setIsResearching(false);
      queryClient.invalidateQueries({ queryKey: ['/api/scholarships/my-research'] });
      
      toast({
        title: "Research Complete",
        description: data.message,
      });
    },
    onError: (error) => {
      setIsResearching(false);
      toast({
        title: "Research Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get user's research history
  const { data: researchHistory, isLoading: isLoadingHistory } = useQuery<ScholarshipResearchResponse>({
    queryKey: ['/api/scholarships/my-research'],
    enabled: true
  });

  const onSubmit = async (data: ScholarshipSearch) => {
    setIsResearching(true);
    researchMutation.mutate(data);
  };

  const currentResearch = researchHistory?.researchGroups?.find((group) => 
    group.groupName.includes(form.watch('institutionName') || '') &&
    group.groupName.includes(form.watch('programName') || '') &&
    group.groupName.includes(form.watch('programLevel') || '')
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Research</h1>
          <p className="text-gray-600 text-lg">
            Find scholarships for your target institution and program using AI-powered research
          </p>
        </div>

        {/* Research Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Research Scholarships
            </CardTitle>
            <CardDescription>
              Enter your target institution, program, and level to research available scholarships
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., University of Sydney"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the full name of the university or institution
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="programName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Computer Science"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the program or field of study
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="programLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                            <SelectItem value="Master's">Master's</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the level of study
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isResearching}
                  className="w-full md:w-auto"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Researching Scholarships...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Research Scholarships
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Current Research Results */}
        {currentResearch && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Scholarships for {currentResearch.institutionName}
              </h2>
              <Badge variant="outline" className="text-sm">
                {currentResearch.scholarshipCount} scholarships found
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentResearch.scholarships.map((scholarship: Scholarship) => (
                <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
              ))}
            </div>
          </div>
        )}

        {/* Research History */}
        {researchHistory?.researchGroups && researchHistory.researchGroups.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchHistory.researchGroups.map((group: any, index: number) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{group.institutionName}</CardTitle>
                    <CardDescription>
                      {group.programName} - {group.programLevel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="w-4 h-4 mr-1" />
                        {group.scholarshipCount} scholarships
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(group.researchDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingHistory && (!researchHistory?.researchGroups || researchHistory.researchGroups.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarship research yet</h3>
              <p className="text-gray-600 mb-4">
                Start by researching scholarships for your target institution and program above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}