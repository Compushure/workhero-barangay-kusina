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

  // Always show first 4 pages
  const firstPages = Math.min(4, totalPages);
  for (let i = 1; i <= firstPages; i++) {
    pages.push(i);
  }

  // Show ellipsis if there are more pages beyond first 4
  if (totalPages > 8) {
    // If current page is not in first 4 or last 4, show ellipsis and current page
    if (currentPage > 4 && currentPage <= totalPages - 4) {
      pages.push('...');
      pages.push(currentPage);
      pages.push('...');
    } else if (currentPage > 4) {
      // Current page is beyond first 4, show ellipsis after first 4
      pages.push('...');
    }
  }

  // Always show last 4 pages (or fewer if total pages is less)
  const lastPages = Math.min(4, totalPages - firstPages);
  if (lastPages > 0) {
    // Add ellipsis if needed
    if (totalPages > 8 && currentPage <= totalPages - 4) {
      pages.push('...');
    }
    // Add last 4 pages
    for (let i = totalPages - lastPages + 1; i <= totalPages; i++) {
      pages.push(i);
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
