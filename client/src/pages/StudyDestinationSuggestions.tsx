import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DashboardLayout from '@/components/DashboardLayout';
import { useLocation } from 'wouter';
import { 
  Globe, 
  Clock,
  ArrowLeft,
  Construction,
  Info
} from 'lucide-react';

export default function StudyDestinationSuggestions() {
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Study Destination Suggestions</h1>
                <p className="text-gray-600">Personalized recommendations for your study abroad journey</p>
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
                  Feature Coming Soon
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We're working on an advanced AI-powered destination suggestion system that will provide 
                  personalized study abroad recommendations based on your profile and preferences.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* What's Coming */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>What to expect:</strong> Our AI will analyze your academic background, 
                    financial situation, language proficiency, and career goals to suggest the best 
                    study destinations with detailed insights on universities, costs, and requirements.
                  </AlertDescription>
                </Alert>

                {/* Features Preview */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      Planned Features
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        Personalized country recommendations
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        University matching based on your profile
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        Scholarship opportunities analysis
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        Cost breakdown and financial planning
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">System Architecture - Complete</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">AI Model Development - In Progress</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Beta Testing - Upcoming</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-sm text-gray-600">Public Release - Q2 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-6 border-t">
                  <p className="text-gray-600 mb-4">
                    In the meantime, explore our available document analysis features
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setLocation('/visa-analysis')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Try Visa Analysis
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