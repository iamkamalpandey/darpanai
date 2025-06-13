import { Link } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Upload, FileText, ListChecks, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="rounded-lg bg-white p-6 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {user?.fullName || "User"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Upload your visa rejection letter and get personalized recommendations
              </p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0">
              <Link href="/analyzer">
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Letter</span>
                </Button>
              </Link>
              <ConsultationForm buttonVariant="outline" buttonText="Book Consultation" />
            </div>
          </div>
        </div>



        {/* Explanation */}
        <div className="text-center max-w-3xl mx-auto my-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Understand Your Visa Rejection
          </h2>
          <p className="text-muted-foreground text-lg">
            Upload your visa rejection letter and receive AI-powered insights and
            recommendations to improve your next application.
          </p>
        </div>

        {/* How It Works */}
        <div>
          <h3 className="text-xl font-semibold mb-6">How It Works</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">Upload Your Document</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Upload your visa rejection letter in PDF, JPG, or PNG format.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">AI Analysis</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our AI analyzes your document to identify specific reasons for rejection.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <ListChecks className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium">Get Recommendations</h4>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Receive personalized recommendations and next steps for your next application.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Why Use Our Visa Rejection Analyzer</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-muted-foreground">Understand the exact reasons for your visa rejection</p>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-muted-foreground">Get personalized recommendations to improve your next application</p>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-muted-foreground">Secure and confidential processing of your documents</p>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-muted-foreground">Powered by advanced AI technology for accurate analysis</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-lg bg-primary/10 p-6 text-center">
          <h3 className="text-xl font-semibold mb-3">Need Expert Assistance?</h3>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Book a consultation with our visa experts to get personalized guidance on your application
          </p>
          <ConsultationForm buttonSize="lg" />
        </div>
      </div>
    </DashboardLayout>
  );
}
