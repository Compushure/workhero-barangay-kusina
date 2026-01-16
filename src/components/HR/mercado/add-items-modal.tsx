'use client';

import { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
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
  onSave?: (data: {
    icon?: File;
    name: string;
    unitWeight: string;
    weightUnit: string;
    cost: number;
  }) => void;
}

export function AddItemsModal({ open, onOpenChange, onSave }: AddItemsModalProps) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [unitWeight, setUnitWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [itemCost, setItemCost] = useState('');

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

  const handleSave = () => {
    if (itemName && itemCost) {
      onSave?.({
        icon: iconFile || undefined,
        name: itemName,
        unitWeight,
        weightUnit,
        cost: parseFloat(itemCost),
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setIconFile(null);
    setIconPreview('');
    setItemName('');
    setUnitWeight('');
    setWeightUnit('kg');
    setItemCost('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#f5e5dc] border-none max-w-xl rounded-2xl p-6">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-[#5a2a2a] text-lg font-semibold">
              <Pencil className="h-5 w-5" />
              Add Item Reward
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-[#5a2a2a] hover:text-[#690003] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-[160px_1fr] gap-6 mt-4">
          {/* Icon Upload Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Select Icon</Label>
            <label
              htmlFor="icon-upload"
              className="w-full h-[160px] border-2 border-dashed border-[#7a3d3d] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#690003] transition-colors bg-white"
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
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Ex: Vacation ticket"
                className="bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
              />
            </div>

            {/* Item Unit Weight */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#5a2a2a]">Item Unit Weight</Label>
              <div className="flex gap-2">
                <Input
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                  placeholder="NA"
                  className="flex-1 bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
                />
                <Select value={weightUnit} onValueChange={setWeightUnit}>
                  <SelectTrigger className="w-[100px] bg-white border-[#e0cfcf] text-[#5a2a2a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Item Cost */}
            <div className="space-y-2">
              <Label htmlFor="item-cost" className="text-sm font-medium text-[#5a2a2a]">
                Item Cost
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="item-cost"
                  type="number"
                  value={itemCost}
                  onChange={(e) => setItemCost(e.target.value)}
                  placeholder="2000"
                  className="w-[120px] bg-white border-[#e0cfcf] text-[#5a2a2a] placeholder:text-[#7a3d3d]/50"
                />
                <span className="text-[#5a2a2a] font-medium">Fiesta Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="bg-white text-[#5a2a2a] border-[#e0cfcf] hover:bg-[#fbeaea] px-8"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!itemName || !itemCost}
            className="bg-[#690003] text-white hover:bg-[#8b0000] px-8"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
