'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Check } from 'lucide-react';
import type { TaskCategory } from '@/types/manager/task-editor';
import type { AddTaskInput } from '@/zod/schemas/task';

interface AddEditTaskCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: TaskCategory | null;
  onSave?: (data: AddTaskInput) => Promise<void>;
  saveError?: string;
  onErrorClear?: () => void;
  existingTypes?: string[];
  existingNames?: string[];
}

export default function AddEditTaskCategoryDialog({
  open,
  onOpenChange,
  editingTask,
  onSave,
  saveError = '',
  onErrorClear,
  existingTypes = [],
  existingNames = [],
}: AddEditTaskCategoryDialogProps) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('');
  const [points, setPoints] = useState(1);
  const [xp, setXp] = useState(1);
  const [isRepeatable, setIsRepeatable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.name);
      setTaskDescription(editingTask.description);
      setTaskType(editingTask.type);
      setPoints(editingTask.points);
      setXp(editingTask.xp);
      setIsRepeatable(editingTask.isRepeatable);
    } else {
      // Reset form when adding new
      setTaskName('');
      setTaskDescription('');
      setTaskType('');
      setPoints(1);
      setXp(1);
      setIsRepeatable(true);
    }
  }, [editingTask, open]);

  // Clear error when user modifies form fields
  useEffect(() => {
    if (saveError && onErrorClear) {
      onErrorClear();
    }
  }, [taskName, taskDescription, taskType, points, xp, isRepeatable, saveError, onErrorClear]);

  // Filter existing types based on input
  const filteredTypes = useMemo(() => {
    if (!taskType.trim()) return existingTypes;
    return existingTypes.filter((type) => type.toLowerCase().includes(taskType.toLowerCase()));
  }, [taskType, existingTypes]);

  // Check if any changes were made compared to original task
  const hasChanges = useMemo(() => {
    if (!editingTask) {
      // For new tasks, check if any field has value
      return !!(taskName || taskDescription || taskType);
    }

    // For editing, compare with original values
    return (
      taskName !== editingTask.name ||
      taskDescription !== editingTask.description ||
      taskType !== editingTask.type ||
      points !== editingTask.points ||
      xp !== editingTask.xp ||
      isRepeatable !== editingTask.isRepeatable
    );
  }, [editingTask, taskName, taskDescription, taskType, points, xp, isRepeatable]);

  const handleSave = async () => {
    if (!isFormValid || !hasChanges) return;

    setIsLoading(true);
    try {
      await onSave?.({
        name: taskName.trim(),
        description: taskDescription.trim(),
        type: taskType.trim(),
        points,
        xp,
        isRepeatable,
      });
      // Close modal on successful save
      handleClose();
    } catch (error) {
      console.error('Error saving task category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing while loading
    setTaskName('');
    setTaskDescription('');
    setTaskType('');
    setPoints(1);
    setXp(1);
    setIsRepeatable(true);
    setIsLoading(false);
    setShowTypeDropdown(false);
    onOpenChange(false);
  };

  // Validation checks
  const isTaskNameValid = taskName.trim().length >= 2 && taskName.length <= 255;
  const isDescriptionValid = taskDescription.trim().length >= 2 && taskDescription.length <= 255;
  const isTypeValid = taskType.trim().length >= 2 && taskType.length <= 255;
  const isPointsValid = points > 0 && points <= 10000;
  const isXpValid = xp > 0 && xp <= 5000;

  // Check for duplicate name (excluding current task if editing)
  const isDuplicateName = useMemo(() => {
    const trimmedName = taskName.trim().toLowerCase();
    if (!trimmedName) return false;

    return existingNames.some((name) => {
      const isDuplicate = name.toLowerCase() === trimmedName;
      // If editing, allow the current task's name
      if (editingTask && name.toLowerCase() === editingTask.name.toLowerCase()) {
        return false;
      }
      return isDuplicate;
    });
  }, [taskName, existingNames, editingTask]);

  const isFormValid =
    isTaskNameValid &&
    isDescriptionValid &&
    isTypeValid &&
    isPointsValid &&
    isXpValid &&
    !isDuplicateName;

  const isSaveDisabled = !isFormValid || isLoading || !hasChanges;

  // Type selection handler
  const handleTypeSelect = (type: string) => {
    setTaskType(type);
    setShowTypeDropdown(false);
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? () => {} : onOpenChange}>
      <DialogContent className="bg-background border-none max-w-[95vw] sm:max-w-md md:max-w-135 lg:max-w-150 xl:max-w-175 2xl:max-w-200 rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex gap-2 text-xl text-foreground text-left items-center">
              <Plus className='size-6 p-1 bg-primary-gradient text-card rounded-full'/>
              {editingTask ? 'Edit Task Category' : 'Add New Task Category'}
            </DialogTitle>
            {/* <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg font-semibold">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              {editingTask ? 'Edit Task Category' : 'Add New Task Category'}
            </DialogTitle> */}
          </div>
        </DialogHeader>

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-red-700 text-sm">
            {saveError}
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div className='flex gap-8'>
            {/* Task Name */}
            <div className="space-y-2 flex-1/2">
              <Label className="text-sm font-medium text-primary">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter task name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                maxLength={255}
                className={`bg-white ${
                  taskName && !isTaskNameValid ? 'border-red-500' : ''
                } ${isDuplicateName ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between text-xs">
                <span className="text-secondary">
                  {taskName && !isTaskNameValid && 'Must be 2-255 characters'}
                  {isDuplicateName && 'Task name already exists'}
                </span>
                <span className="text-secondary">{taskName.length}/255</span>
              </div>
            </div>

            {/* Task Type with Dropdown */}
            <div className="space-y-2 relative flex-1/2">
              <Label className="text-sm font-medium text-primary">
                Type <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Enter or select task type"
                value={taskType}
                onChange={(e) => {
                  setTaskType(e.target.value);
                  setShowTypeDropdown(true);
                }}
                onFocus={() => setShowTypeDropdown(true)}
                onBlur={() => {
                  // Delay to allow click on dropdown item
                  setTimeout(() => setShowTypeDropdown(false), 200);
                }}
                maxLength={255}
                className={`bg-white ${
                  taskType && !isTypeValid ? 'border-red-500' : ''
                }`}
              />

              {/* Dropdown for existing types */}
              {showTypeDropdown && filteredTypes.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                  {filteredTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className="w-full text-left px-4 py-2 hover:bg-accent-secondary/50 transition-colors text-sm text-primary border-none bg-transparent"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-xs">
                <span className="text-secondary">
                  {taskType && !isTypeValid && 'Must be 2-255 characters'}
                </span>
                <span className="text-secondary">{taskType.length}/255</span>
              </div>
            </div>
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-primary">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter task description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              maxLength={255}
              className={`bg-white ${
                taskDescription && !isDescriptionValid ? 'border-red-500' : ''
              }`}
            />
            <div className="flex justify-between text-xs">
              <span className="text-secondary">
                {taskDescription && !isDescriptionValid && 'Must be 2-255 characters'}
              </span>
              <span className="text-secondary">{taskDescription.length}/255</span>
            </div>
          </div>


          <section className='flex gap-8'>
            {/* Points and XP Row */}
            <div className="grid grid-cols-1 gap-4 flex-1/2 mb-6">
              {/* Points */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  Fiesta Points <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPoints(Math.max(1, points - 1))}
                    disabled={points <= 1 || isLoading}
                    className="bg-foreground text-card size-8 rounded flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                    className="text-center bg-white border-[#e0cfcf] focus:border-foreground remove-arrow"
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
                {!isPointsValid && (
                  <p className="text-xs text-red-500">Must be between 1 and 10,000</p>
                )}
              </div>

              {/* XP */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-primary">
                  XP <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setXp(Math.max(1, xp - 1))}
                    disabled={xp <= 1 || isLoading}
                    className="bg-foreground text-white w-8 h-8 rounded flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    −
                  </button>
                  <Input
                    type="number"
                    value={xp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setXp(Math.min(5000, Math.max(1, val)));
                    }}
                    min={1}
                    max={5000}
                    className="text-center bg-white border-[#e0cfcf] focus:border-foreground remove-arrow"
                  />
                  <button
                    type="button"
                    onClick={() => setXp(Math.min(5000, xp + 1))}
                    disabled={xp >= 5000 || isLoading}
                    className="bg-foreground text-white w-8 h-8 rounded flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    +
                  </button>
                </div>
                {!isXpValid && <p className="text-xs text-red-500">Must be between 1 and 5,000</p>}
              </div>
            </div>

            {/* Is Repeatable Toggle */}
            <div className="flex flex-col flex-1/2 items-center justify-between p-4 bg-white rounded-lg border border-[#e0cfcf]">
              <div className="space-y-1">
                <Label className="text-base font-medium text-primary">Repeatable Task</Label>
                <p className="text-sm text-secondary">Can this task be assigned with multiple orders?</p>
              </div>
              <Switch checked={isRepeatable} onCheckedChange={setIsRepeatable} disabled={isLoading} className='scale-150 data-[state=checked]:bg-accent'>
              </Switch>
                    
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="bg-foreground text-white hover:bg-accent px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto transition-all duration-400 ease-in-out"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editingTask ? 'Update Task' : 'Add Task'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-white text-primary border-primary/50 hover:bg-white hover:brightness-90 px-6 sm:px-8 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>

        {/* Helper message when editing but no changes made */}
        {editingTask && !hasChanges && !saveError && (
          <p className="text-xs text-secondary text-center mt-2 italic">
            Make changes to enable save
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
