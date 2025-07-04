import ChecklistItem from "./ChecklistItem";

export default function Checklist({
  checklists,
  onComplete,
}: {
  checklists: any;
  onComplete: any;
}) {
  return (
    <div className="space-y-4">
      {checklists.map((item: any) => (
        <ChecklistItem key={item.id} item={item} onComplete={onComplete} />
      ))}
    </div>
  );
}
