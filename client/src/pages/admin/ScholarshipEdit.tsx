import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { insertScholarshipSchema, type Scholarship } from '@shared/scholarshipSchema';
import { z } from 'zod';

// Extended schema for editing with all fields
const editScholarshipSchema = insertScholarshipSchema.extend({
  id: z.number().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'draft']).default('active'),
  createdDate: z.date().optional(),
  updatedDate: z.date().optional()
});

type EditScholarshipFormData = z.infer<typeof editScholarshipSchema>;

export default function ScholarshipEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch scholarship data
  const { data: scholarshipData, isLoading } = useQuery({
    queryKey: ['admin-scholarship', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/scholarships/${id}`);
      if (!response.ok) throw new Error('Failed to fetch scholarship');
      return response.json();
    },
    enabled: !!id
  });

  const scholarship = scholarshipData?.data;

  // Form configuration
  const form = useForm<EditScholarshipFormData>({
    resolver: zodResolver(editScholarshipSchema),
    defaultValues: scholarship || {},
    values: scholarship || undefined
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: EditScholarshipFormData) => 
      apiRequest('PUT', `/api/admin/scholarships/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-scholarship', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-scholarships'] });
      toast({
        title: "Success",
        description: "Scholarship updated successfully"
      });
      setLocation('/admin/scholarships');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update scholarship",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EditScholarshipFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Scholarship not found</h3>
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/scholarships')}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scholarships
        </Button>
      </div>
    );
  }

  const steps = [
    { title: 'Basic Information', fields: ['name', 'status', 'description'] },
    { title: 'Provider Details', fields: ['providerName', 'providerType', 'providerCountry'] },
    { title: 'Study Information', fields: ['fieldCategories'] },
    { title: 'Funding Details', fields: ['fundingType'] },
    { title: 'Requirements', fields: ['difficultyLevel'] }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/admin/scholarships')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Scholarships
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Scholarship</h1>
              <p className="text-sm text-gray-600">{scholarship.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={scholarship.status === 'active' ? 'default' : 'secondary'}>
              {scholarship.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Sections</h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === index
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-gray-500">{step.fields.length} fields</div>
                </button>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => form.setValue('status', scholarship.status === 'active' ? 'inactive' : 'active')}
                    className="w-full justify-start"
                  >
                    {scholarship.status === 'active' ? 'Deactivate' : 'Activate'} Scholarship
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{steps[currentStep].title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    {currentStep === 0 && (
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Scholarship Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="pending">Pending Review</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    value={field.value || ''} 
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
                                    rows={4} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Provider Details */}
                    {currentStep === 1 && (
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="providerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="providerType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select provider type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="government">Government</SelectItem>
                                  <SelectItem value="institution">Institution</SelectItem>
                                  <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="providerCountry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Country</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="AU">Australia</SelectItem>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="EU">European Union</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="providerWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provider Website</FormLabel>
                              <FormControl>
                                <Input {...field} type="url" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Additional steps would be implemented similarly */}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-2">
                        {currentStep < steps.length - 1 ? (
                          <Button
                            type="button"
                            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}