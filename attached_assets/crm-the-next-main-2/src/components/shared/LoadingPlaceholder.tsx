import { Skeleton } from "../ui/skeleton";

export const loadingPlaceholder = (
  <tr>
    <td className="px-6 py-4">
      <Skeleton className="h-8" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
    <td className="px-3 py-4">
      <Skeleton className="h-8 w-24 mx-auto" />
    </td>
  </tr>
);
