import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { useLocation } from "wouter";
import EnhancedScholarshipForm from "@/components/admin/EnhancedScholarshipForm";

// Type for the enhanced scholarship form
type ScholarshipFormData = {
  scholarshipId: string;
  scholarshipName: string;
  providerName: string;
  providerType: "government" | "private" | "institution" | "other";
  providerCountry: string;
  description: string;
  shortDescription: string;
  applicationUrl: string;
  applicationDeadline: string;
  studyLevel: string;
  fieldCategory: string;
  targetCountries: string[];
  fundingType: "full" | "partial" | "tuition-only" | "living-allowance" | "other";
  fundingAmount: number;
  fundingCurrency: string;
  eligibilityRequirements: string[];
  languageRequirements: string[];
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  dataSource: string;
  verified: boolean;
  status: "active" | "inactive" | "pending";
};

export default function ScholarshipCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: ScholarshipFormData) => {
      // Transform the form data to match the API schema
      const apiData = {
        scholarshipId: data.scholarshipId,
        name: data.scholarshipName,
        shortName: data.shortDescription?.substring(0, 50) || "", // Truncate for short name
        providerName: data.providerName,
        providerType: data.providerType,
        providerCountry: data.providerCountry,
        hostCountries: data.targetCountries,
        eligibleCountries: data.targetCountries,
        studyLevels: [data.studyLevel],
        fieldCategories: [data.fieldCategory],
        specificFields: [],
        description: data.description,
        applicationUrl: data.applicationUrl,
        fundingType: data.fundingType,
        fundingCurrency: data.fundingCurrency,
        totalValueMin: data.fundingAmount,
        totalValueMax: data.fundingAmount,
        applicationDeadline: data.applicationDeadline,
        degreeRequired: data.eligibilityRequirements,
        languageRequirements: data.languageRequirements,
        difficultyLevel: data.difficultyLevel,
        dataSource: data.dataSource,
        verified: data.verified,
        status: data.status,
        // Additional required fields with defaults
        renewable: false,
        interviewRequired: false,
        essayRequired: false,
        feeWaiverAvailable: false,
        applicationFeeAmount: 0,
        applicationFeeCurrency: data.fundingCurrency,
        genderRequirement: "any",
        leadershipRequired: false,
        documentsRequired: data.eligibilityRequirements
      };

      return apiRequest("POST", "/api/admin/scholarships", apiData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Scholarship created successfully with enhanced validation standards",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scholarships"] });
      setLocation("/admin/scholarships");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create scholarship. Please check all required fields.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ScholarshipFormData) => {
    createMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Admin</span>
            <span>/</span>
            <span>Scholarships</span>
            <span>/</span>
            <span>Create</span>
          </div>
          <h1 className="text-2xl font-bold">Create New Scholarship</h1>
          <p className="text-muted-foreground">
            Add a new scholarship to the database with comprehensive validation and Google Material Design standards
          </p>
        </div>

        <EnhancedScholarshipForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}