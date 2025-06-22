import { useParams } from 'wouter';
import { ScholarshipEditor } from '@/components/admin/ScholarshipEditor';

export default function ScholarshipEdit() {
  const { id } = useParams();

  return (
    <ScholarshipEditor
      scholarshipId={id || ''}
      mode="edit"
    />
  );
}