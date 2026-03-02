'use client';

import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { Pencil, ImageIcon, EyeOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HideRewardDialog } from './hide-items';
import { isItemAvailableNow } from '@/utils/date-utils';

interface MercadoItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  isActive?: boolean;
  imageUrl?: string;
  availableMonth?: number;
  availableDate?: string | Date | null;
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

function formatAvailableMonth(month: number | undefined): string {
  if (!month || month < 1 || month > 12) return 'All Months';

  return new Date(2026, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
  });
}

export const MercadoCard = memo(function MercadoCard({
  item,
  onClick,
  onEdit,
  onDelete,
  onHide,
  onUnhide,
}: MercadoCardProps) {
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.imageUrl]);

  // Memoize formatted price
  const formattedPrice = useMemo(() => formatNumber(item.price), [item.price]);
  const formattedQuantity = useMemo(
    () => (item.quantity !== undefined ? formatNumber(item.quantity) : undefined),
    [item.quantity]
  );

  const handleHideConfirm = useCallback(() => {
    if (item.isActive === false) {
      onUnhide?.(item.id);
    } else {
      onHide?.(item.id);
    }
  }, [item.isActive, item.id, onHide, onUnhide]);

  const handleCardClick = useCallback(() => {
    onClick?.(item.id);
  }, [onClick, item.id]);

  // Check if item is scheduled for future availability
  const isScheduled = useMemo(() => {
    return item.availableDate && !isItemAvailableNow(item.availableDate);
  }, [item.availableDate]);

  const availableDateText = useMemo(() => {
    if (!item.availableDate) return null;
    try {
      const date = new Date(item.availableDate);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  }, [item.availableDate]);

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
              decoding="async"
              onError={() => setImageError(true)}
              onLoad={(e) => {
                // Mark image as loaded to prevent layout shift
                e.currentTarget.style.opacity = '1';
              }}
              style={{ opacity: 0, transition: 'opacity 0.2s' }}
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-[#730202]/40" />
          )}
        </div>

        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl font-bold text-[#730202] truncate">{item.name}</h3>
            {isScheduled && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {availableDateText}
              </Badge>
            )}
            {item.isActive === false && (
              <Badge
                variant="secondary"
                className="bg-gray-200 text-gray-700 hover:bg-gray-200 text-xs"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
              </Badge>
            )}
            {item.quantity !== undefined && item.quantity === 0 && (
              <Badge
                variant="destructive"
                className="bg-red-600 text-white hover:bg-red-600 text-xs"
              >
                Out of Stock
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <p className="text-[#730202] font-medium italic opacity-80 text-base">
              {formattedPrice} {item.price === 1 ? 'pt' : 'pts'}
            </p>
            {formattedQuantity !== undefined && (
              <p
                className={`text-[#730202] text-sm ${item.quantity === 0 ? 'opacity-50 line-through' : 'opacity-70'}`}
              >
                | Available: {formattedQuantity}
              </p>
            )}
          </div>
          <p className="text-[#730202]/50 text-xs mt-1">
            Available Month: {formatAvailableMonth(item.availableMonth)}
          </p>
        </div>

        <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white shadow-md hover:bg-[#690003] hover:text-white transition-all duration-200"
              >
                <Pencil className="h-5 w-5" />
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
});
