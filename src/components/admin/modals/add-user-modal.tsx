/**
 * Add User Modal Component
 * =========================
 * Dialog modal for creating new users with form validation.
 * Uses react-hook-form with Zod schema and useTransition for smooth state updates.
 */

'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AddUserInput, EmployeeTypeValue } from '@/types'
import { addUserSchema } from '@/zod/schemas'
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
import { User, Mail, Lock, Briefcase } from 'lucide-react'

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddUser: (data: AddUserInput) => Promise<void>
}

const EMPLOYEE_TYPES = [
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'regular', label: 'Regular' },
] as const

export function AddUserModal({
  open,
  onOpenChange,
  onAddUser,
}: AddUserModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      employeeType: 'regular',
    },
  })

  const onSubmit = (data: AddUserInput) => {
    startTransition(async () => {
      await onAddUser(data)
      reset()
      onOpenChange(false)
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with the required details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="add-name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="add-name"
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
            <Label htmlFor="add-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="add-email"
                type="email"
                placeholder="Enter user email"
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
            <Label htmlFor="add-password">Password</Label>
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
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-type">Employee Type</Label>
            <Select
              value={watch('employeeType')}
              onValueChange={(value: EmployeeTypeValue) =>
                setValue('employeeType', value)
              }
              disabled={isPending}
            >
              <SelectTrigger id="add-type">
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
      </DialogContent>
    </Dialog>
  )
}
