'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Check, Trash2, Plus as PlusIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface BadgeCondition {
  id: string;
  requirement_type: string; // 'task', 'attribute', 'attendance'
  requirement_operator: string;
  requirement_attrb_id: string | null; // task_id, attribute_type, or attendance_type
  requirement_attrb_value: number;
}

export interface BadgeFormData {
  name: string;
  description: string;
  points: number;
  award_at_interval: string;
  img_link: string | null;
  conditions: BadgeCondition[];
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
}

const REQUIREMENT_TYPES = ['task', 'attribute', 'attendance'];
const OPERATORS = ['=', '>', '<', '>=', '<=', '!='];
const INTERVALS = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

// MOCK DATA - Replace with actual API calls
const MOCK_TASKS = [
  { id: 'task-1', name: 'Complete Project' },
  { id: 'task-2', name: 'Submit Report' },
  { id: 'task-3', name: 'Review Code' },
  { id: 'task-4', name: 'Write Documentation' },
  { id: 'task-5', name: 'Example Task' },
];

const MOCK_ATTRIBUTES = [
  { id: 'attr-points', name: 'Points' },
  { id: 'attr-xp', name: 'Experience Points' },
  { id: 'attr-level', name: 'Level' },
];

const MOCK_ATTENDANCE_TYPES = [
  { id: 'absence', name: 'Absences' },
  { id: 'late', name: 'Lates' },
  { id: 'overtime', name: 'Overtimes' },
  { id: 'undertime', name: 'Undertimes' },
];

export default function AddEditBadgeDialog({
  open,
  onOpenChange,
  editingBadge,
  onSave,
  saveError = '',
  onErrorClear,
  existingNames = [],
}: AddEditBadgeDialogProps) {
  const [badgeName, setBadgeName] = useState('');
  const [badgeDescription, setBadgeDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [awardAtInterval, setAwardAtInterval] = useState('none');
  const [imgLink, setImgLink] = useState<string | null>(null);
  const [conditions, setConditions] = useState<BadgeCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingBadge) {
      setBadgeName(editingBadge.name);
      setBadgeDescription(editingBadge.description || '');
      setPoints(editingBadge.points);
      setAwardAtInterval(editingBadge.award_at_interval);
      setImgLink(editingBadge.img_link || null);
      setConditions(editingBadge.conditions);
    } else {
      // Reset form when adding new
      setBadgeName('');
      setBadgeDescription('');
      setPoints(10);
      setAwardAtInterval('none');
      setImgLink(null);
      setConditions([]);
    }
  }, [editingBadge, open]);

  // Clear error when user modifies form fields
  useEffect(() => {
    if (saveError && onErrorClear) {
      onErrorClear();
    }
  }, [badgeName, badgeDescription, points, awardAtInterval, saveError, onErrorClear]);

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
      JSON.stringify(conditions) !== JSON.stringify(editingBadge.conditions)
    );
  }, [editingBadge, badgeName, badgeDescription, points, awardAtInterval, imgLink, conditions]);

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
    setBadgeName('');
    setBadgeDescription('');
    setPoints(10);
    setAwardAtInterval('none');
    setImgLink(null);
    setConditions([]);
    setIsLoading(false);
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
    const newCondition: BadgeCondition = {
      id: `temp-${Date.now()}`,
      requirement_type: 'task',
      requirement_operator: '=',
      requirement_attrb_id: MOCK_TASKS[0]?.id || null,
      requirement_attrb_value: 1,
    };
    setConditions([...conditions, newCondition]);
  };

  // Remove a condition
  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  // Update a condition
  const handleUpdateCondition = (id: string, field: keyof BadgeCondition, value: any) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-background border-none max-w-[95vw] md:max-w-2xl lg:max-w-3xl rounded-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-[#5a2a2a] text-base sm:text-lg font-semibold">
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
          <div className="flex gap-8">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium text-[#5a2a2a]">
                Badge Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter badge name"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                maxLength={255}
                className={`bg-white border-[#e0cfcf] focus:border-[#690003] ${
                  badgeName && !isBadgeNameValid ? 'border-red-500' : ''
                } ${isDuplicateName ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between text-xs">
                <span className="text-[#7a3d3d]/70">
                  {badgeName && !isBadgeNameValid && 'Must be 2-255 characters'}
                  {isDuplicateName && 'Badge name already exists'}
                </span>
                <span className="text-[#7a3d3d]/70">{badgeName.length}/255</span>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium text-[#5a2a2a]">
                Points <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPoints(Math.max(1, points - 1))}
                  disabled={points <= 1 || isLoading}
                  className="bg-[#690003] text-white size-8 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                  className="text-center bg-white border-[#e0cfcf] focus:border-[#690003] remove-arrow"
                />
                <button
                  type="button"
                  onClick={() => setPoints(Math.min(10000, points + 1))}
                  disabled={points >= 10000 || isLoading}
                  className="bg-[#690003] text-white size-8 rounded flex items-center justify-center hover:bg-[#8B0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  +
                </button>
              </div>
              {!isPointsValid && <p className="text-xs text-red-500">Must be between 1 and 10,000</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Description</Label>
            <Input
              placeholder="Enter badge description"
              value={badgeDescription}
              onChange={(e) => setBadgeDescription(e.target.value)}
              maxLength={255}
              className={`bg-white border-[#e0cfcf] focus:border-[#690003] ${
                badgeDescription && !isDescriptionValid ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between text-xs">
              <span className="text-[#7a3d3d]/70">
                {badgeDescription && !isDescriptionValid && 'Max 255 characters'}
              </span>
              <span className="text-[#7a3d3d]/70">{badgeDescription.length}/255</span>
            </div>
          </div>

          {/* Badge Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Badge Icon</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Enter image URL (e.g., https://example.com/badge.png)"
                  value={imgLink || ''}
                  onChange={(e) => setImgLink(e.target.value || null)}
                  className="bg-white border-[#e0cfcf] focus:border-[#690003]"
                />
                <p className="text-xs text-gray-500">Enter a URL to an image file or leave empty for default placeholder</p>
              </div>
              {/* Icon Preview */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-[#e0cfcf]">
                {imgLink ? (
                  <img 
                    src={imgLink || "/placeholder.svg"} 
                    alt="Badge icon preview"
                    className="w-full h-full object-cover"
                    onError={() => console.log('[v0] Image failed to load')}
                  />
                ) : (
                  <span className="text-2xl text-gray-400">?</span>
                )}
              </div>
            </div>
          </div>

          {/* Award Interval */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#5a2a2a]">Award Interval</Label>
            <Select value={awardAtInterval} onValueChange={setAwardAtInterval}>
              <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((interval) => (
                  <SelectItem key={interval} value={interval}>
                    {interval === 'none' ? 'Manual' : interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditions Section */}
          <div className="space-y-4 border-t-2 border-[#e0cfcf] pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-[#5a2a2a]">Conditions</Label>
              <Button
                type="button"
                onClick={handleAddCondition}
                variant="outline"
                size="sm"
                className="border-[#690003] text-[#690003] hover:bg-[#fbeaea] bg-transparent"
              >
                <PlusIcon size={16} className="mr-1" />
                Add Condition
              </Button>
            </div>

            {conditions.length === 0 ? (
              <div className="bg-white rounded-lg p-4 border border-[#e0cfcf] text-center text-gray-500">
                <p className="text-sm">No conditions - Badge will be awarded manually</p>
              </div>
            ) : (
              <div className="border border-[#e0cfcf] rounded-lg overflow-hidden bg-white">
                <div className="max-h-96 overflow-y-auto space-y-0 divide-y divide-[#e0cfcf]">
                  {conditions.map((condition, idx) => (
                    <div
                      key={condition.id}
                      className="p-4 space-y-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#5a2a2a]">Condition {idx + 1}</span>
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

                    <div className="space-y-3">
                      {/* Requirement Type */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-[#5a2a2a]">Type</Label>
                        <Select
                          value={condition.requirement_type}
                          onValueChange={(value) => {
                            // Reset attrb_id when type changes
                            const newId = 
                              value === 'task' ? MOCK_TASKS[0]?.id :
                              value === 'attribute' ? MOCK_ATTRIBUTES[0]?.id :
                              MOCK_ATTENDANCE_TYPES[0]?.id;
                            handleUpdateCondition(condition.id, 'requirement_type', value);
                            handleUpdateCondition(condition.id, 'requirement_attrb_id', newId || null);
                          }}
                        >
                          <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
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
                        <p className="text-xs text-gray-500 mt-1">Select the type of requirement to check</p>
                      </div>

                      {/* Specific Item Selector (Task/Attribute/Attendance) */}
                      {condition.requirement_type === 'task' && (
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-[#5a2a2a]">Specific Task</Label>
                          <Select
                            value={condition.requirement_attrb_id || ''}
                            onValueChange={(value) =>
                              handleUpdateCondition(condition.id, 'requirement_attrb_id', value)
                            }
                          >
                            <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MOCK_TASKS.map((task) => (
                                <SelectItem key={task.id} value={task.id}>
                                  {task.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {condition.requirement_type === 'attribute' && (
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-[#5a2a2a]">Specific Attribute</Label>
                          <Select
                            value={condition.requirement_attrb_id || ''}
                            onValueChange={(value) =>
                              handleUpdateCondition(condition.id, 'requirement_attrb_id', value)
                            }
                          >
                            <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MOCK_ATTRIBUTES.map((attr) => (
                                <SelectItem key={attr.id} value={attr.id}>
                                  {attr.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                            <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MOCK_ATTENDANCE_TYPES.map((att) => (
                                <SelectItem key={att.id} value={att.id}>
                                  {att.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Human Readable Preview */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-xs text-blue-900 leading-relaxed">
                          {condition.requirement_type === 'task' && (
                            <>
                              When the Task <span className="font-semibold">'{MOCK_TASKS.find(t => t.id === condition.requirement_attrb_id)?.name || 'N/A'}'</span> is{' '}
                              <span className="font-semibold">{condition.requirement_operator}</span>{' '}
                              <span className="font-semibold">{condition.requirement_attrb_value}</span>
                            </>
                          )}
                          {condition.requirement_type === 'attribute' && (
                            <>
                              When User <span className="font-semibold">{MOCK_ATTRIBUTES.find(a => a.id === condition.requirement_attrb_id)?.name || 'N/A'}</span> attribute is{' '}
                              <span className="font-semibold">{condition.requirement_operator}</span>{' '}
                              <span className="font-semibold">{condition.requirement_attrb_value}</span>
                            </>
                          )}
                          {condition.requirement_type === 'attendance' && (
                            <>
                              When the Attendance Value <span className="font-semibold">{MOCK_ATTENDANCE_TYPES.find(a => a.id === condition.requirement_attrb_id)?.name || 'N/A'}</span> is{' '}
                              <span className="font-semibold">{condition.requirement_operator}</span>{' '}
                              <span className="font-semibold">{condition.requirement_attrb_value}</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Operator */}
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-[#5a2a2a]">Condition</Label>
                          <Select
                            value={condition.requirement_operator}
                            onValueChange={(value) =>
                              handleUpdateCondition(condition.id, 'requirement_operator', value)
                            }
                          >
                            <SelectTrigger className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm">
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
                          <Label className="text-xs font-medium text-[#5a2a2a]">Count Value</Label>
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
                            className="bg-white border-[#e0cfcf] focus:border-[#690003] h-9 text-sm"
                            placeholder="e.g., 5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
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
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editingBadge ? 'Update Badge' : 'Add Badge'}
              </>
            )}
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
