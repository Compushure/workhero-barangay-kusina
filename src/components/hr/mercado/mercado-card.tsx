'use client';

import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { Pencil, ImageIcon, EyeOff, Eye, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HideRewardDialog } from './hide-items';
import { AvailabilityInterval, formatDateShort, formatNumber } from './formatters';

interface MercadoItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  isActive?: boolean;
  imageUrl?: string;
  createdAt?: string;
  availableMonth?: AvailabilityInterval | null;
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
  const isHidden = item.isActive === false;
  const isOutOfStock = item.quantity !== undefined && item.quantity === 0;

  const handleHideConfirm = useCallback(() => {
    if (isHidden) {
      onUnhide?.(item.id);
    } else {
      onHide?.(item.id);
    }
  }, [isHidden, item.id, onHide, onUnhide]);

  const handleCardClick = useCallback(() => {
    onClick?.(item.id);
  }, [onClick, item.id]);

  const availableDateText = useMemo(() => {
    if (!item.availableDate) return null;
    return formatDateShort(item.availableDate, '');
  }, [item.availableDate]);

  return (
    <>
      <div
        className="bg-background border border-border rounded-xl p-3.5 flex items-center gap-3.5 relative shadow-sm hover:shadow-md transition-all h-32 cursor-pointer hover:border-accent/50 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
        <div className="h-20 w-20 bg-background border border-accent/20 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
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
            <ImageIcon className="h-6 w-6 text-primary/40" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-10 grid grid-rows-[24px_24px_24px] items-center gap-0.5">
          <h3 className="text-lg font-semibold text-primary truncate leading-tight">{item.name}</h3>

          <div className="flex h-6 items-center gap-1.5 overflow-hidden">
            {availableDateText && (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-lg border border-accent/30 bg-accent-secondary/25 px-2 text-primary hover:bg-accent-secondary/25 text-[11px]"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {availableDateText}
              </Badge>
            )}
            {isHidden && (
              <Badge
                variant="secondary"
                className="shrink-0 rounded-lg border border-gray-300 bg-gray-200 px-2 text-gray-700 hover:bg-gray-200 text-[11px]"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hidden
              </Badge>
            )}
          </div>

          <div className="flex h-6 items-center gap-2.5">
            <p className="text-primary font-semibold text-sm">{formattedPrice} pts</p>
            {isOutOfStock ? (
              <Badge
                variant="destructive"
                className="shrink-0 rounded-lg border border-destructive/80 bg-destructive px-2 text-white hover:bg-destructive text-[11px]"
              >
                Out of stock
              </Badge>
            ) : (
              formattedQuantity !== undefined && (
                <p className="text-muted-foreground text-sm truncate px-1">
                  | Available: {formattedQuantity}
                </p>
              )
            )}
          </div>
        </div>

        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-accent text-card border border-accent/80 shadow-md hover:bg-primary-gradient hover:text-card hover:scale-105 transition-all duration-200"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl">
              <DropdownMenuItem onClick={() => setHideDialogOpen(true)}>
                {isHidden ? (
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="mr-2 h-4 w-4 text-primary" />
                )}
                {isHidden ? 'Unhide' : 'Hide'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(item.id)}>
                <Pencil className="mr-2 h-4 w-4 text-primary" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(item.id)}
                className="text-red-600 font-semibold"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
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
        isHidden={isHidden}
      />
    </>
  );
});
