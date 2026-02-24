'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MercadoHeaderProps {
  title: string;
  description: string;
  onAddClick: () => void;
}

export function MercadoHeader({ title, description, onAddClick }: MercadoHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#730202]">{title}</h1>
        <p className="text-base text-[#730202]/70 mt-1">{description}</p>
      </div>
      <Button
        onClick={onAddClick}
        className="h-11 px-6 rounded-xl bg-[#730202] hover:bg-[#730202]/90 text-white font-semibold text-base"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Item
      </Button>
    </div>
  );
}
