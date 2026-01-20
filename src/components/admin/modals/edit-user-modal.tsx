/**
 * Edit User Modal Component
 * ==========================
 * Dialog modal for editing existing users with comprehensive fields.
 * Email is read-only; all other fields are optional - blank fields will not be updated.
 * Includes Philippine-specific validations for government IDs and contact numbers.
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  UserIcon,
  Lock,
  Briefcase,
  Mail,
  Building2,
  Award as IdCard,
  Phone,
  MapPin,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';

type EditUserFormValues = EditUserInput & {
  contactNumber?: string;
  employmentStatus?: string;
  address?: string;
  tin?: string;
  sss?: string;
  pagibig?: string;
};

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onEditUser: (userId: string, data: EditUserInput) => Promise<boolean>;
}

const EMPLOYEE_TYPES = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'regular', label: 'Regular Employee' },
] as const;

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'probational', label: 'Probationary' },
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
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema) as any,
    defaultValues: {
      name: '',
      password: '',
      employeeType: 'no-change',
      employmentStatus: 'no-change',
      contactNumber: '',
      address: '',
      tin: '',
      sss: '',
      pagibig: '',
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
      <DialogContent className="admin-theme bg-primary-foreground w-[95vw] max-w-2xl mx-auto max-h-[90vh] p-0 rounded-xl shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border">
          <DialogTitle className="text-xl font-bold text-primary">Edit User</DialogTitle>
          <DialogDescription className="text-sm text-foreground/80">
            Leave fields blank to keep current values. Only filled fields will be updated.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <div className="space-y-6 pb-6">
            {/* Read-only information section */}
            <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
              <p className="text-xs font-semibold text-primary uppercase">Read-Only Information</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/70">Email</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/70">Company ID</p>
                    <p className="text-sm font-medium truncate">
                      {(user as any).companyId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-foreground/70">Employee ID</p>
                    <p className="text-sm font-medium truncate">
                      {(user as any).employeeId || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current values */}
            <div className="p-3 bg-card rounded-lg border border-border text-sm space-y-1">
              <p className="text-xs text-primary font-medium">Current Values:</p>
              <p>
                <span className="text-foreground/70">Name:</span> {user.name}
              </p>
              <p>
                <span className="text-foreground/70">Role:</span> {user.employeeType}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">Basic Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Name */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-foreground">
                      New Name
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-name"
                        placeholder={`Current: ${user.name}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('name')}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-password" className="text-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('password')}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  {/* New Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-contact" className="text-foreground">
                      New Contact Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-contact"
                        placeholder={`Current: ${(user as any).contactNumber || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('contactNumber')}
                      />
                    </div>
                    {errors.contactNumber && (
                      <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">
                  Employment Details (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Role */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-type" className="text-foreground">
                      New Role
                    </Label>
                    <Select
                      value={selectedType || 'no-change'}
                      onValueChange={(value) =>
                        setValue('employeeType', value as EmployeeTypeValue | 'no-change')
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="edit-type"
                        className="border-border focus:border-primary focus:ring-primary"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <SelectValue placeholder={`Current: ${user.employeeType}`} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">
                          No change (keep {user.employeeType})
                        </SelectItem>
                        {EMPLOYEE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employeeType && (
                      <p className="text-sm text-destructive">{errors.employeeType.message}</p>
                    )}
                  </div>

                  {/* New Employment Status */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-status" className="text-foreground">
                      New Employment Status
                    </Label>
                    <Select
                      value={watch('employmentStatus') || 'no-change'}
                      onValueChange={(value) =>
                        setValue(
                          'employmentStatus',
                          value as '' | 'regular' | 'no-change' | 'probational' | undefined
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="edit-status"
                        className="border-border focus:border-primary focus:ring-primary"
                      >
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          <SelectValue
                            placeholder={`Current: ${(user as any).employmentStatus || 'Not set'}`}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">
                          No change (keep {(user as any).employmentStatus || 'current'})
                        </SelectItem>
                        {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employmentStatus && (
                      <p className="text-sm text-destructive">{errors.employmentStatus.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-foreground">
                  New Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Textarea
                    id="edit-address"
                    placeholder={`Current: ${(user as any).address || 'Not set'}`}
                    className="pl-10 min-h-20 resize-none border-border focus:border-primary focus:ring-primary"
                    disabled={isPending}
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              {/* Government IDs */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">Government IDs (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* TIN */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-tin" className="text-foreground">
                      New TIN
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-tin"
                        placeholder={`Current: ${(user as any).tin || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('tin')}
                      />
                    </div>
                    {errors.tin && <p className="text-sm text-destructive">{errors.tin.message}</p>}
                  </div>

                  {/* SSS */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-sss" className="text-foreground">
                      New SSS
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-sss"
                        placeholder={`Current: ${(user as any).sss || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('sss')}
                      />
                    </div>
                    {errors.sss && <p className="text-sm text-destructive">{errors.sss.message}</p>}
                  </div>

                  {/* Pag-IBIG */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-pagibig" className="text-foreground">
                      New Pag-IBIG
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-pagibig"
                        placeholder={`Current: ${(user as any).pagibig || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary"
                        disabled={isPending}
                        {...register('pagibig')}
                      />
                    </div>
                    {errors.pagibig && (
                      <p className="text-sm text-destructive">{errors.pagibig.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  className="flex-1 border-border cursor-pointer bg-accent text-primary hover:bg-primary/10 hover:text-primary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
