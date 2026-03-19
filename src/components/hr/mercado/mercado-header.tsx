'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';

interface MercadoHeaderProps {
  title: string;
  description: string;
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export function MercadoHeader({
  title,
  description,
  onAddClick,
  showAddButton = true,
}: MercadoHeaderProps) {
  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader title={title} subtitle={description} />
      {showAddButton && onAddClick && (
        <Button
          onClick={onAddClick}
          className="control-h text-button inline-flex items-center gap-2 rounded-xl bg-primary-gradient px-4 text-zinc-50 shadow-sm/25 transition-all duration-300 hover:opacity-95 sm:px-6"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      )}
    </section>
  );
}
