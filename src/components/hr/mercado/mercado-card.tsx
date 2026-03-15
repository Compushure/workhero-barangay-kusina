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
import { isItemAvailableNow } from '@/utils/date-utils';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    if (isMenuOpen || hideDialogOpen) {
      return;
    }
    onClick?.(item.id);
  }, [onClick, item.id, isMenuOpen, hideDialogOpen]);

  const availableDateText = useMemo(() => {
    if (!item.availableDate) return null;
    return formatDateShort(item.availableDate, '');
  }, [item.availableDate]);

  return (
    <div
      className="relative flex min-h-32 items-start gap-4 rounded-2xl border border-accent/15 bg-card px-3.5 py-3 shadow-sm/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-background-soft/80 text-accent">
        {item.imageUrl && !imageError ? (
          <img
            src={item.imageUrl}
            alt={`${item.name} icon`}
            className="h-full w-full rounded-xl object-cover"
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

      <div className="flex-1 min-w-0 pr-10 flex flex-col gap-1">
        <h3 className="text-task-title font-semibold text-foreground truncate">{item.name}</h3>

        <div className="flex min-h-5 flex-wrap items-center gap-1.5">
          {availableDateText && (
            <Badge
              variant="secondary"
              className="shrink-0 rounded-lg border border-accent/30 bg-accent-secondary/20 px-1.5 text-[10px] font-medium uppercase tracking-wide text-accent"
            >
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              {availableDateText}
            </Badge>
          )}
          {isHidden && (
            <Badge
              variant="secondary"
              className="shrink-0 rounded-lg border border-border bg-muted/60 px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              Hidden
            </Badge>
          )}
        </div>

        <div className="flex min-h-5 flex-wrap items-center gap-2">
          <p className="text-button font-semibold text-primary">{formattedPrice} pts</p>
          {isOutOfStock ? (
            <Badge
              variant="destructive"
              className="shrink-0 rounded-lg border border-destructive/40 bg-destructive/90 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-white"
            >
              Out of stock
            </Badge>
          ) : (
            formattedQuantity !== undefined && (
              <p className="text-meta text-muted-foreground">| Available: {formattedQuantity}</p>
            )
          )}
        </div>

        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="control-h size-8 rounded-xl border border-accent/80 bg-primary-gradient text-card shadow-sm/25 transition-all duration-200 hover:scale-105"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="manager-dropdown-content w-36 rounded-xl">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setHideDialogOpen(true);
                }}
              >
                {isHidden ? (
                  <Eye className="mr-2 h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="mr-2 h-4 w-4 text-primary" />
                )}
                {isHidden ? 'Unhide' : 'Hide'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(item.id);
                }}
              >
                <Pencil className="mr-2 h-4 w-4 text-primary" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(item.id);
                }}
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
    </div>
  );
});
