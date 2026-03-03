'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pencil, Plus, X, Loader2, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MAX_REWARD_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_REWARD_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
    availableMonth?: number;
  } | null;
  onSave?: (data: {
    id?: string;
    icon?: File;
    name: string;
    quantity: string;
    redeemingLimit: string;
    cost: number;
    availableMonth?: number | null;
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
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [existingImageError, setExistingImageError] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [redeemingLimit, setRedeemingLimit] = useState('');
  const [availableMonth, setAvailableMonth] = useState<string>('none'); // 'none' means no month selected
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
      // Load available month if it exists
      if (editingItem.availableMonth) {
        setAvailableMonth(editingItem.availableMonth.toString());
      } else {
        setAvailableMonth('none');
      }
    } else {
      // Reset form when adding new
      setItemName('');
      setItemCost('');
      setQuantity('');
      setRedeemingLimit('');
      setAvailableMonth('none');
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
    availableMonth,
    iconFile,
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
        (availableMonth && availableMonth !== 'none')
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

    // Check if available month changed
    const originalMonth = editingItem.availableMonth?.toString() || 'none';
    const isMonthChanged = availableMonth !== originalMonth;

    return (
      isNameChanged ||
      isCostChanged ||
      isQuantityChanged ||
      isLimitChanged ||
      isIconChanged ||
      isMonthChanged
    );
  }, [editingItem, itemName, itemCost, quantity, redeemingLimit, iconFile, availableMonth]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_REWARD_IMAGE_TYPES.includes(file.type)) {
        setIconFile(null);
        setIconPreview('');
        setIconValidationError('Only JPEG, PNG, and WebP images are allowed');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_REWARD_IMAGE_SIZE_BYTES) {
        setIconFile(null);
        setIconPreview('');
        setIconValidationError('Image size must be less than 5MB');
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
    if (iconValidationError) return;

    if (itemName && itemCost && hasChanges) {
      setIsLoading(true);
      try {
        await onSave?.({
          id: editingItem?.id,
          icon: iconFile || undefined,
          name: itemName,
          quantity: unformatNumber(quantity),
          redeemingLimit: unformatNumber(redeemingLimit),
          cost: parseFloat(unformatNumber(itemCost)),
          availableMonth:
            availableMonth && availableMonth !== 'none' ? parseInt(availableMonth) : null,
        });
        // Close modal on successful save
        handleClose();
      } catch (error) {
        console.error('Error saving item:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setIconFile(null);
    setIconPreview('');
    setExistingImageUrl('');
    setExistingImageError(false);
    setItemName('');
    setQuantity('');
    setRedeemingLimit('');
    setItemCost('');
    setAvailableMonth('none');
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

  const isSaveDisabled =
    !itemName ||
    !isItemNameValid ||
    !itemCost ||
    !quantity ||
    !redeemingLimit ||
    isImageRequiredMissing ||
    isRedeemingLimitInvalid() ||
    hasCharacterLimitErrors ||
    !!iconValidationError ||
    isLoading ||
    !hasChanges;

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border border-border max-w-[95vw] sm:max-w-[550px] md:max-w-[650px] lg:max-w-[700px] rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg font-semibold">
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingItem ? 'Edit Item Reward' : 'Add Item Reward'}
            </DialogTitle>
            <button
              onClick={handleClose}
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

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] lg:grid-cols-[190px_1fr] gap-4 mt-4">
          {/* Icon Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Select Icon</Label>
            <label
              htmlFor="icon-upload"
              className="w-full md:w-[160px] lg:w-[180px] h-[140px] md:h-[160px] lg:h-[180px] border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-ring transition-colors bg-background mx-auto md:mx-0 relative overflow-hidden group"
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
          <div className="space-y-4">
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              {/* Validation Messages for Item Name */}
              {itemName && !isItemNameValid && itemName.length < 2 && (
                <p className="text-xs text-red-600">Item name must be at least 2 characters</p>
              )}

              {/* Character limit  */}
              {itemName.length > 50 && (
                <p className="text-xs text-red-600">Item name cannot exceed 50 characters</p>
              )}
              {itemName.length === 50}
            </div>

            {/* Quantity and Redeeming Limit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {unformatNumber(quantity).length === 6}
              </div>
              <div className="flex-1 space-y-2">
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
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

            {/* Item Cost and Available Month */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-2">
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                {unformatNumber(itemCost).length === 6}
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="available-month" className="text-sm font-medium text-foreground">
                  Available Month
                </Label>
                <Select value={availableMonth} onValueChange={setAvailableMonth}>
                  <SelectTrigger
                    id="available-month"
                    className="w-full bg-background border-border hover:bg-muted text-foreground"
                  >
                    <SelectValue placeholder="Select month (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground">
                    <SelectItem value="none" className="text-muted-foreground italic">
                      No specific month (available all year)
                    </SelectItem>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
                {availableMonth && availableMonth !== 'none' && (
                  <p className="text-xs text-muted-foreground italic">
                    Item will appear in{' '}
                    {
                      [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ][parseInt(availableMonth) - 1]
                    }{' '}
                    stall
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-background text-foreground border-border hover:bg-muted px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
