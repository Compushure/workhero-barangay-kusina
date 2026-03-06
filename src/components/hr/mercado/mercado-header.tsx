'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-base text-muted-foreground mt-1">{description}</p>
      </div>
      {showAddButton && onAddClick && (
        <Button
          onClick={onAddClick}
          className="h-11 px-6 rounded-xl bg-primary-gradient text-zinc-50 hover:opacity-95 font-semibold text-base"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </Button>
      )}
    </div>
  );
}
