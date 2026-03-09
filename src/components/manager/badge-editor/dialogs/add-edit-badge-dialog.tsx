'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Check, Trash2, Plus as PlusIcon, ChevronDown, ChevronUp, ImageUp, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { BadgeCondition, BadgeOption, BadgeInterval } from '@/types/manager/badge-editor';

export interface BadgeFormData {
  name: string;
  description: string;
  points: number;
  award_at_interval: BadgeInterval;
  img_link: string | null;
  conditions: BadgeCondition[];
  imageFile?: File | null;
  clearImage?: boolean;
}

interface AddEditBadgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBadge?: {
    id: string;
    name: string;
    description: string | null;
    points: number;
    award_at_interval: string;
    img_link: string | null;
    conditions: BadgeCondition[];
  } | null;
  onSave?: (data: BadgeFormData) => Promise<void>;
  saveError?: string;
  onErrorClear?: () => void;
  existingNames?: string[];
  taskOptions?: BadgeOption[];
  attributeOptions?: BadgeOption[];
  attendanceOptions?: BadgeOption[];
}

const REQUIREMENT_TYPES = ['task', 'attribute', 'attendance'];
const OPERATORS = ['=', '>', '<', '>=', '<=', '!='];
const INTERVALS: BadgeInterval[] = ['none', 'daily', 'monthly', 'anually'];
const INTERVAL_LABELS: Record<BadgeInterval, string> = {
  none: 'Manual',
  daily: 'Daily',
  monthly: 'Monthly',
  anually: 'Annually',
};

export default function AddEditBadgeDialog({
  open,
  onOpenChange,
  editingBadge,
  onSave,
  saveError = '',
  onErrorClear,
  existingNames = [],
  taskOptions = [],
  attributeOptions = [],
  attendanceOptions = [],
}: AddEditBadgeDialogProps) {
  const [badgeName, setBadgeName] = useState('');
  const [badgeDescription, setBadgeDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [awardAtInterval, setAwardAtInterval] = useState<BadgeInterval>('none');
  const [imgLink, setImgLink] = useState<string | null>(null);
  const [conditions, setConditions] = useState<BadgeCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [expandedConditions, setExpandedConditions] = useState<Record<string, boolean>>({});
  const [isConditionsCollapsed, setIsConditionsCollapsed] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingBadge) {
      setBadgeName(editingBadge.name);
      setBadgeDescription(editingBadge.description || '');
      setPoints(editingBadge.points);
      setAwardAtInterval(editingBadge.award_at_interval as BadgeInterval);
      setImgLink(editingBadge.img_link || null);
      setConditions(editingBadge.conditions);
      setImageFile(null);
      setImagePreviewUrl(null);
      setClearImage(false);
      setExpandedConditions({});
      setIsConditionsCollapsed(false);
    } else {
      // Reset form when adding new
      setBadgeName('');
      setBadgeDescription('');
      setPoints(10);
      setAwardAtInterval('none');
      setImgLink(null);
      setConditions([]);
      setImageFile(null);
      setImagePreviewUrl(null);
      setClearImage(false);
      setExpandedConditions({});
      setIsConditionsCollapsed(false);
    }
  }, [editingBadge, open]);

  // Clear error when user modifies form fields
  useEffect(() => {
    if (saveError && onErrorClear) {
      onErrorClear();
    }
  }, [badgeName, badgeDescription, points, awardAtInterval, imgLink, imageFile, clearImage, conditions, saveError, onErrorClear]);

  // Check if any changes were made compared to original badge
  const hasChanges = useMemo(() => {
    if (!editingBadge) {
      return !!(badgeName || badgeDescription || conditions.length > 0);
    }

    return (
      badgeName !== editingBadge.name ||
      badgeDescription !== editingBadge.description ||
      points !== editingBadge.points ||
      awardAtInterval !== editingBadge.award_at_interval ||
      imgLink !== editingBadge.img_link ||
      JSON.stringify(conditions) !== JSON.stringify(editingBadge.conditions) ||
      clearImage ||
      !!imageFile
    );
  }, [editingBadge, badgeName, badgeDescription, points, awardAtInterval, imgLink, imageFile, clearImage, conditions]);

  const handleSave = async () => {
    if (!isFormValid || !hasChanges) return;

    setIsLoading(true);
    try {
      await onSave?.({
        name: badgeName.trim(),
        description: badgeDescription.trim(),
        points,
        award_at_interval: awardAtInterval,
        img_link: imgLink,
        conditions,
        imageFile,
        clearImage,
      });
      handleClose();
    } catch (error) {
      console.error('Error saving badge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setBadgeName('');
    setBadgeDescription('');
    setPoints(10);
    setAwardAtInterval('none');
    setImgLink(null);
    setConditions([]);
    setIsLoading(false);
    setImageFile(null);
    setImagePreviewUrl(null);
    setClearImage(false);
    setExpandedConditions({});
    setIsConditionsCollapsed(false);
    onOpenChange(false);
  };

  // Validation checks
  const isBadgeNameValid = badgeName.trim().length >= 2 && badgeName.length <= 255;
  const isDescriptionValid = badgeDescription.trim().length <= 255;
  const isPointsValid = points > 0 && points <= 10000;

  // Check for duplicate name
  const isDuplicateName = useMemo(() => {
    const trimmedName = badgeName.trim().toLowerCase();
    if (!trimmedName) return false;

    return existingNames.some((name) => {
      const isDuplicate = name.toLowerCase() === trimmedName;
      if (editingBadge && name.toLowerCase() === editingBadge.name.toLowerCase()) {
        return false;
      }
      return isDuplicate;
    });
  }, [badgeName, existingNames, editingBadge]);

  const isFormValid =
    isBadgeNameValid &&
    isDescriptionValid &&
    isPointsValid &&
    !isDuplicateName;

  const isSaveDisabled = !isFormValid || isLoading || !hasChanges;

  // Add a new empty condition
  const handleAddCondition = () => {
    const initialType: BadgeCondition['requirement_type'] = taskOptions.length
      ? 'task'
      : attributeOptions.length
        ? 'attribute'
        : 'attendance';
    const initialId = initialType === 'task'
      ? taskOptions[0]?.id
      : initialType === 'attribute'
        ? attributeOptions[0]?.id
        : attendanceOptions[0]?.id;
    const newCondition: BadgeCondition = {
      id: `temp-${Date.now()}`,
      requirement_type: initialType,
      requirement_operator: '=',
      requirement_attrb_id: initialId || null,
      requirement_attrb_value: 1,
      logic_type: 'and',
    };
    setConditions([...conditions, newCondition]);
  };

  // Remove a condition
  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  // Update a condition
  const handleUpdateCondition = (id: string, field: keyof BadgeCondition, value: any) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleConditionTypeChange = (id: string, value: BadgeCondition['requirement_type']) => {
    const newId =
      value === 'task'
        ? taskOptions[0]?.id
        : value === 'attribute'
          ? attributeOptions[0]?.id
          : attendanceOptions[0]?.id;

    setConditions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              requirement_type: value,
              requirement_attrb_id: newId || null,
            }
          : c
      )
    );
  };

  const handleToggleCondition = (id: string) => {
    setExpandedConditions((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const operatorTextMap: Record<string, string> = {
    '=': 'is equal to',
    '>': 'is greater than',
    '<': 'is less than',
    '>=': 'is greater than or equal to',
    '<=': 'is less than or equal to',
    '!=': 'is not equal to',
  };

  const getOperatorText = (value: string) => operatorTextMap[value] || value;

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setImageFile(file);
    setClearImage(false);
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setImageFile(null);
    setImgLink(null);
    setClearImage(true);
  };

  const currentImageUrl = clearImage ? null : imagePreviewUrl || imgLink;

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-card border-none max-w-[95vw] sm:max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl rounded-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg font-semibold">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingBadge ? 'Edit Badge' : 'Add New Badge'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
            {saveError}
          </div>
        )}

        <div className="space-y-6 mt-4">
          {/* Badge Name and Points Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium text-primary">
                Badge Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter badge name"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                maxLength={255}
                className={`bg-white border ${
                  badgeName && !isBadgeNameValid ? 'border-red-500' : ''
                } ${isDuplicateName ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between text-xs">
                <span className="text-secondary">
                  {badgeName && !isBadgeNameValid && 'Must be 2-255 characters'}
                  {isDuplicateName && 'Badge name already exists'}
                </span>
                <span className="text-secondary">{badgeName.length}/255</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium text-primary">
                Points <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPoints(Math.max(1, points - 1))}
                  disabled={points <= 1 || isLoading}
                  className="bg-foreground text-white size-8 rounded flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  −
                </button>
                <Input
                  type="number"
                  value={points}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setPoints(Math.min(10000, Math.max(1, val)));
                  }}
                  min={1}
                  max={10000}
                  className="text-center bg-white border remove-arrow"
                />
                <button
                  type="button"
                  onClick={() => setPoints(Math.min(10000, points + 1))}
                  disabled={points >= 10000 || isLoading}
                  className="bg-foreground text-white size-8 rounded flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-secondary">Points awarded to user when badge is earned</p>
              {!isPointsValid && <p className="text-xs text-red-500">Must be between 1 and 10,000</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Description</Label>
            <Input
              placeholder="Enter badge description"
              value={badgeDescription}
              onChange={(e) => setBadgeDescription(e.target.value)}
              maxLength={255}
              className={`bg-white border ${
                badgeDescription && !isDescriptionValid ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between text-xs">
              <span className="text-secondary">
                {badgeDescription && !isDescriptionValid && 'Max 255 characters'}
              </span>
              <span className="text-secondary">{badgeDescription.length}/255</span>
            </div>
          </div>

          {/* Badge Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Badge Icon</Label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label
                htmlFor="badge-icon-upload"
                className="w-full md:w-40 h-32 border-2 border-dashed border-accent-secondary/50 rounded-lg flex items-center justify-center cursor-pointer hover:border-foreground transition-colors bg-white relative overflow-hidden group"
                style={
                  currentImageUrl
                    ? {
                        backgroundImage: `url('${currentImageUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderStyle: 'solid',
                      }
                    : undefined
                }
              >
                {currentImageUrl ? (
                  <div className="absolute inset-0" />
                ) : (
                  <ImageUp className="h-6 w-6 text-accent" />
                )}
                {currentImageUrl && (
                  <div className="absolute top-1 right-1 bg-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImageUp className="h-3 w-3 text-white" />
                  </div>
                )}
              </label>
              <input
                id="badge-icon-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-secondary">
                  Upload a badge icon (JPG, PNG, WebP). Max 5MB.
                </p>
                {currentImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearImage}
                    className="border-foreground text-foreground hover:bg-[#fbeaea] bg-transparent"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove Image
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Award Interval */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">Award Interval</Label>
            <Select value={awardAtInterval} onValueChange={(value) => setAwardAtInterval(value as BadgeInterval)}>
              <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((interval) => (
                  <SelectItem key={interval} value={interval}>
                    {INTERVAL_LABELS[interval as BadgeInterval]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Controls how often this badge is evaluated. Manual means the badge is only assigned by a manager.
            </p>
          </div>

          {/* Conditions Section */}
          <div className="space-y-4 border-t-2 border-[#e0cfcf] pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold text-primary">Conditions</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsConditionsCollapsed((prev) => !prev)}
                  className="h-8 w-8 text-foreground hover:bg-foreground/10"
                >
                  {isConditionsCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </Button>
              </div>
              <Button
                type="button"
                onClick={handleAddCondition}
                variant="outline"
                size="sm"
                className="border-foreground text-foreground hover:bg-gray-200 bg-card"
              >
                <PlusIcon size={16} className="mr-1" />
                Add Condition
              </Button>
            </div>

            {/* Logic Type Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs text-blue-900 font-semibold">Understanding Condition Logic:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p><span className="font-bold">AND (*)</span> - Mandatory condition. All AND conditions must be met.</p>
                <p><span className="font-bold">OR (+)</span> - Optional condition. At least one OR condition must be met (if any OR exists).</p>
                <p className="italic mt-1">Example: 2 AND conditions + 1 OR condition = All 2 ANDs must be met + the 1 OR must be met.</p>
              </div>
            </div>

            {isConditionsCollapsed && (
              <p className="text-xs text-gray-500">
                Conditions are collapsed. Expand to view or edit.
              </p>
            )}

            {!isConditionsCollapsed && conditions.length === 0 ? (
              <div className="bg-background-soft rounded-lg p-4 border border-[#e0cfcf] text-center text-gray-500">
                <p className="text-sm">No conditions - Badge will be awarded manually</p>
              </div>
            ) : !isConditionsCollapsed ? (
              <div className="border border-[#e0cfcf] rounded-lg overflow-hidden bg-white">
                <div className="max-h-96 overflow-y-auto space-y-0 divide-y divide-[#e0cfcf] [scrollbar-width:none] sm:[scrollbar-width:auto] [-ms-overflow-style:none] sm:[-ms-overflow-style:auto] [&::-webkit-scrollbar]:hidden sm:[&::-webkit-scrollbar]:block">
                  {conditions.map((condition, idx) => {
                    const isExpanded = expandedConditions[condition.id] ?? true;

                    return (
                      <div
                        key={condition.id}
                        className="bg-background-soft p-4 space-y-3 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-primary">
                              Condition {idx + 1}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              condition.logic_type === 'and' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {condition.logic_type === 'and' ? '* AND' : '+ OR'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              onClick={() => handleToggleCondition(condition.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-foreground/10 text-foreground"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => handleRemoveCondition(condition.id)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {/* Logic Type */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-primary">Logic Type</Label>
                                <Select
                                  value={condition.logic_type}
                                  onValueChange={(value) =>
                                    handleUpdateCondition(condition.id, 'logic_type', value)
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="and">* AND (Required)</SelectItem>
                                    <SelectItem value="or">+ OR (Optional)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                  {condition.logic_type === 'and' 
                                    ? 'Mandatory: Must be met' 
                                    : 'Optional: At least one OR must be met'}
                                </p>
                              </div>

                              {/* Requirement Type */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">Type</Label>
                                <Select
                                  value={condition.requirement_type}
                                  onValueChange={(value) =>
                                    handleConditionTypeChange(
                                      condition.id,
                                      value as BadgeCondition['requirement_type']
                                    )
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {REQUIREMENT_TYPES.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">
                                  Category to check
                                </p>
                              </div>
                            </div>

                            {/* Specific Item Selector (Task/Attribute/Attendance) */}
                            {condition.requirement_type === 'task' && (
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">Task Category</Label>
                                <Select
                                  value={condition.requirement_attrb_id || ''}
                                  onValueChange={(value) =>
                                    handleUpdateCondition(condition.id, 'requirement_attrb_id', value)
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {taskOptions.map((task) => (
                                      <SelectItem key={task.id} value={task.id}>
                                        {task.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">The task category to check completed orders for</p>
                              </div>
                            )}

                            {condition.requirement_type === 'attribute' && (
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">
                                  User Attribute
                                </Label>
                                <Select
                                  value={condition.requirement_attrb_id || ''}
                                  onValueChange={(value) =>
                                    handleUpdateCondition(condition.id, 'requirement_attrb_id', value)
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {attributeOptions.map((attr) => (
                                      <SelectItem key={attr.id} value={attr.id}>
                                        {attr.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">The user stat/attribute to check</p>
                              </div>
                            )}

                            {condition.requirement_type === 'attendance' && (
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">Attendance Type</Label>
                                <Select
                                  value={condition.requirement_attrb_id || ''}
                                  onValueChange={(value) =>
                                    handleUpdateCondition(condition.id, 'requirement_attrb_id', value)
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {attendanceOptions.map((att) => (
                                      <SelectItem key={att.id} value={att.id}>
                                        {att.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                <p className="text-xs text-gray-500">The attendance flag to check</p>
                                </Select>
                              </div>
                            )}

                            {/* Human Readable Preview */}
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <p className="text-xs text-blue-900 leading-relaxed">
                                {condition.requirement_type === 'task' && (
                                  <>
                                    <span className="font-semibold">[{condition.logic_type.toUpperCase()}]</span> When completed orders for{' '}
                                    <span className="font-semibold">
                                      &quot;{taskOptions.find(t => t.id === condition.requirement_attrb_id)?.name || 'N/A'}&quot;
                                    </span>{' '}
                                    {getOperatorText(condition.requirement_operator)}{' '}
                                    <span className="font-semibold">{condition.requirement_attrb_value}</span>
                                  </>
                                )}
                                {condition.requirement_type === 'attribute' && (
                                  <>
                                    <span className="font-semibold">[{condition.logic_type.toUpperCase()}]</span> When user&apos;s{' '}
                                    <span className="font-semibold">
                                      {attributeOptions.find(a => a.id === condition.requirement_attrb_id)?.name || 'N/A'}
                                    </span>{' '}
                                    {getOperatorText(condition.requirement_operator)}{' '}
                                    <span className="font-semibold">{condition.requirement_attrb_value}</span>
                                  </>
                                )}
                                {condition.requirement_type === 'attendance' && (
                                  <>
                                    <span className="font-semibold">[{condition.logic_type.toUpperCase()}]</span> When attendance count for{' '}
                                    <span className="font-semibold">
                                      {attendanceOptions.find(a => a.id === condition.requirement_attrb_id)?.name || 'N/A'}
                                    </span>{' '}
                                    {getOperatorText(condition.requirement_operator)}{' '}
                                    <span className="font-semibold">{condition.requirement_attrb_value}</span>
                                  </>
                                )}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              {/* Operator */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">Operator</Label>
                                <Select
                                  value={condition.requirement_operator}
                                  onValueChange={(value) =>
                                    handleUpdateCondition(condition.id, 'requirement_operator', value)
                                  }
                                >
                                  <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {OPERATORS.map((op) => (
                                      <SelectItem key={op} value={op}>
                                        {op}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Attribute Value */}
                              <div className="col-span-2 space-y-1">
                                <Label className="text-xs font-medium text-[#5a2a2a]">Target Value</Label>
                                <Input
                                  type="number"
                                  value={condition.requirement_attrb_value}
                                  onChange={(e) =>
                                    handleUpdateCondition(
                                      condition.id,
                                      'requirement_attrb_value',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  min={0}
                                  max={10000}
                                  className="bg-white border-[#e0cfcf] focus:border-foreground h-9 text-sm"
                                  placeholder="e.g., 5"
                                />
                                <p className="text-xs text-gray-500">The number to compare against</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-foreground text-white hover:bg-accent px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isLoading ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editingBadge ? 'Update Badge' : 'Add Badge'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-card text-primary border hover:bg-gray-200 px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>

        {editingBadge && !hasChanges && !saveError && (
          <p className="text-xs text-[#7a3d3d]/70 text-center mt-2 italic">
            Make changes to enable save
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
