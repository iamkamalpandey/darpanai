import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => any;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPrevious,
  onNext,
  onPageChange,
  onPageSizeChange,
}) => {
  const ellipsis = -1;
  let pageNumbers: number[] = [];

  if (totalPages <= 7) {
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    const startPages = [1, 2];
    const endPages = [totalPages - 1, totalPages];

    let middlePages: number[];
    if (currentPage < 5) {
      middlePages = [3, 4, 5];
    } else if (currentPage > totalPages - 4) {
      // If the current page is among the last four, show the pages just before it
      middlePages = [totalPages - 4, totalPages - 3, totalPages - 2];
    } else {
      // Show two pages on either side of the current page
      middlePages = [currentPage - 1, currentPage, currentPage + 1];
    }

    pageNumbers = [
      ...startPages,
      ellipsis,
      ...middlePages,
      ellipsis,
      ...endPages,
    ];
  }

  return (
    <div className="flex justify-between items-center">
      <div>
        <span className="text-sm text-gray-700">
          Showing {pageSize * (currentPage - 1) + 1} to{" "}
          {Math.min(pageSize * currentPage, totalItems)} of {totalItems} results
        </span>
      </div>
      <div className="flex gap-2">
        <select
          value={pageSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newSize = parseInt(e.target.value, 10);
            if (!isNaN(newSize)) {
              onPageSizeChange(newSize);
            } else {
              console.error("Invalid page size selected:", e.target.value);
            }
          }}
          className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>

        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <button
            onClick={onPrevious}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          {pageNumbers.map((page) =>
            page === ellipsis ? (
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "text-gray-900 bg-white"
                } ring-1 ring-inset ring-gray-300`}
              >
                {page}
              </button>
            )
          )}
          <button
            onClick={onNext}
            disabled={currentPage >= totalPages}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
