import { ChevronLeft, ChevronRight } from '@/components/ui/BrandIcons';


export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Max pages to show on mobile
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-2 flex justify-center items-center gap-1">
      {/* Previous button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-500">...</span>
        ) : (
          <button
            key={page}
            type="button"
            className={`px-2 py-1 text-xs rounded min-w-[28px] ${
              page === currentPage
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}

      {/* Next button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
