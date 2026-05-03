'use client';

// HR item card with quick actions: view, hide/unhide, edit, and delete.

import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { Pencil, ImageIcon, EyeOff, Eye, Calendar, Trash2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HideRewardDialog } from './hide-items';
import { hasItemPassedAvailabilityInterval } from '@/utils/date-utils';
import {
  AvailabilityInterval,
  formatDateShort,
  formatDateTimeShort,
  formatNumber,
} from './formatters';

interface MercadoItem {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  isActive?: boolean;
  imageUrl?: string;
  createdAt?: string | Date;
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
  // Local UI states for dialogs/menu and image fallback.
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
  const isAvailabilityExpired = hasItemPassedAvailabilityInterval(
    item.availableDate,
    item.availableMonth
  );

  const handleHideConfirm = useCallback(() => {
    // Routes confirmation to hide or unhide callback based on current state.
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
  const createdAtText = useMemo(() => formatDateTimeShort(item.createdAt, ''), [item.createdAt]);

  return (
    <div
      className="relative flex min-h-[7.5rem] cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-all hover:scale-[1.01] hover:border-accent/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
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
      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-accent/20 bg-background">
        {/* Item preview image with icon fallback. */}
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

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 pr-10">
        {/* Main item metadata block shown on card. */}
        <h3 className="text-base sm:text-lg font-semibold text-primary truncate leading-tight">
          {item.name}
        </h3>

        <div className="flex min-h-5 items-center gap-1.5 flex-wrap">
          {availableDateText && (
            <Badge
              variant="secondary"
              className={`shrink-0 rounded-lg px-1.5 text-[10px] leading-tight sm:px-2 sm:text-[11px] ${
                isAvailabilityExpired
                  ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-50'
                  : 'border border-accent/30 bg-accent-secondary/25 text-primary hover:bg-accent-secondary/25'
              }`}
            >
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              {availableDateText}
            </Badge>
          )}
          {(isHidden || isAvailabilityExpired) && (
            <Badge
              variant="secondary"
              className={`shrink-0 rounded-lg px-1.5 text-[10px] leading-tight sm:px-2 sm:text-[11px] ${
                isAvailabilityExpired
                  ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-50'
                  : 'border border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              Hidden
            </Badge>
          )}
        </div>

        <div className="flex min-h-5 items-center gap-2 flex-wrap">
          <p className="flex items-center gap-1 text-primary font-semibold text-sm">
            <Coins className="h-3.5 w-3.5" />
            {formattedPrice} pts
          </p>
          {isOutOfStock ? (
            <Badge
              variant="destructive"
              className="shrink-0 rounded-lg border border-destructive/80 bg-destructive px-1.5 sm:px-2 text-white hover:bg-destructive text-[10px] sm:text-[11px] leading-tight"
            >
              Out of stock
            </Badge>
          ) : (
            formattedQuantity !== undefined && (
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                | Available: {formattedQuantity}
              </p>
            )
          )}
        </div>

        {createdAtText && (
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            Created at: {createdAtText}
          </p>
        )}

        <div className="absolute right-3.5 top-3.5 z-10" onClick={(e) => e.stopPropagation()}>
          {/* Context menu for HR management actions. */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer border border-accent/80 bg-accent text-card shadow-md transition-all duration-200 hover:scale-105 hover:bg-primary-gradient hover:text-card"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="manager-dropdown-content w-32 rounded-xl p-1"
            >
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  setHideDialogOpen(true);
                }}
                className="cursor-pointer transition-all duration-500 ease-in-out hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground"
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
                className="cursor-pointer transition-all duration-500 ease-in-out hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground"
              >
                <Pencil className="mr-2 h-4 w-4 text-primary" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(item.id);
                }}
                className="cursor-pointer font-semibold text-red-600 transition-all duration-500 ease-in-out hover:bg-accent/15 hover:text-red-600 data-[highlighted]:bg-accent/15 data-[highlighted]:text-red-600"
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
