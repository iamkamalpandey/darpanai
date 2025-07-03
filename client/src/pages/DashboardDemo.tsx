import React from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'wouter';
import { 
  GraduationCap,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  Home,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  Target
} from 'lucide-react';

export default function DashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Darpan Education Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Single unified platform with three specialized role-based dashboards for comprehensive education management.
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Unified Platform Architecture
          </Badge>
        </div>

        {/* Dashboard Access Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Student Dashboard */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Student Dashboard</CardTitle>
                  <CardDescription>Available at: <code>/</code> (when logged as student)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>AI Document Analysis Tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Scholarship Research Hub</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Application Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Expert Consultation Booking</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Access Method:</p>
                <p className="text-xs text-blue-600">Login with regular user credentials at /login</p>
              </div>
            </CardContent>
          </Card>

          {/* Expert Dashboard */}
          <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Expert Dashboard</CardTitle>
                  <CardDescription>Available at: <code>/</code> (when logged as expert)</CardDescription>
                </div>
              </div>
              <Badge className="w-fit bg-purple-100 text-purple-700 hover:bg-purple-100">Currently Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Student Management System</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Consultation Services</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Analytics & Reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Professional Tools</span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">Access Method:</p>
                <p className="text-xs text-purple-600">Login with expert credentials (role: 'expert')</p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">Admin Dashboard</CardTitle>
                  <CardDescription>Available at: <code>/admin</code> (admin only)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>User Management</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Expert Assignment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>System Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Platform Oversight</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Access Method:</p>
                <p className="text-xs text-green-600">Login with admin credentials (role: 'admin')</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Access Instructions */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How to Access Each Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">1</div>
                <h4 className="font-semibold mb-2">Logout Current Session</h4>
                <p className="text-sm text-gray-600">Click "Sign Out" in Expert Dashboard sidebar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">2</div>
                <h4 className="font-semibold mb-2">Login with Different Role</h4>
                <p className="text-sm text-gray-600">Use credentials for desired role (admin/student/expert)</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">3</div>
                <h4 className="font-semibold mb-2">Access Role Dashboard</h4>
                <p className="text-sm text-gray-600">System automatically routes to appropriate dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Options */}
        <div className="text-center mt-12">
          <div className="space-y-4">
            <Link href="/">
              <Button className="mr-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                <Home className="mr-2 h-4 w-4" />
                Return to Current Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">
                Switch User Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}