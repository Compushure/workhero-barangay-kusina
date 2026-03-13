'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isFixed?: boolean;
}

function PaginationComponent({
  totalPages,
  currentPage,
  onPageChange,
  isFixed = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  if (totalPages <= 8) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const firstBlockEnd = 4;
    const lastBlockStart = totalPages - 3;

    for (let i = 1; i <= firstBlockEnd; i++) {
      pages.push(i);
    }

    if (currentPage > firstBlockEnd + 1 && currentPage < lastBlockStart - 1) {
      pages.push('...');
      pages.push(currentPage);
      pages.push('...');
    } else {
      pages.push('...');
    }

    for (let i = lastBlockStart; i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
  }

  return (
    <div
      className={`flex items-center justify-center gap-1 sm:gap-1.5 scale-90 sm:scale-100 lg:scale-105 xl:scale-110 2xl:scale-125 ${
        isFixed ? 'sm:fixed bottom-6 lg:bottom-8 left-1/2 z-40 sm:-translate-x-1/2' : ''
      }`}
    >
      {/* Left arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="bg-white text-foreground hover:bg-accent-secondary hover:text-white not-disabled:shadow-sm/15 border border-accent/50 transition-all duration-400 ease-in-out h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronLeft size={14} />
      </Button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-xs">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`transition-all ease-in-out shadow-sm/15 border border-accent/50 h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs
              ${page === currentPage ? 'bg-accent-secondary text-white hover:bg-accent-secondary hover:text-white' : 'bg-white text-foreground hover:bg-accent-secondary/80 hover:text-white hover:scale-110 hover:shadow-xs/25'}`}
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
        className="bg-white text-foreground hover:bg-accent-secondary hover:text-white not-disabled:shadow-sm/15 border border-accent/50 transition-all duration-400 ease-in-out h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );
}

export const Pagination = memo(PaginationComponent);
