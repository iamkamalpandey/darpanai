import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  User, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award, 
  Edit3, 
  Check, 
  X, 
  ArrowRight,
  Info,
  AlertTriangle,
  Sparkles,
  Eye
} from 'lucide-react';
import { AcademicDocumentAnalysisResults } from '@shared/academicDocumentSchema';

interface ProfileUpdatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: {
    id: number;
    fileName: string;
    analysisResults: AcademicDocumentAnalysisResults;
  };
  onSuccess?: () => void;
}

interface ProfileUpdateData {
  field: string;
  label: string;
  currentValue: string | null;
  newValue: string;
  category: 'personal' | 'academic' | 'qualification' | 'dates';
  icon: any;
  isSelected: boolean;
  isEdited: boolean;
  editedValue?: string;
}

export default function ProfileUpdatePreview({ 
  isOpen, 
  onClose, 
  analysisData,
  onSuccess 
}: ProfileUpdatePreviewProps) {
  const [updateFields, setUpdateFields] = useState<ProfileUpdateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('preview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user profile data
  const { data: currentProfile } = useQuery({
    queryKey: ['/api/user'],
    enabled: isOpen,
  });

  // Initialize update fields when dialog opens
  useEffect(() => {
    if (isOpen && analysisData && currentProfile) {
      const fields = generateUpdateFields(analysisData.analysisResults, currentProfile);
      setUpdateFields(fields);
      setIsLoading(false);
    }
  }, [isOpen, analysisData, currentProfile]);

  const generateUpdateFields = (
    analysisResults: AcademicDocumentAnalysisResults, 
    profile: any
  ): ProfileUpdateData[] => {
    const fields: ProfileUpdateData[] = [];

    // Personal Information - Academic documents typically don't contain student names
    // so we skip name extraction from academic documents

    // Academic Information
    if (analysisResults.institutionName && analysisResults.institutionName !== profile.highestInstitution) {
      fields.push({
        field: 'highestInstitution',
        label: 'Educational Institution',
        currentValue: profile.highestInstitution || null,
        newValue: analysisResults.institutionName,
        category: 'academic',
        icon: GraduationCap,
        isSelected: true,
        isEdited: false,
      });
    }

    if (analysisResults.institutionCountry && analysisResults.institutionCountry !== profile.highestCountry) {
      fields.push({
        field: 'highestCountry',
        label: 'Country of Education',
        currentValue: profile.highestCountry || null,
        newValue: analysisResults.institutionCountry,
        category: 'academic',
        icon: MapPin,
        isSelected: true,
        isEdited: false,
      });
    }

    if (analysisResults.institutionCity && analysisResults.institutionCity !== profile.city) {
      fields.push({
        field: 'city',
        label: 'City',
        currentValue: profile.city || null,
        newValue: analysisResults.institutionCity,
        category: 'academic',
        icon: MapPin,
        isSelected: true,
        isEdited: false,
      });
    }

    // Qualification Information
    if (analysisResults.qualificationLevel && analysisResults.qualificationLevel !== profile.highestQualification) {
      fields.push({
        field: 'highestQualification',
        label: 'Highest Qualification',
        currentValue: profile.highestQualification || null,
        newValue: analysisResults.qualificationLevel,
        category: 'qualification',
        icon: Award,
        isSelected: true,
        isEdited: false,
      });
    }

    if (analysisResults.fieldOfStudy && analysisResults.fieldOfStudy !== profile.fieldOfStudy) {
      fields.push({
        field: 'fieldOfStudy',
        label: 'Field of Study',
        currentValue: profile.fieldOfStudy || null,
        newValue: analysisResults.fieldOfStudy,
        category: 'qualification',
        icon: GraduationCap,
        isSelected: true,
        isEdited: false,
      });
    }

    if (analysisResults.qualificationTitle && analysisResults.qualificationTitle !== profile.interestedCourse) {
      fields.push({
        field: 'interestedCourse',
        label: 'Course/Program Title',
        currentValue: profile.interestedCourse || null,
        newValue: analysisResults.qualificationTitle,
        category: 'qualification',
        icon: GraduationCap,
        isSelected: true,
        isEdited: false,
      });
    }

    if (analysisResults.gpa && analysisResults.gpa !== profile.highestGpa) {
      fields.push({
        field: 'highestGpa',
        label: 'GPA/Grade',
        currentValue: profile.highestGpa || null,
        newValue: analysisResults.gpa,
        category: 'qualification',
        icon: Award,
        isSelected: true,
        isEdited: false,
      });
    }

    // Date Information
    if (analysisResults.graduationDate || analysisResults.endDate) {
      const gradDate = analysisResults.graduationDate || analysisResults.endDate;
      const gradYear = gradDate ? new Date(gradDate).getFullYear() : null;
      
      if (gradYear && gradYear !== profile.graduationYear) {
        fields.push({
          field: 'graduationYear',
          label: 'Graduation Year',
          currentValue: profile.graduationYear?.toString() || null,
          newValue: gradYear.toString(),
          category: 'dates',
          icon: Calendar,
          isSelected: true,
          isEdited: false,
        });
      }
    }

    return fields;
  };

  const handleFieldToggle = (fieldName: string, checked: boolean) => {
    setUpdateFields(prev => prev.map(field => 
      field.field === fieldName 
        ? { ...field, isSelected: checked }
        : field
    ));
  };

  const handleFieldEdit = (fieldName: string, value: string) => {
    setUpdateFields(prev => prev.map(field => 
      field.field === fieldName 
        ? { ...field, editedValue: value, isEdited: true }
        : field
    ));
  };

  const applyUpdatesMutation = useMutation({
    mutationFn: async (updates: ProfileUpdateData[]) => {
      const selectedUpdates = updates.filter(field => field.isSelected);
      const updateData: Record<string, any> = {};
      
      selectedUpdates.forEach(field => {
        updateData[field.field] = field.isEdited ? field.editedValue : field.newValue;
      });

      const response = await fetch('/api/user/profile-selective-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Mark analysis as applied
      const markResponse = await fetch(`/api/academic-document-analyses/${analysisData.id}/apply-to-profile`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!markResponse.ok) {
        console.warn('Failed to mark analysis as applied');
      }

      return response.json();
    },
    onSuccess: (data) => {
      const selectedCount = updateFields.filter(f => f.isSelected).length;
      toast({
        title: "Profile Updated Successfully!",
        description: `Updated ${selectedCount} field${selectedCount !== 1 ? 's' : ''} from your academic document.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic-document-analyses'] });
      
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleApplyUpdates = () => {
    const selectedFields = updateFields.filter(field => field.isSelected);
    
    if (selectedFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    applyUpdatesMutation.mutate(updateFields);
  };

  const selectedCount = updateFields.filter(f => f.isSelected).length;
  const totalCount = updateFields.length;

  const groupedFields = updateFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ProfileUpdateData[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'personal': return 'Personal Information';
      case 'academic': return 'Academic Institution';
      case 'qualification': return 'Qualification Details';
      case 'dates': return 'Timeline Information';
      default: return 'Other Information';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return User;
      case 'academic': return GraduationCap;
      case 'qualification': return Award;
      case 'dates': return Calendar;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-600">Preparing update preview...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Profile Update Preview
          </DialogTitle>
          <DialogDescription>
            Review and customize the information extracted from <strong>{analysisData.fileName}</strong> before updating your profile.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Changes ({selectedCount}/{totalCount})
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit & Customize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {totalCount === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    No new information found in this document that differs from your current profile.
                    Your profile appears to be up-to-date with this document.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Sparkles className="w-4 h-4" />
                    <AlertDescription>
                      Found <strong>{totalCount}</strong> field{totalCount !== 1 ? 's' : ''} that can be updated from your document.
                      Review the changes below and customize as needed.
                    </AlertDescription>
                  </Alert>

                  {Object.entries(groupedFields).map(([category, fields]) => {
                    const CategoryIcon = getCategoryIcon(category);
                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <CategoryIcon className="w-4 h-4" />
                            {getCategoryTitle(category)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {fields.map((field) => {
                            const FieldIcon = field.icon;
                            return (
                              <div key={field.field} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50">
                                <Checkbox
                                  checked={field.isSelected}
                                  onCheckedChange={(checked) => handleFieldToggle(field.field, checked as boolean)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FieldIcon className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-sm">{field.label}</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500 text-xs">Current:</span>
                                      <div className={`${field.currentValue ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                        {field.currentValue || 'Not set'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 text-xs">New:</span>
                                      <div className="text-green-700 font-medium">
                                        {field.isEdited ? field.editedValue : field.newValue}
                                      </div>
                                    </div>
                                  </div>
                                  {field.isEdited && (
                                    <Badge variant="secondary" className="mt-2">
                                      <Edit3 className="w-3 h-3 mr-1" />
                                      Customized
                                    </Badge>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-green-600 mt-6" />
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {totalCount === 0 ? (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    No fields available for editing. All information in this document matches your current profile.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Edit3 className="w-4 h-4" />
                    <AlertDescription>
                      Customize the extracted information before applying to your profile.
                      You can edit any field to ensure accuracy.
                    </AlertDescription>
                  </Alert>

                  {Object.entries(groupedFields).map(([category, fields]) => {
                    const CategoryIcon = getCategoryIcon(category);
                    return (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm font-medium">
                            <CategoryIcon className="w-4 h-4" />
                            {getCategoryTitle(category)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {fields.map((field) => {
                            const FieldIcon = field.icon;
                            return (
                              <div key={field.field} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={field.isSelected}
                                    onCheckedChange={(checked) => handleFieldToggle(field.field, checked as boolean)}
                                  />
                                  <FieldIcon className="w-4 h-4 text-gray-500" />
                                  <Label className="font-medium">{field.label}</Label>
                                </div>
                                <div className="ml-6">
                                  <Input
                                    value={field.isEdited ? field.editedValue : field.newValue}
                                    onChange={(e) => handleFieldEdit(field.field, e.target.value)}
                                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    disabled={!field.isSelected}
                                    className={field.isEdited ? 'border-orange-300 bg-orange-50' : ''}
                                  />
                                  {field.currentValue && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Current: {field.currentValue}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>{selectedCount} of {totalCount} fields selected for update</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={applyUpdatesMutation.isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyUpdates}
              disabled={selectedCount === 0 || applyUpdatesMutation.isPending}
              className="min-w-[120px]"
            >
              {applyUpdatesMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Updates
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}