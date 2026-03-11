/**
 * Add User Modal Component
 * =========================
 * Dialog modal for creating new users with comprehensive form validation.
 * Includes Philippine-specific validations for government IDs and contact numbers.
 * Uses react-hook-form with Zod schema and useTransition for smooth state updates.
 */

'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AddUserInput, EmployeeTypeValue } from '@/types';
import { addUserSchema } from '@/zod/schemas';
import { RequiredLabel } from '@/components/admin/required-label';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

type AddUserFormValues = AddUserInput;

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
  { value: 'probational', label: 'Probationary' },
  { value: 'regular', label: 'Regular' },
] as const;

export function AddUserModal({ open, onOpenChange, onAddUser }: AddUserModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      employeeType: 'regular',
      employmentStatus: 'probational',
      companyId: 'Not implemented yet',
      employeeId: '',
      contactNumber: '',
      address: '',
      tin: '',
      sss: '',
      pagibig: '',
    },
  });

  const onSubmit = (data: AddUserFormValues) => {
    startTransition(async () => {
      await onAddUser(data as AddUserInput);
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
      <DialogContent className="bg-card w-[95vw] max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto max-h-[90vh] p-0 rounded-xl shadow-xl flex flex-col border-2 border-[#f47812]/20">
        <DialogHeader className="px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 lg:pt-7 pb-2 lg:pb-3 border-b border-[#f47812]/15 shrink-0">
          <DialogTitle className="text-base sm:text-xl lg:text-2xl font-bold text-foreground">
            Add New User
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm lg:text-base text-gray-600 hidden sm:block">
            Create a new employee account with complete details and Philippine government IDs
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:block">
          <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-6 lg:space-y-8"
              id="add-user-form"
            >
              {/* Collapsible Sections */}
              <Accordion
                type="multiple"
                defaultValue={['basic', 'employment', 'address', 'ids']}
                className="space-y-3 sm:space-y-4 lg:space-y-5"
              >
                {/* Basic Information */}
                <AccordionItem
                  value="basic"
                  className="border border-[#f47812]/15 rounded-lg px-3 sm:px-4 bg-background"
                >
                  <AccordionTrigger className="text-xs sm:text-sm lg:text-base font-semibold text-foreground hover:no-underline py-3">
                    Basic Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 pt-3 sm:pt-4 lg:pt-6">
                      {/* Full Name */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <RequiredLabel htmlFor="add-name" filled={!!watch('name')?.trim()}>
                          <span className="text-xs sm:text-sm lg:text-base">Full Name</span>
                        </RequiredLabel>
                        <div className="relative">
                          <User className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                          <Input
                            id="add-name"
                            placeholder="At least 2 characters"
                            className={`pl-8 sm:pl-10 text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 ${
                              !watch('name')?.trim()
                                ? 'border-destructive/50 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]'
                                : ''
                            }`}
                            disabled={isPending}
                            {...register('name')}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-xs sm:text-sm lg:text-base text-destructive">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <RequiredLabel htmlFor="add-email" filled={!!watch('email')?.trim()}>
                          <span className="text-xs sm:text-sm lg:text-base">Email Address</span>
                        </RequiredLabel>
                        <div className="relative">
                          <Mail className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                          <Input
                            id="add-email"
                            type="email"
                            placeholder="Valid email address"
                            className={`pl-8 sm:pl-10 text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 ${
                              !watch('email')?.trim()
                                ? 'border-destructive/50 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]'
                                : ''
                            }`}
                            disabled={isPending}
                            {...register('email')}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-xs sm:text-sm lg:text-base text-destructive">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* Company ID */}
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label
                          htmlFor="add-company-id"
                          className="text-xs sm:text-sm lg:text-base text-gray-600 hidden sm:block"
                        >
                          Company ID (Not Implemented)
                        </Label>
                        <Label
                          htmlFor="add-company-id"
                          className="text-xs lg:text-base text-gray-600 block sm:hidden"
                        >
                          Company ID
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-gray-400" />
                          <Input
                            id="add-company-id"
                            placeholder="Not implemented yet"
                            className="pl-10 border-border bg-background/50 text-gray-600 placeholder:text-gray-400 text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11"
                            disabled={true}
                            {...register('companyId')}
                          />
                        </div>
                        {errors.companyId && (
                          <p className="text-sm text-destructive">{errors.companyId.message}</p>
                        )}
                      </div>

                      {/* Employee ID */}
                      <div className="space-y-2">
                        <Label htmlFor="add-employee-id" className="text-foreground">
                          Employee ID (Optional)
                        </Label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                          <Input
                            id="add-employee-id"
                            placeholder="e.g., EMP-2024-001"
                            className="pl-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400"
                            disabled={isPending}
                            {...register('employeeId')}
                          />
                        </div>
                        {errors.employeeId && (
                          <p className="text-sm text-destructive">{errors.employeeId.message}</p>
                        )}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="add-password" filled={!!watch('password')?.trim()}>
                          Password
                        </RequiredLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                          <Input
                            id="add-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            className={`pl-10 pr-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 ${
                              !watch('password')?.trim()
                                ? 'border-destructive/50 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]'
                                : ''
                            }`}
                            disabled={isPending}
                            {...register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-foreground transition-colors"
                            disabled={isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-destructive">{errors.password.message}</p>
                        )}
                      </div>

                      {/* Contact Number */}
                      <div className="space-y-2">
                        <RequiredLabel
                          htmlFor="add-contact"
                          filled={!!watch('contactNumber')?.trim()}
                        >
                          Contact Number
                        </RequiredLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                          <Input
                            id="add-contact"
                            placeholder="09XX-XXX-XXXX format"
                            className={`pl-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 ${
                              !watch('contactNumber')?.trim()
                                ? 'border-destructive/50 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]'
                                : ''
                            }`}
                            disabled={isPending}
                            {...register('contactNumber')}
                          />
                        </div>
                        {errors.contactNumber && (
                          <p className="text-sm text-destructive">{errors.contactNumber.message}</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Employment Details */}
                <AccordionItem
                  value="employment"
                  className="border border-[#f47812]/15 rounded-lg px-3 sm:px-4 lg:px-5 bg-background"
                >
                  <AccordionTrigger className="text-xs sm:text-sm lg:text-base font-semibold text-foreground hover:no-underline">
                    Employment Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 pt-3 sm:pt-4 lg:pt-6">
                      {/* Employee Type */}
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="add-type" filled={!!watch('employeeType')}>
                          <span className="text-xs sm:text-sm lg:text-base">Employee Type</span>
                        </RequiredLabel>
                        <Select
                          value={watch('employeeType') || 'regular'}
                          onValueChange={(value: EmployeeTypeValue) =>
                            setValue('employeeType', value)
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger
                            id="add-type"
                            className="border-border bg-white focus:border-accent focus:ring-accent"
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-accent" />
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

                      {/* Employment Status */}
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="add-status" filled={!!watch('employmentStatus')}>
                          <span className="text-xs sm:text-sm lg:text-base">Employment Status</span>
                        </RequiredLabel>
                        <Select
                          value={watch('employmentStatus') || 'probational'}
                          onValueChange={(value) =>
                            setValue('employmentStatus', value as 'probational' | 'regular', {
                              shouldValidate: true,
                            })
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger
                            id="add-status"
                            className="border-border bg-white focus:border-accent focus:ring-accent"
                          >
                            <div className="flex items-center gap-2">
                              <BadgeCheck className="h-4 w-4 text-accent" />
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
                          <p className="text-sm text-destructive">
                            {errors.employmentStatus.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Address */}
                <AccordionItem
                  value="address"
                  className="border border-[#f47812]/15 rounded-lg px-3 sm:px-4 lg:px-5 bg-background"
                >
                  <AccordionTrigger className="text-xs sm:text-sm lg:text-base font-semibold text-foreground hover:no-underline">
                    Home Address
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-3 sm:pt-4 lg:pt-6">
                      <RequiredLabel htmlFor="add-address" filled={!!watch('address')?.trim()}>
                        <span className="text-xs sm:text-sm lg:text-base">
                          Address (10-250 characters)
                        </span>
                      </RequiredLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                        <Textarea
                          id="add-address"
                          placeholder="Complete address: Street, Barangay, City, Province (minimum 50 characters)"
                          className={`pl-10 min-h-20 lg:min-h-24 resize-none border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 text-sm sm:text-base lg:text-lg ${
                            !watch('address')?.trim()
                              ? 'border-destructive/50 shadow-[0_0_0_1px_hsl(var(--destructive)/0.5)]'
                              : ''
                          }`}
                          disabled={isPending}
                          {...register('address')}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-xs sm:text-sm lg:text-base text-destructive">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Government IDs */}
                <AccordionItem
                  value="ids"
                  className="border border-[#f47812]/15 rounded-lg px-3 sm:px-4 lg:px-5 bg-background"
                >
                  <AccordionTrigger className="text-xs sm:text-sm lg:text-base font-semibold text-foreground hover:no-underline">
                    Philippine Government IDs (Optional)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 pt-3 sm:pt-4 lg:pt-6">
                      {/* TIN */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="add-tin"
                          className="text-xs sm:text-sm lg:text-base text-foreground"
                        >
                          TIN (Optional)
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                          <Input
                            id="add-tin"
                            placeholder="9 digits"
                            className="pl-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11"
                            disabled={isPending}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/\D/g, '');
                            }}
                            {...register('tin')}
                          />
                        </div>
                        {errors.tin && (
                          <p className="text-xs sm:text-sm lg:text-base text-destructive">
                            {errors.tin.message}
                          </p>
                        )}
                      </div>

                      {/* SSS */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="add-sss"
                          className="text-xs sm:text-sm lg:text-base text-foreground"
                        >
                          SSS (Optional)
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                          <Input
                            id="add-sss"
                            placeholder="10 digits"
                            className="pl-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400 text-sm sm:text-base lg:text-lg h-9 sm:h-10 lg:h-11"
                            disabled={isPending}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/\D/g, '');
                            }}
                            {...register('sss')}
                          />
                        </div>
                        {errors.sss && (
                          <p className="text-xs sm:text-sm lg:text-base text-destructive">
                            {errors.sss.message}
                          </p>
                        )}
                      </div>

                      {/* Pag-IBIG */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="add-pagibig"
                          className="text-xs sm:text-sm lg:text-base text-foreground"
                        >
                          Pag-IBIG (Optional)
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                          <Input
                            id="add-pagibig"
                            placeholder="12 digits"
                            className="pl-10 border-border bg-white focus:border-accent focus:ring-accent placeholder:text-gray-400"
                            disabled={isPending}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/\D/g, '');
                            }}
                            {...register('pagibig')}
                          />
                        </div>
                        {errors.pagibig && (
                          <p className="text-sm text-destructive">{errors.pagibig.message}</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </div>
        </ScrollArea>

        {/* Footer Actions - Outside ScrollArea */}
        <div className="px-6 py-4 border-t border-[#f47812]/15 shrink-0 bg-card">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="submit"
              form="add-user-form"
              disabled={isPending || !isValid}
              className="flex-1 bg-foreground cursor-pointer text-white hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 ease-in-out shadow-sm/25"
            >
              {isPending ? 'Adding...' : 'Add User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="flex-1 cursor-pointer border-zinc-300 bg-white text-foreground hover:bg-gray-100 hover:text-foreground transition-all duration-500 ease-in-out"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
