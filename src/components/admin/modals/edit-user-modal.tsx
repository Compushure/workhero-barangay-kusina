/**
 * Edit User Modal Component
 * ==========================
 * Dialog modal for editing existing users.
 * Email is read-only; allows updating name, password, and employee type.
 */

'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User, EditUserInput, EmployeeTypeValue } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserIcon, Lock, Briefcase, Mail } from 'lucide-react'

const EditUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)),
      'Password must be 8+ chars with 1 uppercase and 1 number'
    ),
  employeeType: z.enum(['manager', 'hr', 'regular']),
})

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
  onEditUser: (userId: string, data: EditUserInput) => Promise<boolean>
}

const EMPLOYEE_TYPES = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'regular', label: 'Regular' },
] as const

export function EditUserModal({
  open,
  onOpenChange,
  user,
  onEditUser,
}: EditUserModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditUserInput>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      name: user.name,
      password: '',
      employeeType: user.employeeType,
    },
  })

  // Reset form when user changes
  useEffect(() => {
    if (open) {
      reset({
        name: user.name,
        password: '',
        employeeType: user.employeeType,
      })
    }
  }, [user, open, reset])

  const onSubmit = (data: EditUserInput) => {
    startTransition(async () => {
      await onEditUser(user.id, data)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information (email cannot be changed)
          </DialogDescription>
        </DialogHeader>

        {/* Read-only email display */}
        <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Email (read-only)</p>
            <p className="text-sm font-medium truncate">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-name"
                placeholder="Enter user name"
                className="pl-10"
                disabled={isPending}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Employee Type</Label>
            <Select
              value={watch('employeeType')}
              onValueChange={(value: EmployeeTypeValue) =>
                setValue('employeeType', value)
              }
              disabled={isPending}
            >
              <SelectTrigger id="edit-type">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select employee type" />
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
              <p className="text-sm text-destructive">
                {errors.employeeType.message}
              </p>
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
  )
}
