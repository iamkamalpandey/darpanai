import { useLocation } from "wouter";
import { ScholarshipFormLayout } from "@/components/admin/ScholarshipFormLayout";

export default function ScholarshipCreate() {
  const [, setLocation] = useLocation();

  return (
    <ScholarshipFormLayout
      mode="create"
      onSuccess={() => setLocation('/admin/scholarships')}
    />
  );
}