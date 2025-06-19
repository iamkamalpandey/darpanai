import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText, CheckCircle, ArrowRight, Star, Shield, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function EnrollmentAnalysis() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Document Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your enrollment documents for comprehensive AI-powered analysis. Get detailed 
            insights on scholarship information, requirements, and compliance.
          </p>
        </div>

        {/* Analysis Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6 max-w-4xl mx-auto">
          
          {/* COE Document Analysis */}
          <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                Available
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900 mb-2">COE Document Analysis</CardTitle>
                  <CardDescription className="text-blue-700">
                    Specialized AI-powered analysis for Confirmation of Enrollment (COE) documents from universities worldwide. 
                    Extract comprehensive institution details, financial breakdown, and compliance requirements.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <GraduationCap className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Institution & Course Details</h4>
                  <p className="text-xs text-blue-600">CRICOS codes, course structure, program duration, and academic requirements</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Financial Breakdown</h4>
                  <p className="text-xs text-blue-600">Tuition fees, OSHC, payment schedules, and scholarship information</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Shield className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-blue-900 mb-1">Visa Compliance</h4>
                  <p className="text-xs text-blue-600">Student visa obligations, work rights, and compliance requirements</p>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="pt-2">
                <Link href="/coe-analysis">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                    <span>Analyze COE Document</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Offer Letter Analysis - Coming Soon */}
          <Card className="relative overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                Coming Soon
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Star className="h-8 w-8 text-gray-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl text-gray-700 mb-2">Offer Letter Analysis</CardTitle>
                  <CardDescription className="text-gray-600">
                    Comprehensive analysis for university offer letters including admission conditions, 
                    program requirements, deadlines, and next steps for enrollment.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <CheckCircle className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Admission Conditions</h4>
                  <p className="text-xs text-gray-500">Academic requirements, language scores, and conditional offers</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <FileText className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Program Details</h4>
                  <p className="text-xs text-gray-500">Course structure, specializations, and academic calendar</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                  <Shield className="h-5 w-5 text-gray-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-gray-600 mb-1">Enrollment Steps</h4>
                  <p className="text-xs text-gray-500">Acceptance deadlines, deposit requirements, and next actions</p>
                </div>
              </div>
              
              {/* Disabled Button */}
              <div className="pt-2">
                <Button disabled className="w-full" size="lg" variant="outline">
                  <span>Available Soon</span>
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  This analysis type will be available in the next update
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help Choosing?</h3>
              <p className="text-blue-700 mb-4">
                Not sure which document analysis type you need? Our experts can help you identify 
                the right analysis for your specific documents and requirements.
              </p>
              <Link href="/consultations">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Book a Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}