// CRM System Test Page - Test all CRM functionality
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, User, Activity, FileText } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function CRMTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTestResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => [
      ...prev.filter(r => r.test !== test),
      { test, status, message, data }
    ]);
  };

  const runCRMTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Profile API Endpoint
    try {
      const profileResponse = await fetch('/api/user-profile/profile');
      if (profileResponse.status === 404) {
        addTestResult('Profile API', 'success', 'Profile not found (expected for new user)', null);
      } else if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        addTestResult('Profile API', 'success', 'Profile loaded successfully', profileData);
      } else {
        const error = await profileResponse.json();
        addTestResult('Profile API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Profile API', 'error', `Network error: ${error.message}`, null);
    }

    // Test 2: Profile Completion API
    try {
      const completionResponse = await fetch('/api/user-profile/profile/completion');
      if (completionResponse.ok) {
        const completionData = await completionResponse.json();
        addTestResult('Profile Completion API', 'success', `Completion: ${completionData.completionPercentage}%`, completionData);
      } else {
        const error = await completionResponse.json();
        addTestResult('Profile Completion API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Profile Completion API', 'error', `Network error: ${error.message}`, null);
    }

    // Test 3: Activities API
    try {
      const activitiesResponse = await fetch('/api/user-profile/activities');
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        addTestResult('Activities API', 'success', `Found ${activitiesData.length} activities`, activitiesData);
      } else {
        const error = await activitiesResponse.json();
        addTestResult('Activities API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Activities API', 'error', `Network error: ${error.message}`, null);
    }

    // Test 4: Notes API
    try {
      const notesResponse = await fetch('/api/user-profile/notes');
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        addTestResult('Notes API', 'success', `Found ${notesData.length} notes`, notesData);
      } else {
        const error = await notesResponse.json();
        addTestResult('Notes API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Notes API', 'error', `Network error: ${error.message}`, null);
    }

    // Test 5: Leads API
    try {
      const leadsResponse = await fetch('/api/user-profile/leads');
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        addTestResult('Leads API', 'success', `Found ${leadsData.length} leads`, leadsData);
      } else {
        const error = await leadsResponse.json();
        addTestResult('Leads API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Leads API', 'error', `Network error: ${error.message}`, null);
    }

    // Test 6: Leads Stats API
    try {
      const statsResponse = await fetch('/api/user-profile/leads/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        addTestResult('Leads Stats API', 'success', `Stats loaded successfully`, statsData);
      } else {
        const error = await statsResponse.json();
        addTestResult('Leads Stats API', 'error', `Error: ${error.error}`, error);
      }
    } catch (error: any) {
      addTestResult('Leads Stats API', 'error', `Network error: ${error.message}`, null);
    }

    setIsRunning(false);
  };

  const createTestProfile = async () => {
    try {
      const testProfile = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: '1995-01-15',
        gender: 'male',
        city: 'New York',
        country: 'United States',
        currentEducationLevel: 'bachelor',
        fieldOfStudy: 'Computer Science',
        studyLevel: 'master',
        budgetRange: '20k_40k',
        interestedCourse: 'Master of Computer Science'
      };

      const response = await fetch('/api/user-profile/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProfile)
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('Create Profile', 'success', 'Test profile created successfully', data);
        toast({ title: 'Success', description: 'Test profile created' });
        queryClient.invalidateQueries({ queryKey: ['/api/user-profile/profile'] });
      } else {
        const error = await response.json();
        addTestResult('Create Profile', 'error', `Error: ${error.error}`, error);
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error: any) {
      addTestResult('Create Profile', 'error', `Network error: ${error.message}`, null);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const createTestActivity = async () => {
    try {
      const testActivity = {
        activityType: 'consultation',
        activityDescription: 'Initial consultation about study abroad options',
        activityDate: new Date().toISOString(),
        duration: 30,
        outcome: 'Interested in Computer Science programs'
      };

      const response = await fetch('/api/user-profile/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testActivity)
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('Create Activity', 'success', 'Test activity created successfully', data);
        toast({ title: 'Success', description: 'Test activity created' });
        queryClient.invalidateQueries({ queryKey: ['/api/user-profile/activities'] });
      } else {
        const error = await response.json();
        addTestResult('Create Activity', 'error', `Error: ${error.error}`, error);
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error: any) {
      addTestResult('Create Activity', 'error', `Network error: ${error.message}`, null);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const createTestNote = async () => {
    try {
      const testNote = {
        noteType: 'consultation',
        noteTitle: 'Initial Discussion',
        noteContent: 'Student is interested in pursuing a Master\'s in Computer Science. Has strong academic background in undergraduate CS. Needs guidance on university selection and application process.',
        priority: 'normal'
      };

      const response = await fetch('/api/user-profile/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testNote)
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult('Create Note', 'success', 'Test note created successfully', data);
        toast({ title: 'Success', description: 'Test note created' });
        queryClient.invalidateQueries({ queryKey: ['/api/user-profile/notes'] });
      } else {
        const error = await response.json();
        addTestResult('Create Note', 'error', `Error: ${error.error}`, error);
        toast({ title: 'Error', description: error.error, variant: 'destructive' });
      }
    } catch (error: any) {
      addTestResult('Create Note', 'error', `Network error: ${error.message}`, null);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">CRM System Test Suite</h1>
          <p className="text-muted-foreground">
            Test all CRM functionality to ensure proper integration and operation
          </p>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button 
            onClick={runCRMTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            onClick={createTestProfile} 
            variant="outline"
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Create Test Profile
          </Button>
          <Button 
            onClick={createTestActivity} 
            variant="outline"
            className="w-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            Create Test Activity
          </Button>
          <Button 
            onClick={createTestNote} 
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Create Test Note
          </Button>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Real-time results of CRM system functionality tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run All Tests" to begin testing the CRM system functionality.
                  </AlertDescription>
                </Alert>
              ) : (
                testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.status)}
                        <h3 className="font-medium">{result.test}</h3>
                      </div>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    {result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View Response Data
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test and manage user profiles with comprehensive CRM data
              </p>
              <Button asChild className="w-full">
                <a href="/profile">Go to Profile Page</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test lead tracking, filtering, and management features
              </p>
              <Button asChild className="w-full">
                <a href="/leads-management">Go to Leads Management</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}