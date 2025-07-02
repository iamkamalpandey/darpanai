import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Upload, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  TrendingUp,
  Award,
  Globe,
  GraduationCap,
  DollarSign,
  Calendar,
  FileCheck,
  Target,
  Lightbulb
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DocumentAnalysis {
  id: number;
  fileName: string;
  fileType: string;
  documentType: 'transcript' | 'offer_letter' | 'coe' | 'visa_application' | 'recommendation_letter' | 'sop';
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  completedAt?: string;
  insights: {
    overallScore: number;
    strengthsCount: number;
    improvementsCount: number;
    riskLevel: 'low' | 'medium' | 'high';
    completeness: number;
  };
  recommendations: Array<{
    id: number;
    category: 'academic' | 'financial' | 'documentation' | 'timeline' | 'visa';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    actionRequired: boolean;
    estimatedImpact: string;
  }>;
  extractedData: Record<string, any>;
}

interface DocumentStats {
  totalDocuments: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  averageScore: number;
  successRate: number;
  documentsThisMonth: number;
}

export default function DocumentIntelligenceHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch document analyses
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/document-intelligence/analyses'],
    retry: false,
  });

  // Fetch document stats
  const { data: stats } = useQuery({
    queryKey: ['/api/document-intelligence/stats'],
    retry: false,
  });

  // Fetch detailed analysis
  const { data: detailedAnalysis } = useQuery({
    queryKey: ['/api/document-intelligence/analyses', selectedDocument],
    enabled: !!selectedDocument,
    retry: false,
  });

  // Re-analyze document mutation
  const reAnalyzeMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return apiRequest('POST', `/api/document-intelligence/analyses/${documentId}/reanalyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-intelligence'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <GraduationCap className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'documentation': return <FileCheck className="h-4 w-4" />;
      case 'timeline': return <Calendar className="h-4 w-4" />;
      case 'visa': return <Globe className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedDoc = documents.find((doc: DocumentAnalysis) => doc.id === selectedDocument);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Document Intelligence Hub
          </h1>
          <p className="text-gray-600 mt-1">AI-powered document analysis and recommendations</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-xl font-bold">{stats.totalDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold">{stats.completedAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">{stats.pendingAnalyses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-xl font-bold">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-xl font-bold">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-xl font-bold">{stats.documentsThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {documents.map((doc: DocumentAnalysis) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedDocument === doc.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {doc.fileName}
                          </h3>
                          <p className="text-xs text-gray-600 capitalize">
                            {doc.documentType.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(doc.analysisStatus)}`}>
                          {doc.analysisStatus}
                        </Badge>
                      </div>
                      
                      {doc.analysisStatus === 'completed' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Overall Score</span>
                            <span className="font-medium">{doc.insights.overallScore}%</span>
                          </div>
                          <Progress value={doc.insights.overallScore} className="h-2" />
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getRiskColor(doc.insights.riskLevel)}`}>
                              {doc.insights.riskLevel} risk
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {doc.analysisStatus === 'processing' && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Analyzing document...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Details */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    {selectedDoc.fileName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => reAnalyzeMutation.mutate(selectedDoc.id)}
                      disabled={reAnalyzeMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 ${reAnalyzeMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedDoc.analysisStatus === 'completed' ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      {/* Analysis Overview */}
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600 mb-1">
                                {selectedDoc.insights.overallScore}%
                              </div>
                              <p className="text-sm text-gray-600">Overall Score</p>
                              <Progress value={selectedDoc.insights.overallScore} className="mt-2" />
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600 mb-1">
                                {selectedDoc.insights.completeness}%
                              </div>
                              <p className="text-sm text-gray-600">Completeness</p>
                              <Progress value={selectedDoc.insights.completeness} className="mt-2" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-xl font-bold">{selectedDoc.insights.strengthsCount}</div>
                            <p className="text-sm text-gray-600">Strengths</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <div className="text-xl font-bold">{selectedDoc.insights.improvementsCount}</div>
                            <p className="text-sm text-gray-600">Improvements</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className={`h-8 w-8 rounded-full mx-auto mb-2 flex items-center justify-center ${getRiskColor(selectedDoc.insights.riskLevel)}`}>
                              !
                            </div>
                            <div className="text-xl font-bold capitalize">{selectedDoc.insights.riskLevel}</div>
                            <p className="text-sm text-gray-600">Risk Level</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="recommendations" className="space-y-4">
                      <div className="space-y-3">
                        {selectedDoc.recommendations.map((rec) => (
                          <Card key={rec.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-blue-100">
                                    {getCategoryIcon(rec.category)}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">{rec.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                    {rec.priority}
                                  </Badge>
                                  {rec.actionRequired && (
                                    <Badge variant="outline" className="text-xs">
                                      Action Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="capitalize">{rec.category}</span>
                                <span>Impact: {rec.estimatedImpact}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Extracted Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                              <div key={key} className="border-b border-gray-100 pb-2">
                                <p className="text-sm font-medium text-gray-600 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-sm text-gray-900">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                      {selectedDoc.analysisStatus === 'processing' ? (
                        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                      ) : selectedDoc.analysisStatus === 'pending' ? (
                        <Clock className="h-8 w-8 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedDoc.analysisStatus === 'processing' && 'Analysis in Progress'}
                      {selectedDoc.analysisStatus === 'pending' && 'Analysis Pending'}
                      {selectedDoc.analysisStatus === 'failed' && 'Analysis Failed'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedDoc.analysisStatus === 'processing' && 'Our AI is analyzing your document. This may take a few minutes.'}
                      {selectedDoc.analysisStatus === 'pending' && 'Your document is in the analysis queue.'}
                      {selectedDoc.analysisStatus === 'failed' && 'There was an error analyzing your document. Please try again.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                  <p className="text-gray-600">Choose a document from the list to view detailed analysis and recommendations</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}