import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, University, DollarSign, Award, TrendingUp } from 'lucide-react';

interface AnalysisData {
  id: number;
  documentId: number;
  fileName: string;
  fileSize: number;
  analysisDate: string;
  analysisResults: any;
  institutionName?: string;
  programName?: string;
  studentName?: string;
  tuitionAmount?: string;
  startDate?: string;
  processingTime?: number;
  tokensUsed?: number;
  claudeTokensUsed?: number;
}

export default function OfferLetterAnalysisDisplay() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery<AnalysisData>({
    queryKey: ['/api/offer-letter-analyses', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Analysis Not Found</h2>
            <p className="text-gray-600 mb-4">The requested offer letter analysis could not be loaded.</p>
            <Link href="/offer-letter-analysis">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Analysis List
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const analysisData = data.analysisResults || {};
  const safeGet = (path: string, fallback: any = "Not specified") => {
    try {
      const keys = path.split('.');
      let result = analysisData;
      for (const key of keys) {
        result = result?.[key];
      }
      return result !== undefined && result !== null ? result : fallback;
    } catch {
      return fallback;
    }
  };

  // Extract key information with multiple fallback sources
  const institutionName = data.institutionName || safeGet('universityInfo.name') || safeGet('institution.name') || "Institution Name Not Available";
  const programName = data.programName || safeGet('programDetails.programName') || safeGet('program.name') || "Program Not Specified";
  const tuitionFee = data.tuitionAmount || safeGet('financialDetails.tuitionFee') || safeGet('costs.tuition') || "Fee Not Specified";
  const studentName = data.studentName || safeGet('studentInfo.name') || "Student Name Not Available";

  // Extract arrays safely
  const scholarships = Array.isArray(safeGet('scholarshipOpportunities', [])) ? safeGet('scholarshipOpportunities', []) : [];
  const recommendations = Array.isArray(safeGet('recommendations', [])) ? safeGet('recommendations', []) : [];
  const nextSteps = Array.isArray(safeGet('nextSteps', [])) ? safeGet('nextSteps', []) : [];
  const costSavingStrategies = Array.isArray(safeGet('costSavingStrategies', [])) ? safeGet('costSavingStrategies', []) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/offer-letter-analysis">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Analysis
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offer Letter Analysis</h1>
            <p className="text-gray-600">Powered by Darpan AI</p>
          </div>
        </div>
        <Badge variant="secondary">
          Analysis Complete
        </Badge>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Document</p>
              <p className="font-semibold text-sm">{data.fileName}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <University className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Institution</p>
              <p className="font-semibold text-sm">{institutionName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Tuition</p>
              <p className="font-semibold text-sm">{tuitionFee}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="font-semibold text-sm">{data.processingTime || 0}s</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="program">Program Details</TabsTrigger>
          <TabsTrigger value="financial">Financial Info</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <University className="w-5 h-5 text-blue-600" />
                  Institution Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Institution Name</label>
                  <p className="text-gray-900">{institutionName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900">{safeGet('universityInfo.location')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Institution Type</label>
                  <p className="text-gray-900">{safeGet('institutionType')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Accreditation</label>
                  <p className="text-gray-900">{safeGet('universityInfo.accreditation')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Student Name</label>
                  <p className="text-gray-900">{studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Program</label>
                  <p className="text-gray-900">{programName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">{data.startDate || safeGet('programDetails.startDate')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Analysis Date</label>
                  <p className="text-gray-900">{new Date(data.analysisDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="program" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Program Name</label>
                  <p className="text-gray-900">{programName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Degree Type</label>
                  <p className="text-gray-900">{safeGet('programDetails.degree')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900">{safeGet('programDetails.duration')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Specialization</label>
                  <p className="text-gray-900">{safeGet('programDetails.specialization')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Course Structure</label>
                <p className="text-gray-900">{safeGet('programDetails.courseStructure')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tuition Fee</label>
                  <p className="text-gray-900 font-semibold">{tuitionFee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Application Fee</label>
                  <p className="text-gray-900">{safeGet('financialDetails.applicationFee')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Living Costs</label>
                  <p className="text-gray-900">{safeGet('financialDetails.livingCosts')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Estimated Cost</label>
                  <p className="text-gray-900 font-semibold">{safeGet('financialDetails.totalEstimatedCost')}</p>
                </div>
              </div>
              
              {costSavingStrategies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Cost Saving Strategies</label>
                  <div className="space-y-2">
                    {costSavingStrategies.map((strategy: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-medium text-green-800">{strategy.strategy || strategy}</p>
                        {strategy.description && (
                          <p className="text-green-700 text-sm mt-1">{strategy.description}</p>
                        )}
                        {strategy.potentialSavings && (
                          <Badge variant="secondary" className="mt-2">
                            Potential Savings: {strategy.potentialSavings}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Scholarship Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scholarships.length > 0 ? (
                <div className="space-y-4">
                  {scholarships.map((scholarship: any, index: number) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800">
                        {scholarship.name || `Scholarship ${index + 1}`}
                      </h4>
                      {scholarship.amount && (
                        <p className="text-yellow-700 font-medium">{scholarship.amount}</p>
                      )}
                      {scholarship.criteria && (
                        <div className="mt-2">
                          <p className="text-sm text-yellow-600">Eligibility:</p>
                          {Array.isArray(scholarship.criteria) ? (
                            <ul className="list-disc list-inside text-sm text-yellow-700">
                              {scholarship.criteria.map((criterion: string, i: number) => (
                                <li key={i}>{criterion}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-yellow-700">{scholarship.criteria}</p>
                          )}
                        </div>
                      )}
                      {scholarship.applicationDeadline && (
                        <p className="text-sm text-yellow-600 mt-2">
                          Deadline: {scholarship.applicationDeadline}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No specific scholarship information available in this analysis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {recommendations.map((rec: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <p className="text-gray-700">{typeof rec === 'string' ? rec : rec.description || rec.title || 'Recommendation not available'}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No specific recommendations available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {nextSteps.length > 0 ? (
                  <ol className="space-y-2">
                    {nextSteps.map((step: any, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-gray-700">{typeof step === 'string' ? step : step.description || step.step || 'Step not available'}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-600">No specific next steps available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Processing Time</label>
            <p className="text-gray-900">{data.processingTime || 0} seconds</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">AI Tokens Used</label>
            <p className="text-gray-900">{(data.tokensUsed || 0) + (data.claudeTokensUsed || 0)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">File Size</label>
            <p className="text-gray-900">{(data.fileSize / 1024).toFixed(1)} KB</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Document ID</label>
            <p className="text-gray-900">{data.documentId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}