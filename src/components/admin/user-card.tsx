

'use client'

import { useState } from 'react'
import type { EmployeeTypeValue, User } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Award as IdCard,
  BadgeCheck,
  Building2,
  Calendar,
  ChevronDown,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Edit2,
  UserIcon,
} from 'lucide-react'
import { format } from 'date-fns'

type UserWithExtras = User & {
  employeeId?: string
  companyId?: string
  employmentStatus?: 'probationary' | 'regular' | string
  contactNumber?: string
  address?: string
  tin?: string
  sss?: string
  pagibig?: string
  createdAt?: string | Date
}

interface UserCardProps {
  user: UserWithExtras
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

const EMPLOYEE_TYPE_STYLES: Record<EmployeeTypeValue, string> = {
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  hr: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  regular: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const EMPLOYMENT_STATUS_STYLES: Record<string, string> = {
  probationary: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  regular: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
}

function formatDate(value?: Date | string) {
  if (!value) return 'N/A'
  const parsed = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(parsed.getTime()) ? 'N/A' : format(parsed, 'PPP')
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const employmentStatus = user.employmentStatus || 'unknown'
  const employmentStatusClass =
    EMPLOYMENT_STATUS_STYLES[employmentStatus] || 'bg-muted text-foreground'
  const dateCreated = formatDate(user.createdAt || user.date_added)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{user.name}</p>
                  {user.employeeId ? (
                    <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                      {user.employeeId}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex gap-2 mt-2 sm:hidden">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      EMPLOYEE_TYPE_STYLES[user.employeeType]
                    }`}
                  >
                    {user.employeeType}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${employmentStatusClass}`}
                  >
                    {employmentStatus}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    EMPLOYEE_TYPE_STYLES[user.employeeType]
                  }`}
                >
                  {user.employeeType}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${employmentStatusClass}`}
                >
                  {employmentStatus}
                </span>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ml-2 shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border pt-4 space-y-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Basic Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">{user.contactNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Employment Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Company ID</p>
                    <p className="text-sm font-medium">{user.companyId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IdCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium">{user.employeeId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-medium capitalize">{employmentStatus}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Date Created</p>
                    <p className="text-sm font-medium">{dateCreated}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Address</p>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm">{user.address || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Philippine Government IDs</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">TIN</p>
                    <p className="text-sm font-medium font-mono">{user.tin || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">SSS</p>
                    <p className="text-sm font-medium font-mono">{user.sss || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Pag-IBIG</p>
                    <p className="text-sm font-medium font-mono">{user.pagibig || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Edit2 className="h-4 w-4" />
                Edit User
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
