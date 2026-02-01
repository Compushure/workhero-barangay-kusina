'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function PaginationComponent({ totalPages, currentPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Ellipsis before current if not near start
  if (currentPage > 2) {
    pages.push('...');
  }

  // Current page (if not first or last)
  if (currentPage !== 1 && currentPage !== totalPages) {
    pages.push(currentPage);
  }

  // Ellipsis after current if not near end
  if (currentPage < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 my-6 scale-115">
      {/* Left arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className='hover:bg-[#690003] hover:text-zinc-50 not-disabled:shadow-sm/15'
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`hover:bg-[#690003] hover:text-zinc-50 transition-all ease-in-out shadow-sm/15
              ${page === currentPage ? 'bg-[#690003] text-zinc-50' : 'hover:scale-110 hover:shadow-xs/25'}`}
          >
            {page}
          </Button>
        )
      )}

      {/* Right arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className='hover:bg-[#690003] hover:text-zinc-50 not-disabled:shadow-sm/15'
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export const Pagination = memo(PaginationComponent);
