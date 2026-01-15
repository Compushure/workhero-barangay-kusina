import { MoreHorizontal, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MercadoItem {
  id: string;
  name: string;
  price: number;
}

interface MercadoCardProps {
  item: MercadoItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MercadoCard({ item, onEdit, onDelete }: MercadoCardProps) {
  return (
    <div className="bg-[#fdf8f0] border border-[#e5e0d8] rounded-xl p-4 flex items-center relative shadow-sm hover:shadow-md transition-shadow">
      <div className="h-24 w-24 bg-[#f2e1c9] rounded-lg flex items-center justify-center shrink-0">
        <ImageIcon className="h-8 w-8 text-[#730202]/40" />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="text-xl font-bold text-[#730202]">{item.name}</h3>
        <p className="text-[#730202] font-medium italic opacity-80">{item.price} pts</p>
      </div>

      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#f2e1c9]">
              <MoreHorizontal className="h-5 w-5 text-[#730202]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 rounded-xl">
            <DropdownMenuItem>Hide</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(item.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(item.id)}
              className="text-red-600 font-semibold"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}