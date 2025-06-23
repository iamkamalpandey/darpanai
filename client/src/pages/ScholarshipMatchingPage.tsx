import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ScholarshipMatcher } from '@/components/ScholarshipMatcher';

export default function ScholarshipMatchingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scholarship Matching</h1>
            <p className="text-muted-foreground mt-2">
              Find scholarships that match your academic profile and study preferences
            </p>
          </div>
        </div>
        
        <ScholarshipMatcher />
      </div>
    </DashboardLayout>
  );
}