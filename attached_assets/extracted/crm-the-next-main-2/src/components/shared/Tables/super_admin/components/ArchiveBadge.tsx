export const ArchiveBadge = ({ isArchived }: { isArchived: boolean }) => {
  return isArchived ? (
    <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Archived
    </div>
  ) : (
    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Active
    </div>
  );
};
