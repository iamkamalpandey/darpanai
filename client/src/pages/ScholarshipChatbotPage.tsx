import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ScholarshipChatbot } from '@/components/ScholarshipChatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Heart, Star, Lightbulb, MessageCircle } from 'lucide-react';

function ScholarshipChatbotPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Scholarship AI Assistant
                </h1>
                <p className="text-gray-600">
                  Get personalized scholarship recommendations with empathetic guidance
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Empathetic Support</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Understanding guidance tailored to your emotional needs and concerns
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Smart Matching</span>
                  </div>
                  <p className="text-sm text-green-700">
                    AI-powered analysis to find scholarships that perfectly match your profile
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Strategic Advice</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Actionable recommendations to improve your scholarship applications
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick Tips Card */}
          <Card className="lg:w-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Chat Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Badge variant="outline" className="w-full justify-start">
                  💡 Be specific about your field of study
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  🎯 Mention your academic level (Bachelor's, Master's, PhD)
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  🌍 Share your preferred study destinations
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  💰 Discuss your funding needs and budget
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  ❤️ Express your concerns or worries freely
                </Badge>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Remember:</strong> The more details you share, the better I can help you find perfect scholarship matches and provide supportive guidance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Chatbot Interface */}
        <ScholarshipChatbot />
        
        {/* Information Footer */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Your AI-Powered Scholarship Counselor
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  This AI assistant uses advanced natural language processing to understand your unique situation, 
                  academic background, and financial needs. It provides personalized scholarship recommendations 
                  while offering empathetic support throughout your funding journey.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real-time matching</Badge>
                  <Badge variant="secondary">Emotional intelligence</Badge>
                  <Badge variant="secondary">Personalized guidance</Badge>
                  <Badge variant="secondary">24/7 available</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ScholarshipChatbotPage;