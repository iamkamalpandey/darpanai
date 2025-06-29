import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Upload, 
  FileText, 
  User, 
  GraduationCap, 
  Briefcase, 
  Globe,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Brain,
  Clock,
  Zap
} from 'lucide-react';

interface CvAnalysisResults {
  personalInfo: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    nationality?: string;
    dateOfBirth?: string;
    linkedIn?: string;
  };
  education: {
    highestQualification?: string;
    institution?: string;
    graduationYear?: string;
    gpa?: string;
    fieldOfStudy?: string;
    additionalQualifications?: string[];
  };
  workExperience: {
    currentEmploymentStatus?: string;
    totalExperienceYears?: number;
    currentJobTitle?: string;
    currentOrganization?: string;
    workHistory?: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
  };
  skills: {
    technicalSkills?: string[];
    languages?: Array<{
      language: string;
      proficiency: string;
    }>;
    certifications?: string[];
  };
  preferences: {
    interestedCourse?: string;
    preferredCountries?: string[];
    careerGoals?: string;
  };
  confidence: {
    personalInfo: number;
    education: number;
    workExperience: number;
    skills: number;
    overall: number;
  };
}

interface CvAnalysis {
  id: number;
  fileName: string;
  fileSize: number;
  analysisResults: CvAnalysisResults;
  processingTime?: number;
  tokensUsed?: number;
  createdAt: string;
  isAppliedToProfile: boolean;
}

export default function CvAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's CV analyses
  const { data: cvAnalyses = [], isLoading } = useQuery({
    queryKey: ['/api/cv-analyses'],
  });

  // Upload and analyze CV mutation
  const analyzeCvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('cv', file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      try {
        const response = await apiRequest('POST', '/api/cv-analysis', formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "CV Analysis Complete!",
        description: "Your CV has been successfully analyzed and the information has been extracted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cv-analyses'] });
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze CV. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  });

  // Apply CV data to profile mutation
  const applyToProfileMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      return apiRequest('POST', `/api/cv-analyses/${analysisId}/apply-to-profile`);
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Updated!",
        description: `Successfully updated ${data.updatedFields.length} profile fields from your CV.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cv-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-completion'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Profile",
        description: error.message || "Failed to apply CV data to profile.",
        variant: "destructive",
      });
    }
  });

  // Delete CV analysis mutation
  const deleteMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      return apiRequest('DELETE', `/api/cv-analyses/${analysisId}`);
    },
    onSuccess: () => {
      toast({
        title: "Analysis Deleted",
        description: "CV analysis has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cv-analyses'] });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, JPG, or PNG file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeCvMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'default';
    if (confidence >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CV Analysis & Profile Auto-Fill</h1>
          <p className="text-gray-600 mt-1">
            Upload your CV and let AI extract information to automatically populate your profile
          </p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your CV
            </CardTitle>
            <CardDescription>
              Upload a PDF, JPG, or PNG file of your CV/Resume (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="cv-upload"
              />
              <label htmlFor="cv-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium">Choose a file or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </label>
            </div>

            {selectedFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading and analyzing...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzeCvMutation.isPending}
                  className="w-full"
                >
                  {analyzeCvMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 animate-pulse" />
                      Analyzing CV...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Analyze CV
                    </div>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CV Analyses List */}
        <Card>
          <CardHeader>
            <CardTitle>Your CV Analyses</CardTitle>
            <CardDescription>
              View and manage your uploaded CV analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">Loading analyses...</p>
              </div>
            ) : cvAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No CV analyses yet. Upload your first CV to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cvAnalyses.map((analysis: CvAnalysis) => (
                  <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{analysis.fileName}</h3>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(analysis.fileSize)} • 
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {analysis.isAppliedToProfile && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                          <Badge variant="outline" className={getConfidenceColor(analysis.analysisResults.confidence.overall)}>
                            {analysis.analysisResults.confidence.overall}% Confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="personal">Personal</TabsTrigger>
                          <TabsTrigger value="education">Education</TabsTrigger>
                          <TabsTrigger value="work">Work</TabsTrigger>
                          <TabsTrigger value="skills">Skills</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <User className="w-6 h-6 text-blue-600" />
                              <div>
                                <p className="font-medium">Personal Info</p>
                                <Badge variant={getConfidenceBadge(analysis.analysisResults.confidence.personalInfo)}>
                                  {analysis.analysisResults.confidence.personalInfo}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                              <GraduationCap className="w-6 h-6 text-green-600" />
                              <div>
                                <p className="font-medium">Education</p>
                                <Badge variant={getConfidenceBadge(analysis.analysisResults.confidence.education)}>
                                  {analysis.analysisResults.confidence.education}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <Briefcase className="w-6 h-6 text-purple-600" />
                              <div>
                                <p className="font-medium">Work Experience</p>
                                <Badge variant={getConfidenceBadge(analysis.analysisResults.confidence.workExperience)}>
                                  {analysis.analysisResults.confidence.workExperience}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                              <Globe className="w-6 h-6 text-orange-600" />
                              <div>
                                <p className="font-medium">Skills</p>
                                <Badge variant={getConfidenceBadge(analysis.analysisResults.confidence.skills)}>
                                  {analysis.analysisResults.confidence.skills}%
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            {!analysis.isAppliedToProfile && (
                              <Button 
                                onClick={() => applyToProfileMutation.mutate(analysis.id)}
                                disabled={applyToProfileMutation.isPending}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Apply to Profile
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => deleteMutation.mutate(analysis.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="personal" className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.analysisResults.personalInfo.fullName && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.fullName}</p>
                              </div>
                            )}
                            {analysis.analysisResults.personalInfo.email && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.email}</p>
                              </div>
                            )}
                            {analysis.analysisResults.personalInfo.phone && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.phone}</p>
                              </div>
                            )}
                            {analysis.analysisResults.personalInfo.city && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.city}</p>
                              </div>
                            )}
                            {analysis.analysisResults.personalInfo.country && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.country}</p>
                              </div>
                            )}
                            {analysis.analysisResults.personalInfo.nationality && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Nationality</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.personalInfo.nationality}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="education" className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.analysisResults.education.highestQualification && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Highest Qualification</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.education.highestQualification}</p>
                              </div>
                            )}
                            {analysis.analysisResults.education.institution && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Institution</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.education.institution}</p>
                              </div>
                            )}
                            {analysis.analysisResults.education.fieldOfStudy && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Field of Study</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.education.fieldOfStudy}</p>
                              </div>
                            )}
                            {analysis.analysisResults.education.graduationYear && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Graduation Year</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.education.graduationYear}</p>
                              </div>
                            )}
                            {analysis.analysisResults.education.gpa && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">GPA/Grade</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.education.gpa}</p>
                              </div>
                            )}
                          </div>
                          {analysis.analysisResults.education.additionalQualifications && analysis.analysisResults.education.additionalQualifications.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Additional Qualifications</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.analysisResults.education.additionalQualifications.map((qual, index) => (
                                  <Badge key={index} variant="outline">{qual}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="work" className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.analysisResults.workExperience.currentEmploymentStatus && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Employment Status</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.workExperience.currentEmploymentStatus}</p>
                              </div>
                            )}
                            {analysis.analysisResults.workExperience.totalExperienceYears && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Total Experience</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.workExperience.totalExperienceYears} years</p>
                              </div>
                            )}
                            {analysis.analysisResults.workExperience.currentJobTitle && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Current Job Title</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.workExperience.currentJobTitle}</p>
                              </div>
                            )}
                            {analysis.analysisResults.workExperience.currentOrganization && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">Current Organization</label>
                                <p className="text-sm text-gray-900">{analysis.analysisResults.workExperience.currentOrganization}</p>
                              </div>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-4">
                          {analysis.analysisResults.skills.technicalSkills && analysis.analysisResults.skills.technicalSkills.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Technical Skills</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.analysisResults.skills.technicalSkills.map((skill, index) => (
                                  <Badge key={index} variant="outline">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis.analysisResults.skills.languages && analysis.analysisResults.skills.languages.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Languages</label>
                              <div className="space-y-2 mt-1">
                                {analysis.analysisResults.skills.languages.map((lang, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm">{lang.language}</span>
                                    <Badge variant="secondary">{lang.proficiency}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysis.analysisResults.skills.certifications && analysis.analysisResults.skills.certifications.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-700">Certifications</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.analysisResults.skills.certifications.map((cert, index) => (
                                  <Badge key={index} variant="outline">{cert}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}