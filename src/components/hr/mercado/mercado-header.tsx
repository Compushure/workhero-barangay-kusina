'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MercadoHeaderProps {
  title: string;
  description: string;
<<<<<<< HEAD
  onAddClick: () => void;
}

export function MercadoHeader({ title, description, onAddClick }: MercadoHeaderProps) {
=======
  onAddClick?: () => void;
  showAddButton?: boolean;
}

export function MercadoHeader({
  title,
  description,
  onAddClick,
  showAddButton = true,
}: MercadoHeaderProps) {
>>>>>>> 1ce3388278cd229ea5425fd874bcadc522b07990
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-base text-muted-foreground mt-1">{description}</p>
      </div>
<<<<<<< HEAD
      <Button
        onClick={onAddClick}
        className="h-11 px-6 rounded-xl bg-[#730202] hover:bg-[#730202]/90 text-white font-semibold text-base"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Item
      </Button>
=======
      {showAddButton && onAddClick && (
        <Button
          onClick={onAddClick}
          className="h-11 px-6 rounded-xl bg-primary-gradient text-zinc-50 hover:opacity-95 font-semibold text-base"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Item
        </Button>
      )}
>>>>>>> 1ce3388278cd229ea5425fd874bcadc522b07990
    </div>
  );
}
