'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ totalPages, currentPage, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          onClick={() => onPageChange(page)}
          className="px-3 py-1"
        >
          {page}
        </Button>
      ))}
    </div>
  );
}
