/**
 * Add User Modal Component
 * =========================
 * Dialog modal for creating new users with comprehensive form validation.
 * Includes Philippine-specific validations for government IDs and contact numbers.
 * Uses react-hook-form with Zod schema and useTransition for smooth state updates.
 */

'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AddUserInput, EmployeeTypeValue } from '@/types';
import { addUserSchema } from '@/zod/schemas';
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
  User,
  Mail,
  Lock,
  Briefcase,
  Building2,
  Award as IdCard,
  Phone,
  MapPin,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';

type AddUserFormValues = AddUserInput & {
  companyId?: string;
  employeeId?: string;
  contactNumber?: string;
  employmentStatus?: string;
  address?: string;
  tin?: string;
  sss?: string;
  pagibig?: string;
};

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (data: AddUserInput) => Promise<void>;
}

const EMPLOYEE_TYPES = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'regular', label: 'Regular Employee' },
] as const;

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'probationary', label: 'Probationary' },
  { value: 'regular', label: 'Regular' },
] as const;

export function AddUserModal({ open, onOpenChange, onAddUser }: AddUserModalProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      employeeType: 'regular',
      employmentStatus: 'probationary',
      companyId: '',
      employeeId: '',
      contactNumber: '',
      address: '',
      tin: '',
      sss: '',
      pagibig: '',
    },
  });

  const onSubmit = (data: AddUserInput) => {
    startTransition(async () => {
      await onAddUser(data);
      reset();
      onOpenChange(false);
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new employee account with complete details and Philippine government IDs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-name"
                      placeholder="Juan Dela Cruz"
                      className="pl-10"
                      disabled={isPending}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-email"
                      type="email"
                      placeholder="juan@company.com"
                      className="pl-10"
                      disabled={isPending}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-company-id">Company ID *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-company-id"
                      placeholder="COMP-001"
                      className="pl-10"
                      disabled={isPending}
                      {...register('companyId')}
                    />
                  </div>
                  {errors.companyId && (
                    <p className="text-sm text-destructive">{errors.companyId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-employee-id">Employee ID *</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-employee-id"
                      placeholder="EMP-2024-001"
                      className="pl-10"
                      disabled={isPending}
                      {...register('employeeId')}
                    />
                  </div>
                  {errors.employeeId && (
                    <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-password"
                      type="password"
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                  <Label htmlFor="add-contact">Contact Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-contact"
                      placeholder="+639171234567 or 09171234567"
                      className="pl-10"
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

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Employment Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-type">Employee Type *</Label>
                  <Select
                    value={watch('employeeType')}
                    onValueChange={(value: EmployeeTypeValue) => setValue('employeeType', value)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="add-type">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="add-status">Employment Status *</Label>
                  <Select
                    value={watch('employmentStatus')}
                    onValueChange={(value) => setValue('employmentStatus', value)}
                    disabled={isPending}
                  >
                    <SelectTrigger id="add-status">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="add-address">Home Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="add-address"
                  placeholder="Complete address (Street, Barangay, City, Province)"
                  className="pl-10 min-h-20 resize-none"
                  disabled={isPending}
                  {...register('address')}
                />
              </div>
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Philippine Government IDs</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-tin">TIN *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-tin"
                      placeholder="123-456-789-000"
                      className="pl-10"
                      disabled={isPending}
                      {...register('tin')}
                    />
                  </div>
                  {errors.tin && <p className="text-sm text-destructive">{errors.tin.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-sss">SSS *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-sss"
                      placeholder="12-3456789-0"
                      className="pl-10"
                      disabled={isPending}
                      {...register('sss')}
                    />
                  </div>
                  {errors.sss && <p className="text-sm text-destructive">{errors.sss.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-pagibig">Pag-IBIG *</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="add-pagibig"
                      placeholder="1234-5678-9012"
                      className="pl-10"
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

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
