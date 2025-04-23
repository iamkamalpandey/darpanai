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
      </div>
    </DashboardLayout>
  );
}