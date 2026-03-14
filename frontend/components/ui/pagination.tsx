"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center gap-2 justify-center mt-8">
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="text-text-muted px-1">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            className={`px-3 py-2 border rounded-md text-sm cursor-pointer transition-colors ${
              currentPage === page
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-slate-800 border-border hover:bg-surface"
            }`}
          >
            {page}
          </button>
        )
      )}
    </div>
  );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
    pages.push(page);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
