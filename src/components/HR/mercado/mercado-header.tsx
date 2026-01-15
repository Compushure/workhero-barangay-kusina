import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MercadoHeaderProps {
  title: string;
  description: string;
  onAddClick: () => void;
}

export function MercadoHeader({ title, description, onAddClick }: MercadoHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold text-[#730202] tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <Button 
        onClick={onAddClick}
        className="bg-[#730202] hover:bg-[#5a0202] text-white px-6 py-6 rounded-xl text-lg shadow-lg"
      >
        <Plus className="mr-2 h-5 w-5" /> Add Item
      </Button>
    </header>
  );
}