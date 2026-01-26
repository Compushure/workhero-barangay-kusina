'use client';

import { useState } from 'react';
import { MoreHorizontal, ImageIcon, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HideRewardDialog } from './hide-items';

interface MercadoItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  isActive?: boolean;
  imageUrl?: string;
}

interface MercadoCardProps {
  item: MercadoItem;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onHide?: (id: string) => void;
  onUnhide?: (id: string) => void;
}

// Format number with comma separators
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function MercadoCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onHide,
  onUnhide,
}: MercadoCardProps) {
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleHideConfirm = () => {
    if (item.isActive === false) {
      onUnhide?.(item.id);
    } else {
      onHide?.(item.id);
    }
  };

  const handleCardClick = () => {
    onClick?.(item.id);
  };

  return (
    <>
      <div
        className="bg-card border border-border rounded-xl p-4 flex items-center relative shadow-sm hover:shadow-md transition-all h-32 cursor-pointer hover:border-[#730202]/20 hover:scale-[1.02]"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="h-24 w-24 bg-[#f2e1c9] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={`${item.name} icon`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-[#730202]/40" />
          )}
        </div>

        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-[#730202] truncate">{item.name}</h3>
            {item.isActive === false && (
              <Badge
                variant="secondary"
                className="bg-gray-200 text-gray-700 hover:bg-gray-200 text-xs"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#730202] font-medium italic opacity-80 text-base">
              {formatNumber(item.price)} pts
            </p>
            {item.quantity !== undefined && (
              <p className="text-[#730202] text-sm opacity-70">
                | Available: {formatNumber(item.quantity)}
              </p>
            )}
          </div>
        </div>

        <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#f2e1c9]">
                <MoreHorizontal className="h-5 w-5 text-[#730202]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl">
              <DropdownMenuItem onClick={() => setHideDialogOpen(true)}>
                {item.isActive === false ? 'Unhide' : 'Hide'}
              </DropdownMenuItem>
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

      <HideRewardDialog
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
        onConfirm={handleHideConfirm}
        isHidden={item.isActive === false}
      />
    </>
  );
}
