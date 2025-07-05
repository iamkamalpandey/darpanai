import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Globe, 
  FileText, 
  TrendingUp,
  Brain,
  Target,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface EligibilityResult {
  scholarshipId: number;
  scholarshipName: string;
  eligibilityScore: number;
  eligibilityStatus: 'highly-eligible' | 'eligible' | 'partially-eligible' | 'not-eligible';
  matchedCriteria: string[];
  missingRequirements: string[];
  recommendations: string[];
  fundingAmount: string;
  deadline: string;
  applicationUrl: string;
}

interface QuickScanResult {
  totalScholarships: number;
  eligibleScholarships: number;
  highlyEligibleScholarships: number;
  totalPotentialFunding: string;
  scanCompletedAt: string;
  profileCompleteness: number;
  results: EligibilityResult[];
  improvementSuggestions: string[];
}

const EligibilityQuickScan: React.FC = () => {
  const [scanResults, setScanResults] = useState<QuickScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user profile data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Get user profile completion
  const { data: profileCompletion } = useQuery({
    queryKey: ['/api/user/profile-completion'],
  });

  // Quick Scan Mutation
  const quickScanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/eligibility/quick-scan', {});
      return response.json();
    },
    onSuccess: (data: QuickScanResult) => {
      setScanResults(data);
      setIsScanning(false);
      toast({
        title: "✨ Eligibility Scan Complete!",
        description: `Found ${data.eligibleScholarships} eligible scholarships out of ${data.totalScholarships} analyzed.`,
      });
    },
    onError: (error) => {
      setIsScanning(false);
      toast({
        title: "Scan Failed",
        description: "Unable to complete eligibility scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickScan = () => {
    setIsScanning(true);
    quickScanMutation.mutate();
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case 'highly-eligible': return 'bg-green-500';
      case 'eligible': return 'bg-blue-500';
      case 'partially-eligible': return 'bg-yellow-500';
      case 'not-eligible': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getEligibilityIcon = (status: string) => {
    switch (status) {
      case 'highly-eligible': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'eligible': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'partially-eligible': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'not-eligible': return <XCircle className="h-5 w-5 text-gray-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'highly-eligible': return 'Highly Eligible';
      case 'eligible': return 'Eligible';
      case 'partially-eligible': return 'Partially Eligible';
      case 'not-eligible': return 'Not Eligible';
      default: return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-7 w-7 text-blue-600" />
              One-Click Eligibility Quick Scan
            </h1>
            <p className="text-gray-600 mt-1">
              Instantly analyze your eligibility across all available scholarships
            </p>
          </div>
          <Button
            onClick={handleQuickScan}
            disabled={isScanning}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start Quick Scan
              </>
            )}
          </Button>
        </div>

        {/* Profile Readiness Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Profile Readiness for Accurate Matching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-600">
                  {(profileCompletion as any)?.completionPercentage || 0}%
                </span>
              </div>
              <Progress 
                value={(profileCompletion as any)?.completionPercentage || 0} 
                className="w-full h-2"
              />
              {(profileCompletion as any)?.completionPercentage < 80 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Complete your profile to {(profileCompletion as any)?.completionPercentage < 50 ? '80%' : '100%'} for more accurate eligibility matching.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scanning Animation */}
        {isScanning && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-16 w-16 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -inset-2 border-2 border-blue-200 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Analyzing Your Eligibility</h3>
                  <p className="text-gray-600">Matching your profile against scholarship criteria...</p>
                </div>
                <div className="flex justify-center space-x-1">
                  <div className="animate-bounce bg-blue-500 h-2 w-2 rounded-full" style={{ animationDelay: '0ms' }}></div>
                  <div className="animate-bounce bg-blue-500 h-2 w-2 rounded-full" style={{ animationDelay: '150ms' }}></div>
                  <div className="animate-bounce bg-blue-500 h-2 w-2 rounded-full" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Results */}
        {scanResults && (
          <div className="space-y-6">
            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Scan Results Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{scanResults.totalScholarships}</div>
                    <div className="text-sm text-gray-600">Total Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{scanResults.eligibleScholarships}</div>
                    <div className="text-sm text-gray-600">Eligible For</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{scanResults.highlyEligibleScholarships}</div>
                    <div className="text-sm text-gray-600">Highly Eligible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{scanResults.totalPotentialFunding}</div>
                    <div className="text-sm text-gray-600">Potential Funding</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-center text-sm text-gray-500">
                  Scan completed at {new Date(scanResults.scanCompletedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Improvement Suggestions */}
            {scanResults?.improvementSuggestions?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Recommendations to Improve Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scanResults.improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-purple-800">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Results */}
            <div className="grid gap-4">
              {scanResults.results.map((result) => (
                <Card key={result.scholarshipId} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{result.scholarshipName}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            {getEligibilityIcon(result.eligibilityStatus)}
                            <span className="text-sm font-medium">
                              {getStatusText(result.eligibilityStatus)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-semibold text-blue-600">{result.eligibilityScore}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">{result.fundingAmount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{result.deadline}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Eligibility Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Eligibility Match</span>
                          <span className="text-sm text-gray-600">{result.eligibilityScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getEligibilityColor(result.eligibilityStatus)}`}
                            style={{ width: `${result.eligibilityScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Matched Criteria */}
                      {result.matchedCriteria.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            You Meet These Requirements
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {result.matchedCriteria.map((criteria, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                {criteria}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Requirements */}
                      {result.missingRequirements.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            Missing Requirements
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {result.missingRequirements.map((requirement, index) => (
                              <Badge key={index} variant="outline" className="border-red-200 text-red-700 text-xs">
                                {requirement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Recommendations */}
                      {result.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            AI Recommendations
                          </h4>
                          <div className="space-y-1">
                            {result.recommendations.map((recommendation, index) => (
                              <div key={index} className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                {recommendation}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/scholarship-details/${result.scholarshipId}`, '_blank')}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" />
                          View Details
                        </Button>
                        {result.eligibilityStatus !== 'not-eligible' && (
                          <Button
                            size="sm"
                            onClick={() => window.open(result.applicationUrl, '_blank')}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Globe className="h-3 w-3" />
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!scanResults && !isScanning && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-blue-100 rounded-full p-4">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to Scan Your Eligibility?</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Click "Start Quick Scan" to instantly analyze your profile against all available scholarships and discover your best opportunities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EligibilityQuickScan;