'use client';

import { useState, useEffect } from 'react';
import { Pencil, Plus, X, Loader2 } from 'lucide-react';
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

interface AddItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: {
    id: string;
    name: string;
    cost: number;
    quantity?: number;
    redeemingLimit?: number;
  } | null;
  onSave?: (data: {
    id?: string;
    icon?: File;
    name: string;
    quantity: string;
    redeemingLimit: string;
    cost: number;
  }) => void;
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

export function AddItemsModal({ open, onOpenChange, editingItem, onSave }: AddItemsModalProps) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [redeemingLimit, setRedeemingLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setItemName(editingItem.name);
      setItemCost(editingItem.cost.toString());
      setQuantity(editingItem.quantity?.toString() || '');
      setRedeemingLimit(editingItem.redeemingLimit?.toString() || '');
    } else {
      // Reset form when adding new
      setItemName('');
      setItemCost('');
      setQuantity('');
      setRedeemingLimit('');
      setIconFile(null);
      setIconPreview('');
    }
  }, [editingItem, open]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (itemName && itemCost) {
      setIsLoading(true);
      try {
        await onSave?.({
          id: editingItem?.id,
          icon: iconFile || undefined,
          name: itemName,
          quantity: unformatNumber(quantity),
          redeemingLimit: unformatNumber(redeemingLimit),
          cost: parseFloat(unformatNumber(itemCost)),
        });
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
    setItemName('');
    setQuantity('');
    setRedeemingLimit('');
    setItemCost('');
    setIsLoading(false);
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

  const isSaveDisabled =
    !itemName ||
    !isItemNameValid ||
    !itemCost ||
    !quantity ||
    !redeemingLimit ||
    isRedeemingLimitInvalid() ||
    hasCharacterLimitErrors ||
    isLoading;

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-[#f5e5dc] border-none max-w-[95vw] sm:max-w-[550px] md:max-w-[650px] lg:max-w-[700px] rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-[#5a2a2a] text-base sm:text-lg font-semibold">
              <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingItem ? 'Edit Item Reward' : 'Add Item Reward'}
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-[#5a2a2a] hover:text-[#690003] transition-colors h-5 w-5"
            ></button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] lg:grid-cols-[190px_1fr] gap-4 mt-4">
          {/* Icon Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Select Icon</Label>
            <label
              htmlFor="icon-upload"
              className="w-full md:w-[160px] lg:w-[180px] h-[140px] md:h-[160px] lg:h-[180px] border-2 border-dashed border-[#7a3d3d] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#690003] transition-colors bg-white mx-auto md:mx-0"
            >
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Icon preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Plus className="h-8 w-8 text-[#7a3d3d]" />
              )}
            </label>
            <input
              id="icon-upload"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item-name" className="text-sm font-medium text-[#5a2a2a]">
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
                className="bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
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
                <Label htmlFor="quantity" className="text-sm font-medium text-[#5a2a2a]">
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
                  className="bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
                />
                {unformatNumber(quantity).length === 6}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="redeeming-limit" className="text-sm font-medium text-[#5a2a2a]">
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
                  className="bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
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

            {/* Item Cost */}
            <div className="space-y-2">
              <Label htmlFor="item-cost" className="text-sm font-medium text-[#5a2a2a]">
                Item Cost
              </Label>
              <div className="flex items-center gap-3">
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
                  className="w-120px bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
                />
              </div>
              {unformatNumber(itemCost).length === 6}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-white text-[#5a2a2a] border-[#e0cfcf] hover:bg-[#fbeaea] px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-[#690003] text-white hover:bg-[#8b0000] px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
      </DialogContent>
    </Dialog>
  );
}
