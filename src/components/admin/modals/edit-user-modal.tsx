/**
 * Edit User Modal Component
 * ==========================
 * Dialog modal for editing existing users.
 * Email is read-only; allows updating name, password, and employee type.
 * All fields are optional - blank fields will not be updated.
 */

'use client';

import { useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User, EditUserInput, EmployeeTypeValue } from '@/types';
import { editUserSchema } from '@/zod/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserIcon, Lock, Briefcase, Mail } from 'lucide-react';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onEditUser: (userId: string, data: EditUserInput) => Promise<boolean>;
}

const EMPLOYEE_TYPES = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'regular', label: 'Regular' },
] as const;

export function EditUserModal({ open, onOpenChange, user, onEditUser }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      password: '',
      employeeType: 'no-change',
    },
  });

  // Reset form when modal opens/user changes
  useEffect(() => {
    if (open) {
      reset({
        name: '',
        password: '',
        employeeType: 'no-change',
      });
    }
  }, [user, open, reset]);

  const onSubmit = (data: EditUserInput) => {
    startTransition(async () => {
      await onEditUser(user.id, data);
      onOpenChange(false);
    });
  };

  const selectedType = watch('employeeType');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Leave fields blank to keep current values. Only filled fields will be updated. Remember
            Supabase has a minimum 6 character password length.
          </DialogDescription>
        </DialogHeader>

        {/* Read-only email display */}
        <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Email (cannot be changed)</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Current Values:</p>
          <p>
            <span className="text-muted-foreground">Name:</span> {user.name}
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span> {user.employeeType}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-name">New Name (optional)</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-name"
                placeholder={`Current: ${user.name}`}
                className="pl-10"
                disabled={isPending}
                {...register('name')}
              />
            </div>
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">New Password (optional)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current"
                className="pl-10"
                disabled={isPending}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">New Role (optional)</Label>
            <Select
              value={selectedType || 'no-change'}
              onValueChange={(value) =>
                setValue('employeeType', value as EmployeeTypeValue | 'no-change')
              }
              disabled={isPending}
            >
              <SelectTrigger id="edit-type">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={`Current: ${user.employeeType}`} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-change">No change (keep current)</SelectItem>
                {EMPLOYEE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                  //test webhook
                ))}
              </SelectContent>
            </Select>
            {errors.employeeType && (
              <p className="text-sm text-destructive">{errors.employeeType.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
