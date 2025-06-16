import { Link } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import AnalysisHistory from "@/components/AnalysisHistory";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";

export default function AnalysisHistoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your past visa rejection analyses
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/analyzer">
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>New Analysis</span>
              </Button>
            </Link>
            <ConsultationForm 
              buttonVariant="outline" 
              buttonText="Book Consultation" 
              subject="Visa Rejection Analysis Follow-up"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex flex-col p-6">
            <AnalysisHistory />
          </div>
        </div>

        {/* Strategic CTA for Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">
              Ready to Take Action on Your Analysis?
            </h3>
            <p className="text-blue-700 mb-4 max-w-2xl mx-auto">
              Transform your rejection analysis into a winning application strategy. Our visa experts help you address every identified weakness with proven solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ConsultationForm 
                buttonSize="lg"
                buttonText="Get Expert Strategy Session"
                subject="Transform Analysis Into Success Plan"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
              <Link href="/document-templates">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Document Templates
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-600 mt-3">
              Personalized action plan • Document guidance • 85% approval improvement rate
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}