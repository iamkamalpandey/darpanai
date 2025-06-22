import { useParams, useLocation } from 'wouter';
import { ScholarshipFormLayout } from '@/components/admin/ScholarshipFormLayout';

export default function ScholarshipEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  return (
    <ScholarshipFormLayout
      mode="edit"
      scholarshipId={id}
      onSuccess={() => setLocation('/admin/scholarships')}
    />
  );
}