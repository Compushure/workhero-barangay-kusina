/**
 * Edit User Modal Component
 * ==========================
 * Dialog modal for editing existing users with comprehensive fields.
 * Email is read-only; all other fields are optional - blank fields will not be updated.
 * Includes Philippine-specific validations for government IDs and contact numbers.
 */

'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User, EditUserInput, EmployeeTypeValue } from '@/types';
import { editUserSchema } from '@/zod/schemas';
import { ImageCropUpload } from '@/components/admin/image-crop-upload';
import { RequiredLabel } from '@/components/admin/required-label';
import { createClient } from '@/lib/supabase/client';
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
  Eye,
  EyeOff,
  Pencil,
  X,
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
  onImageUpload?: (userId: string, file: File, userName: string) => Promise<void>;
  onImageClear?: (userId: string, userName: string) => Promise<void>;
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

export function EditUserModal({ open, onOpenChange, user, onEditUser, onImageUpload, onImageClear }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [imageKey, setImageKey] = useState(Date.now());
  
  // Track which fields are activated for editing
  const [activeFields, setActiveFields] = useState<{
    name: boolean;
    password: boolean;
    contactNumber: boolean;
    address: boolean;
    tin: boolean;
    sss: boolean;
    pagibig: boolean;
  }>({
    name: false,
    password: false,
    contactNumber: false,
    address: false,
    tin: false,
    sss: false,
    pagibig: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema) as any,
    mode: 'onChange',
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
        employmentStatus: 'no-change',
        contactNumber: '',
        address: '',
        tin: '',
        sss: '',
        pagibig: '',
      });
      // Reset all active fields
      setActiveFields({
        name: false,
        password: false,
        contactNumber: false,
        address: false,
        tin: false,
        sss: false,
        pagibig: false,
      });
      setSelectedProfileImage(null);
      setImageKey(Date.now());
    }
  }, [user, open, reset]);

  // Listen for profile image deletion events to update the preview
  useEffect(() => {
    const handleImageDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string; timestamp: number }>;
      if (customEvent.detail.userId === user.id) {
        console.log('Profile image deleted, updating imageKey in edit modal');
        setImageKey(Date.now());
      }
    };

    window.addEventListener('profile-image-deleted', handleImageDeleted);

    return () => {
      window.removeEventListener('profile-image-deleted', handleImageDeleted);
    };
  }, [user.id]);

  // Toggle field activation
  const toggleField = (field: keyof typeof activeFields) => {
    setActiveFields((prev) => {
      const newState = { ...prev, [field]: !prev[field] };
      
      // When activating, populate with current user value
      if (newState[field]) {
        switch (field) {
          case 'name':
            setValue('name', user.name);
            break;
          case 'contactNumber':
            setValue('contactNumber', user.contactNumber || '');
            break;
          case 'address':
            setValue('address', user.address || '');
            break;
          case 'tin':
            setValue('tin', user.tin || '');
            break;
          case 'sss':
            setValue('sss', user.sss || '');
            break;
          case 'pagibig':
            setValue('pagibig', user.pagibig || '');
            break;
          // Password stays empty for security
          case 'password':
            setValue('password', '');
            break;
        }
      } else {
        // Clear the field value when deactivating
        setValue(field, '');
      }
      
      return newState;
    });
  };

  // Batch operations handlers
  const handleEditAll = () => {
    setActiveFields({
      name: true,
      password: true,
      contactNumber: true,
      address: true,
      tin: true,
      sss: true,
      pagibig: true,
    });
  };

  const handleClearAll = () => {
    setActiveFields({
      name: false,
      password: false,
      contactNumber: false,
      address: false,
      tin: false,
      sss: false,
      pagibig: false,
    });
    // Reset form values
    setValue('name', '');
    setValue('password', '');
    setValue('contactNumber', '');
    setValue('address', '');
    setValue('tin', '');
    setValue('sss', '');
    setValue('pagibig', '');
  };

  // Check if any field is active and has changes
  const hasActiveChanges = () => {
    const values = watch();
    const normalize = (v?: string | null) => (v ?? '').trim();
    
    if (activeFields.name && normalize(values.name)) return true;
    if (activeFields.password && normalize(values.password)) return true;
    if (activeFields.contactNumber && normalize(values.contactNumber)) return true;
    if (activeFields.address && normalize(values.address)) return true;
    if (activeFields.tin && normalize(values.tin)) return true;
    if (activeFields.sss && normalize(values.sss)) return true;
    if (activeFields.pagibig && normalize(values.pagibig)) return true;
    if (values.employeeType !== 'no-change') return true;
    if (values.employmentStatus !== 'no-change') return true;
    if (selectedProfileImage) return true;
    
    return false;
  };

  const getProfileUrl = useCallback((userId: string) => {
    const supabase = createClient();
    const { data } = supabase.storage.from('employees').getPublicUrl(`${userId}/profile.png`);
    return data.publicUrl + `?v=${imageKey}`;
  }, [imageKey]);

  const handleImageSelect = async (file: File) => {
    setSelectedProfileImage(file);
  };

  const onSubmit = (data: EditUserInput) => {
    // Only include fields that are activated
    const filteredData: Partial<EditUserInput> = {};
    
    if (activeFields.name && data.name) filteredData.name = data.name;
    if (activeFields.password && data.password) filteredData.password = data.password;
    if (activeFields.contactNumber && data.contactNumber) filteredData.contactNumber = data.contactNumber;
    if (activeFields.address && data.address) filteredData.address = data.address;
    if (activeFields.tin && data.tin) filteredData.tin = data.tin;
    if (activeFields.sss && data.sss) filteredData.sss = data.sss;
    if (activeFields.pagibig && data.pagibig) filteredData.pagibig = data.pagibig;
    if (data.employeeType && data.employeeType !== 'no-change') filteredData.employeeType = data.employeeType;
    if (data.employmentStatus && data.employmentStatus !== 'no-change') filteredData.employmentStatus = data.employmentStatus;

    if (data.employmentStatus && data.employmentStatus !== 'no-change') filteredData.employmentStatus = data.employmentStatus;

    startTransition(async () => {
      await onEditUser(user.id, filteredData as EditUserInput);
      onOpenChange(false);
    });
  };

  const selectedType = watch('employeeType');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme bg-primary-foreground w-[95vw] max-w-2xl mx-auto max-h-[90vh] p-0 rounded-xl shadow-xl flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-primary">Edit User</DialogTitle>
              <DialogDescription className="text-sm text-foreground/80">
                Leave fields blank to keep current values. Only filled fields will be updated.
              </DialogDescription>
            </div>
            {/* Batch Operation Buttons */}
            <div className="flex gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditAll}
                className="whitespace-nowrap"
              >
                Edit All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="whitespace-nowrap"
              >
                Clear All
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
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
            <div className="p-3 bg-card rounded-lg border border-border text-sm space-y-1 mt-4">
              <p className="text-xs text-primary font-medium">Current Values:</p>
              <p>
                <span className="text-foreground/70">Name:</span> {user.name}
              </p>
              <p>
                <span className="text-foreground/70">Role:</span> {user.employeeType}
              </p>
            </div>

            {/* Profile Picture */}
            <div className="mt-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-primary mb-4">Profile Picture</h3>
              <ImageCropUpload
                currentImageUrl={getProfileUrl(user.id)}
                userName={user.name}
                userId={user.id}
                onImageSelect={handleImageSelect}
                onImageUpload={onImageUpload}
                onImageClear={onImageClear}
                onImageClearLocal={() => setSelectedProfileImage(null)}
                disabled={isPending}
              />
              {selectedProfileImage && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  New image selected: {selectedProfileImage.name}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6" id="edit-user-form">
              {/* Collapsible Sections */}
              <Accordion type="multiple" defaultValue={["basic", "employment", "address", "ids"]} className="space-y-4">
              {/* Basic Information */}
              <AccordionItem value="basic" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
                  Basic Information (Optional)
                </AccordionTrigger>
                <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {/* New Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-name" className="text-foreground">
                        New Name
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('name')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.name
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.name ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.name ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-name"
                        placeholder={`Current: ${user.name}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.name}
                        {...register('name')}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-password" className="text-foreground">
                        New Password (Optional)
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('password')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.password
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.password ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.password ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank to keep current (min 6 chars)"
                        className="pl-10 pr-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.password}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        disabled={isPending || !activeFields.password}
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

                  {/* New Contact Number */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-contact" className="text-foreground">
                        New Contact Number
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('contactNumber')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.contactNumber
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.contactNumber ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.contactNumber ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-contact"
                        placeholder={`Current: ${(user as any).contactNumber || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.contactNumber}
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
              <AccordionItem value="employment" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
                  Employment Details (Optional)
                </AccordionTrigger>
                <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                </AccordionContent>
              </AccordionItem>

              {/* Address */}
              <AccordionItem value="address" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
                  Home Address (Optional)
                </AccordionTrigger>
                <AccordionContent>
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-address" className="text-foreground">
                    New Address (10-250 characters)
                  </Label>
                  <button
                    type="button"
                    onClick={() => toggleField('address')}
                    className={`p-1 rounded-md transition-colors ${
                      activeFields.address
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    title={activeFields.address ? 'Deactivate field' : 'Activate field'}
                  >
                    {activeFields.address ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary" />
                  <Textarea
                    id="edit-address"
                    placeholder={`Current: ${(user as any).address || 'Not set'}`}
                    className="pl-10 min-h-20 resize-none border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                    disabled={isPending || !activeFields.address}
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
                </AccordionContent>
              </AccordionItem>

              {/* Government IDs */}
              <AccordionItem value="ids" className="border rounded-lg px-4">
                <AccordionTrigger className="text-sm font-semibold text-primary hover:no-underline">
                  Government IDs (Optional)
                </AccordionTrigger>
                <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {/* TIN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-tin" className="text-foreground">
                        New TIN
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('tin')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.tin
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.tin ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.tin ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-tin"
                        placeholder={`Current: ${(user as any).tin || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.tin}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/\D/g, '');
                        }}
                        {...register('tin')}
                      />
                    </div>
                    {errors.tin && <p className="text-sm text-destructive">{errors.tin.message}</p>}
                  </div>

                  {/* SSS */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-sss" className="text-foreground">
                        New SSS
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('sss')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.sss
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.sss ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.sss ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-sss"
                        placeholder={`Current: ${(user as any).sss || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.sss}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/\D/g, '');
                        }}
                        {...register('sss')}
                      />
                    </div>
                    {errors.sss && <p className="text-sm text-destructive">{errors.sss.message}</p>}
                  </div>

                  {/* Pag-IBIG */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-pagibig" className="text-foreground">
                        New Pag-IBIG
                      </Label>
                      <button
                        type="button"
                        onClick={() => toggleField('pagibig')}
                        className={`p-1 rounded-md transition-colors ${
                          activeFields.pagibig
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                        title={activeFields.pagibig ? 'Deactivate field' : 'Activate field'}
                      >
                        {activeFields.pagibig ? <X className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <Input
                        id="edit-pagibig"
                        placeholder={`Current: ${(user as any).pagibig || 'Not set'}`}
                        className="pl-10 border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
                        disabled={isPending || !activeFields.pagibig}
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

        {/* Footer outside ScrollArea to avoid overflow issues */}
        <div className="px-6 py-4 border-t border-border shrink-0 bg-primary-foreground">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="submit"
              form="edit-user-form"
              disabled={isPending || !hasActiveChanges()}
              className="flex-1 bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
