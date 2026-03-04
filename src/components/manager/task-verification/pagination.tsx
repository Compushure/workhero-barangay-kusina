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
    <div className="flex justify-center items-center gap-2 my-6 scale-115">
      {/* Left arrow */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className='bg-card hover:bg-accent/75 hover:text-card not-disabled:shadow-sm/15 border border-accent/50'
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
            className={`transition-all ease-in-out shadow-sm/15 border border-accent/50
              ${page === currentPage ? 'bg-accent/75 text-card' : 'bg-card hover:bg-accent/25 hover:scale-110 hover:shadow-xs/25'}`}
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
        className='bg-card hover:bg-accent/75 hover:text-card not-disabled:shadow-sm/15 border border-accent/50'
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

export const Pagination = memo(PaginationComponent);
