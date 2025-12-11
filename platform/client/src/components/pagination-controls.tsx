import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number; // 0-indexed
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Standardized pagination controls component
 * 
 * Use this for all paginated lists app-wide.
 * Provides Previous/Next buttons and page indicator.
 * 
 * @example
 * <PaginationControls
 *   currentPage={page}
 *   totalItems={total}
 *   itemsPerPage={limit}
 *   onPageChange={setPage}
 * />
 */
export function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageOneIndexed = currentPage + 1; // Display as 1-indexed

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPageOneIndexed < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav
      className={`flex justify-center items-center gap-4 ${className}`}
      aria-label="Pagination"
      data-testid="pagination-controls"
    >
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentPage === 0}
        aria-label="Go to previous page"
        data-testid="button-pagination-previous"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      <span
        className="text-sm text-muted-foreground"
        aria-current="page"
        data-testid="pagination-info"
      >
        Page {currentPageOneIndexed} of {totalPages}
        {totalItems > 0 && (
          <span className="ml-2">
            ({totalItems} {totalItems === 1 ? "item" : "items"})
          </span>
        )}
      </span>

      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPageOneIndexed >= totalPages}
        aria-label="Go to next page"
        data-testid="button-pagination-next"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </nav>
  );
}
