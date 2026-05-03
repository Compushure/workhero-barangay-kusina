'use client';

// Read-only item detail modal with quick transition to edit action.

import { useEffect, useState } from 'react';
import { ImageIcon, X, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { hasItemPassedAvailabilityInterval } from '@/utils/date-utils';
import {
  AvailabilityValue,
  formatAvailabilityLabel,
  formatDateShort,
  formatNumber,
} from './formatters';

interface ViewItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  item: {
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
    isActive: boolean;
    imageUrl?: string;
    availableMonth?: AvailabilityValue;
    availableDate?: string | Date | null;
  } | null;
}

export function ViewItemModal({ open, onOpenChange, onEdit, item }: ViewItemModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item?.imageUrl]);

  if (!item) return null;

  const availabilityInterval =
    item.availableMonth === 'weekly' ||
    item.availableMonth === 'monthly' ||
    item.availableMonth === 'yearly'
      ? item.availableMonth
      : null;

  const isAvailabilityExpired = hasItemPassedAvailabilityInterval(
    item.availableDate,
    availabilityInterval
  );
  const shouldShowHiddenBadge = !item.isActive || isAvailabilityExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-card text-card-foreground border border-accent/25 max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-3xl p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full border border-transparent bg-white/30 p-1 text-muted-foreground shadow-sm/25 transition-all duration-200 hover:bg-accent-secondary/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-h2 text-foreground">Mercado Item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-accent/25 bg-background-soft sm:h-32 sm:w-32">
              {item.imageUrl && !imageError ? (
                <img
                  src={item.imageUrl}
                  alt={`${item.name} preview`}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageError(true)}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.2s' }}
                />
              ) : (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Item Name */}
          <div className="text-center">
            <p className="text-meta font-medium text-muted-foreground mb-1">Item Name</p>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-task-title font-semibold text-foreground break-all px-4 leading-tight">
                {item.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {item.availableDate && (
                  <Badge
                    variant="secondary"
                    className={`rounded-lg text-[11px] font-semibold uppercase tracking-wide ${
                      isAvailabilityExpired
                        ? 'border border-red-300 bg-red-50 text-red-700'
                        : 'border border-accent/25 bg-accent/10 text-accent'
                    }`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Available {formatDateShort(item.availableDate)}
                  </Badge>
                )}
                {shouldShowHiddenBadge && (
                  <Badge
                    variant="secondary"
                    className={`rounded-lg text-[11px] font-semibold uppercase tracking-wide ${
                      isAvailabilityExpired
                        ? 'border border-red-300 bg-red-50 text-red-700'
                        : 'border border-border bg-muted/70 text-muted-foreground'
                    }`}
                  >
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Item Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-2">
            {item.quantity !== undefined && (
              <div className="text-center">
                <p className="text-meta font-medium text-muted-foreground mb-1">
                  Available Quantity
                </p>
                <p className="text-button font-semibold text-foreground">
                  {formatNumber(item.quantity)}
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-meta font-medium text-muted-foreground mb-1">Cost</p>
              <p className="text-button font-semibold text-foreground">
                {formatNumber(item.cost)} {item.cost === 1 ? 'pt' : 'pts'}
              </p>
            </div>

            {item.redeemingLimit !== undefined && (
              <div className="text-center">
                <p className="text-meta font-medium text-muted-foreground mb-1">Redeeming Limit</p>
                <p className="text-button font-semibold text-foreground">
                  {formatNumber(item.redeemingLimit)}
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-meta font-medium text-muted-foreground mb-1">Availability</p>
              <p className="text-button font-semibold text-foreground">
                {formatAvailabilityLabel(item.availableMonth)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 border-t border-accent/20 pt-4 sm:grid-cols-2">
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit();
                  onOpenChange(false);
                }}
                className="control-h order-1 rounded-xl bg-primary-gradient text-button text-white shadow-sm/25 transition-all duration-300 hover:opacity-95 sm:order-1"
              >
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="control-h order-2 rounded-xl border border-gray-300 text-button text-foreground transition-all duration-300 hover:bg-gray-200 hover:text-foreground sm:order-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
