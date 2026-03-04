'use client';

import { useEffect, useState } from 'react';
import { ImageIcon, X, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isItemAvailableNow } from '@/utils/date-utils';
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

  // Check if item is scheduled for future
  const isScheduled = item.availableDate && !isItemAvailableNow(item.availableDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-muted text-card-foreground border border-border max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50"
        >
          <X className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-primary">
            Mercado Item
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="h-28 w-28 sm:h-32 sm:w-32 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
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
            <p className="text-sm font-medium text-muted-foreground mb-1">Item Name</p>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-xl font-bold text-black break-all px-4 leading-tight">
                {item.name}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {isScheduled && (
                  <Badge variant="secondary" className="bg-primary/15 text-primary text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Available {formatDateShort(item.availableDate)}
                  </Badge>
                )}
                {!item.isActive && (
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 text-xs">
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
                <p className="text-xs font-medium text-muted-foreground mb-1">Available Quantity</p>
                <p className="text-base font-semibold text-title">{formatNumber(item.quantity)}</p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">Cost</p>
              <p className="text-base font-semibold text-title">
                {formatNumber(item.cost)} {item.cost === 1 ? 'pt' : 'pts'}
              </p>
            </div>

            {item.redeemingLimit !== undefined && (
              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">Redeeming Limit</p>
                <p className="text-base font-semibold text-title">
                  {formatNumber(item.redeemingLimit)}
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">Availability</p>
              <p className="text-base font-semibold text-title">
                {formatAvailabilityLabel(item.availableMonth)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border mt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 sm:h-11 rounded-xl border-border text-foreground hover:bg-accent-secondary/25 font-semibold text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit();
                  onOpenChange(false);
                }}
                className="h-10 sm:h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base order-1 sm:order-2"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
