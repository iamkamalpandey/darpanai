import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { 
  MapPin, 
  Clock,
  ArrowLeft,
  Construction,
  Info
} from 'lucide-react';

export default function PersonalizedDestinationAnalysis() {
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personalized Destination Analysis</h1>
                <p className="text-gray-600">Detailed analysis of your suggested study destinations</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-6">
                  <Construction className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Feature Under Development
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                  This advanced analysis page will provide detailed insights into your personalized 
                  study destination recommendations with comprehensive breakdowns and action plans.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* What's Coming */}
                <Alert className="border-green-200 bg-green-50">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Coming features:</strong> Detailed country analysis, university comparisons, 
                    scholarship matching, visa requirements, cost breakdowns, and personalized action plans 
                    for each recommended destination.
                  </AlertDescription>
                </Alert>

                {/* Features Preview */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Analysis Features
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        Country-specific requirements analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        University ranking and program matching
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        Visa success probability assessment
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        Cost optimization strategies
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      Development Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">UI Framework - Complete</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Analysis Engine - In Development</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Data Integration - Planned</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Testing Phase - Q2 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600 mb-4">
                    Explore our current document analysis capabilities while we develop this feature
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setLocation('/offer-letter-analysis')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Try Offer Letter Analysis
                    </Button>
                    <Button 
                      onClick={() => setLocation('/enrollment-analysis')}
                      variant="outline"
                    >
                      Try COE Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}