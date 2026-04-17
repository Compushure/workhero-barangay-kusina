'use client';

// HR form modal for creating and editing Mercado items.

import { useState, useEffect, useMemo } from 'react';
import {
  Pencil,
  Plus,
  X,
  Loader2,
  Camera,
  Calendar as CalendarIcon,
  ChevronDown,
} from 'lucide-react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type AvailabilityInterval = 'weekly' | 'monthly' | 'yearly';

const MAX_REWARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_REWARD_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SAVE_LOADING_CAP_MS = 3000;
const mercadoSelectItemClassName =
  'cursor-pointer transition-all duration-500 ease-in-out hover:bg-accent/15 hover:text-foreground data-[highlighted]:bg-accent/15 data-[highlighted]:text-foreground data-[state=checked]:bg-accent/15 data-[state=checked]:text-foreground';

interface AddItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: {
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
    imageUrl?: string;
    availableDate?: Date | string | null;
    availableMonth?: number | string | null;
  } | null;
  onSave?: (data: {
    id?: string;
    icon?: File;
    name: string;
    quantity: string;
    redeemingLimit: string;
    cost: number;
    availableDate?: Date | null;
    availableMonth?: AvailabilityInterval | null;
  }) => Promise<void>;
  saveError?: string;
  onErrorClear?: () => void;
}

// Format number with comma separators
const formatNumber = (value: string): string => {
  if (!value) return '';
  const num = value.replace(/,/g, '');
  if (isNaN(Number(num))) return value;
  return Number(num).toLocaleString('en-US');
};

// Remove commas for storage
const unformatNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

export function AddItemsModal({
  open,
  onOpenChange,
  editingItem,
  onSave,
  saveError = '',
  onErrorClear,
}: AddItemsModalProps) {
  // Form state mirrors add/edit fields shown to HR users.
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [existingImageError, setExistingImageError] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [redeemingLimit, setRedeemingLimit] = useState('');
  const [availableDate, setAvailableDate] = useState<Date | undefined>();
  const [availabilityInterval, setAvailabilityInterval] = useState<'none' | AvailabilityInterval>(
    'none'
  );

  // Derived disabled-date matcher based on chosen interval
  const disabledDateMatcher = useMemo((): ((date: Date) => boolean) | undefined => {
    // Restrict date picker to the current interval window only.
    if (availabilityInterval === 'none') return undefined;
    const now = new Date();
    if (availabilityInterval === 'weekly') {
      const start = startOfWeek(now, { weekStartsOn: 0 });
      const end = endOfWeek(now, { weekStartsOn: 0 });
      return (date: Date) => date < start || date > end;
    }
    if (availabilityInterval === 'monthly') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return (date: Date) => date < start || date > end;
    }
    if (availabilityInterval === 'yearly') {
      const start = startOfYear(now);
      const end = endOfYear(now);
      return (date: Date) => date < start || date > end;
    }
    return undefined;
  }, [availabilityInterval]);

  const handleIntervalChange = (value: 'none' | AvailabilityInterval) => {
    setAvailabilityInterval(value);
    // Reset date whenever interval changes to avoid stale/invalid selection
    setAvailableDate(undefined);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [iconValidationError, setIconValidationError] = useState<string>('');

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setItemName(editingItem.name);
      setItemCost(editingItem.cost.toString());
      setQuantity(editingItem.quantity?.toString() || '');
      setRedeemingLimit(editingItem.redeemingLimit?.toString() || '');
      setExistingImageUrl(editingItem.imageUrl ? `${editingItem.imageUrl}?t=${Date.now()}` : '');
      setExistingImageError(false);
      const interval =
        editingItem.availableMonth === 'weekly' ||
        editingItem.availableMonth === 'monthly' ||
        editingItem.availableMonth === 'yearly'
          ? editingItem.availableMonth
          : 'none';
      setAvailabilityInterval(interval);
      if (editingItem.availableDate) {
        setAvailableDate(new Date(editingItem.availableDate));
      } else {
        setAvailableDate(undefined);
      }
    } else {
      // Reset form when adding new
      setItemName('');
      setItemCost('');
      setQuantity('');
      setRedeemingLimit('');
      setAvailableDate(undefined);
      setAvailabilityInterval('none');
      setIconFile(null);
      setIconPreview('');
      setExistingImageUrl('');
      setExistingImageError(false);
      setIconValidationError('');
    }
  }, [editingItem, open]);

  // Clear error when user modifies form fields
  useEffect(() => {
    if (saveError && onErrorClear) {
      onErrorClear();
    }
  }, [
    itemName,
    quantity,
    itemCost,
    redeemingLimit,
    availableDate,
    iconFile,
    availabilityInterval,
    saveError,
    onErrorClear,
  ]);

  // Check if any changes were made compared to original item
  const hasChanges = useMemo(() => {
    if (!editingItem) {
      // For new items, check if any field has value
      return !!(
        itemName ||
        itemCost ||
        quantity ||
        redeemingLimit ||
        iconFile ||
        availableDate ||
        availabilityInterval !== 'none'
      );
    }

    // For editing, compare with original values
    const quantityNum = quantity ? parseInt(unformatNumber(quantity)) : undefined;
    const redeemingLimitNum = redeemingLimit ? parseInt(unformatNumber(redeemingLimit)) : undefined;
    const costNum = itemCost ? parseFloat(unformatNumber(itemCost)) : 0;

    const isNameChanged = itemName !== editingItem.name;
    const isCostChanged = costNum !== editingItem.cost;
    const isQuantityChanged = quantityNum !== editingItem.quantity;
    const isLimitChanged = redeemingLimitNum !== editingItem.redeemingLimit;
    const isIconChanged = !!iconFile;

    const originalInterval =
      editingItem.availableMonth === 'weekly' ||
      editingItem.availableMonth === 'monthly' ||
      editingItem.availableMonth === 'yearly'
        ? editingItem.availableMonth
        : 'none';
    const isIntervalChanged = originalInterval !== availabilityInterval;
    const originalDate = editingItem.availableDate
      ? new Date(editingItem.availableDate).getTime()
      : null;
    const currentDate = availableDate ? availableDate.getTime() : null;
    const isDateChanged = originalDate !== currentDate;

    return (
      isNameChanged ||
      isCostChanged ||
      isQuantityChanged ||
      isLimitChanged ||
      isIconChanged ||
      isIntervalChanged ||
      isDateChanged
    );
  }, [
    editingItem,
    itemName,
    itemCost,
    quantity,
    redeemingLimit,
    iconFile,
    availabilityInterval,
    availableDate,
  ]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Validate image type/size before preview and upload.
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_REWARD_IMAGE_TYPES.includes(file.type)) {
        const message = 'Only JPEG, PNG, and WebP images are allowed';
        setIconFile(null);
        setIconPreview('');
        setIconValidationError(message);
        toast.error(message);
        e.target.value = '';
        return;
      }

      if (file.size > MAX_REWARD_IMAGE_SIZE_BYTES) {
        const message = 'Image size must be less than 5MB';
        setIconFile(null);
        setIconPreview('');
        setIconValidationError(message);
        toast.error(message);
        e.target.value = '';
        return;
      }

      setIconValidationError('');
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Final validation + submit payload to parent save handler.
    if (iconFile) {
      if (!ALLOWED_REWARD_IMAGE_TYPES.includes(iconFile.type)) {
        const message = 'Only JPEG, PNG, and WebP images are allowed';
        setIconValidationError(message);
        toast.error(message);
        return;
      }

      if (iconFile.size > MAX_REWARD_IMAGE_SIZE_BYTES) {
        const message = 'Image size must be less than 5MB';
        setIconValidationError(message);
        toast.error(message);
        return;
      }
    }

    if (iconValidationError) return;

    if (itemName && itemCost && hasChanges) {
      setIsLoading(true);
      // Cap spinner time so the UI never feels stuck, while request continues.
      const loadingTimeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, SAVE_LOADING_CAP_MS);

      try {
        await onSave?.({
          id: editingItem?.id,
          icon: iconFile || undefined,
          name: itemName,
          quantity: unformatNumber(quantity),
          redeemingLimit: unformatNumber(redeemingLimit),
          cost: parseFloat(unformatNumber(itemCost)),
          availableDate: availableDate || null,
          availableMonth: availabilityInterval === 'none' ? null : availabilityInterval,
        });

        // Close modal on successful save
        handleClose(true);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Error saving item. Please try again.');
        }
        console.error('Error saving item:', error);
      } finally {
        window.clearTimeout(loadingTimeoutId);
        setIsLoading(false);
      }
    }
  };

  const handleClose = (force = false) => {
    // Reset form state so reopening starts from clean values.
    if (isLoading && !force) return; // Prevent closing while loading
    setIconFile(null);
    setIconPreview('');
    setExistingImageUrl('');
    setExistingImageError(false);
    setItemName('');
    setQuantity('');
    setRedeemingLimit('');
    setItemCost('');
    setAvailableDate(undefined);
    setAvailabilityInterval('none');
    setIsLoading(false);
    setIconValidationError('');
    onOpenChange(false);
  };

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  // Validation: Check if redeeming limit exceeds quantity
  const isRedeemingLimitInvalid = () => {
    const quantityNum = quantity ? parseInt(unformatNumber(quantity)) : 0;
    const limitNum = redeemingLimit ? parseInt(unformatNumber(redeemingLimit)) : 0;

    // If both values exist and limit > quantity, it's invalid
    if (quantity && redeemingLimit && limitNum > quantityNum) {
      return true;
    }

    return false;
  };

  // Validation: Check if item name has at least 2 characters
  const isItemNameValid = itemName.trim().length >= 2 && itemName.length <= 50;

  // Check if any character limits are exceeded
  const hasCharacterLimitErrors =
    itemName.length > 50 ||
    unformatNumber(quantity).length > 6 ||
    unformatNumber(redeemingLimit).length > 6 ||
    unformatNumber(itemCost).length > 6;

  const isImageRequiredMissing = !editingItem && !iconFile;
  const isIntervalSelectionMissing = availabilityInterval === 'none';
  const isIntervalDateMissing = availabilityInterval !== 'none' && !availableDate;

  const isSaveDisabled =
    !itemName ||
    !isItemNameValid ||
    !itemCost ||
    !quantity ||
    !redeemingLimit ||
    isImageRequiredMissing ||
    isIntervalSelectionMissing ||
    isIntervalDateMissing ||
    isRedeemingLimitInvalid() ||
    hasCharacterLimitErrors ||
    !!iconValidationError ||
    isLoading ||
    !hasChanges;

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-background text-card-foreground border border-border max-w-[95vw] sm:max-w-137.5 md:max-w-162.5 lg:max-w-175 rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg font-semibold">
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingItem ? 'Edit Item Reward' : 'Add Item Reward'}
            </DialogTitle>
            <button
              onClick={() => handleClose()}
              className="text-muted-foreground hover:text-title transition-colors h-5 w-5"
            ></button>
          </div>
        </DialogHeader>

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
            {saveError}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] lg:grid-cols-[minmax(0,11.25rem)_minmax(0,1fr)]">
          {/* Icon Upload Section */}
          <div className="space-y-2 md:pr-2">
            <Label className="text-sm font-medium text-foreground">Select Icon</Label>
            <label
              htmlFor="icon-upload"
              className="relative mx-auto w-full max-w-35 h-48 md:h-53 lg:h-51 overflow-hidden rounded-lg border-2 border-dashed border-border bg-background flex items-center justify-center cursor-pointer transition-colors hover:border-ring group md:mx-0 md:max-w-40 lg:max-w-45"
              style={
                iconPreview || (editingItem && existingImageUrl && !existingImageError)
                  ? {
                      backgroundImage: `url('${iconPreview || existingImageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderStyle: 'solid',
                    }
                  : undefined
              }
            >
              {/* Show new icon preview or existing image as background */}
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-full h-full object-cover rounded-lg absolute inset-0"
                />
              ) : editingItem && existingImageUrl && !existingImageError ? (
                // Existing image shown via background style, overlay info on top
                <div className="absolute inset-0" />
              ) : (
                <Plus className="h-8 w-8 text-muted-foreground" />
              )}

              {/* Camera icon overlay when there's an image (new or existing) */}
              {(iconPreview || (editingItem && existingImageUrl && !existingImageError)) && (
                <div className="absolute top-1 right-1 bg-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </label>
            <input
              id="icon-upload"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
            {isImageRequiredMissing && <p className="text-xs text-red-600">Image is required</p>}
            {iconValidationError && <p className="text-xs text-red-600">{iconValidationError}</p>}
          </div>

          {/* Form Fields */}
          <div className="min-w-0 space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-sm font-medium text-foreground">
                Item name
              </Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 50) {
                    setItemName(value);
                  }
                }}
                placeholder="Ex: Vacation ticket"
                minLength={2}
                className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {itemName && !isItemNameValid && itemName.length < 2 && (
                <p className="text-xs text-red-600">Item name must be at least 2 characters</p>
              )}
              {itemName.length > 50 && (
                <p className="text-xs text-red-600">Item name cannot exceed 50 characters</p>
              )}
              {itemName.length === 50}
            </div>

            {/* Item Cost | Quantity | Redeeming Limit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div className="space-y-2">
                <Label htmlFor="item-cost" className="text-sm font-medium text-foreground">
                  Item Cost
                </Label>
                <Input
                  id="item-cost"
                  type="text"
                  value={itemCost}
                  onChange={(e) => {
                    const value = unformatNumber(e.target.value);
                    if (value.length <= 6 && /^\d*$/.test(value)) {
                      setItemCost(formatNumber(value));
                    }
                  }}
                  placeholder="Fiesta Points"
                  className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {unformatNumber(itemCost).length === 6}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-foreground">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="text"
                  value={quantity}
                  onChange={(e) => {
                    const value = unformatNumber(e.target.value);
                    if (value.length <= 6 && /^\d*$/.test(value)) {
                      setQuantity(formatNumber(value));
                    }
                  }}
                  placeholder="Enter quantity"
                  required
                  className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {unformatNumber(quantity).length === 6}
              </div>

              <div className="space-y-2">
                <Label htmlFor="redeeming-limit" className="text-sm font-medium text-foreground">
                  Redeeming limit
                </Label>
                <Input
                  id="redeeming-limit"
                  type="text"
                  value={redeemingLimit}
                  onChange={(e) => {
                    const value = unformatNumber(e.target.value);
                    if (value.length <= 6 && /^\d*$/.test(value)) {
                      setRedeemingLimit(formatNumber(value));
                    }
                  }}
                  placeholder="Enter limit"
                  required
                  className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {unformatNumber(redeemingLimit).length === 6}
              </div>
            </div>

            {/* Validation Error Message */}
            {isRedeemingLimitInvalid() && (
              <p className="text-xs text-red-600 mt-1">
                Redeeming limit cannot be greater than quantity
              </p>
            )}

            {/* Availability Interval | Calendar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              <div className="space-y-2">
                <Label htmlFor="available-month" className="text-sm font-medium text-foreground">
                  Availability Interval
                </Label>
                <Select
                  value={availabilityInterval}
                  onValueChange={(value) =>
                    handleIntervalChange(value as 'none' | AvailabilityInterval)
                  }
                >
                  <SelectTrigger
                    id="available-month"
                    className="h-10 w-full cursor-pointer rounded-lg bg-background border-border text-foreground"
                  >
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="manager-dropdown-content rounded-lg bg-popover text-popover-foreground">
                    <SelectItem
                      value="none"
                      className={cn(mercadoSelectItemClassName, 'text-muted-foreground italic')}
                    >
                      No interval selected
                    </SelectItem>
                    <SelectItem value="weekly" className={mercadoSelectItemClassName}>
                      Weekly
                    </SelectItem>
                    <SelectItem value="monthly" className={mercadoSelectItemClassName}>
                      Monthly
                    </SelectItem>
                    <SelectItem value="yearly" className={mercadoSelectItemClassName}>
                      Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Availability Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={availabilityInterval === 'none'}
                      className={cn(
                        'h-10 w-full rounded-lg justify-between text-left font-normal bg-background border-border hover:bg-background hover:text-foreground',
                        !availableDate && 'text-muted-foreground'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-accent" />
                        <span>{availableDate ? format(availableDate, 'PPP') : 'Set Deadline'}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto rounded-xl border border-border bg-background p-0 shadow-sm/25"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={availableDate}
                      onSelect={setAvailableDate}
                      disabled={disabledDateMatcher}
                      className="rounded-xl bg-background p-3"
                      classNames={{
                        weekday:
                          'text-[#f97316] rounded-md flex-1 font-normal text-[0.8rem] select-none',
                        month_caption:
                          'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size) text-sm font-semibold text-foreground',
                        button_previous:
                          'inline-flex items-center justify-center size-(--cell-size) rounded-md p-0 select-none text-foreground hover:bg-[#fed7aa] hover:text-foreground aria-disabled:opacity-50',
                        button_next:
                          'inline-flex items-center justify-center size-(--cell-size) rounded-md p-0 select-none text-foreground hover:bg-[#fed7aa] hover:text-foreground aria-disabled:opacity-50',
                        today:
                          'rounded-md border-0 text-foreground data-[selected=true]:border-0 data-[selected=true]:bg-[#f97316] data-[selected=true]:text-white',
                        outside: 'text-muted-foreground/60 aria-selected:text-muted-foreground/60',
                        disabled: 'text-muted-foreground/45 opacity-100',
                      }}
                      components={{
                        DayButton: (props) => (
                          <CalendarDayButton
                            {...props}
                            className={cn(
                              'cursor-pointer border-0 text-foreground hover:bg-[#fed7aa] hover:text-foreground group-data-[focused=true]/day:border-transparent group-data-[focused=true]/day:ring-0 data-[selected-single=true]:border-0 data-[selected-single=true]:bg-[#f97316] data-[selected-single=true]:text-white data-[range-middle=true]:bg-transparent data-[range-middle=true]:text-foreground data-[range-start=true]:border-0 data-[range-start=true]:bg-[#f97316] data-[range-start=true]:text-white data-[range-end=true]:border-0 data-[range-end=true]:bg-[#f97316] data-[range-end=true]:text-white'
                            )}
                          />
                        ),
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:col-span-2 space-y-1">
                {availabilityInterval === 'none' && (
                  <p className="text-xs text-red-600">Please select an availability interval</p>
                )}
                {availabilityInterval !== 'none' && (
                  <p className="text-xs text-muted-foreground italic">
                    Only dates within the current {availabilityInterval} are selectable
                  </p>
                )}
                {isIntervalDateMissing && (
                  <p className="text-xs text-red-600">Please select a date for this interval</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="h-10 rounded-lg bg-primary-gradient text-zinc-50 hover:opacity-95 px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClose()}
            disabled={isLoading}
            className="h-10 rounded-lg border border-gray-300 bg-card text-foreground shadow-sm/25 hover:bg-gray-200 hover:text-foreground transition-all duration-400 ease-in-out px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>

        {/* Helper message when editing but no changes made */}
        {editingItem && !hasChanges && !saveError && (
          <p className="text-xs text-muted-foreground text-center mt-2 italic">
            Make changes to enable save
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
