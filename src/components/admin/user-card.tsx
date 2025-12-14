/**
 * User Card Component
 * ====================
 * Collapsible card displaying individual user information.
 * Shows summary (name, email, type) collapsed; expands for full details.
 * Provides edit/delete action buttons in expanded state.
 */

'use client';

import { useState } from 'react';
import type { User, EmployeeTypeValue } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Edit2, Trash2, ChevronDown, UserIcon, Mail, Calendar, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const EMPLOYEE_TYPE_STYLES: Record<EmployeeTypeValue, string> = {
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  hr: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  regular: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden border border-border hover:shadow-md transition-shadow">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <span
                className={`hidden sm:inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  EMPLOYEE_TYPE_STYLES[user.employeeType]
                }`}
              >
                {user.employeeType}
              </span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ml-2 shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border pt-4">
            {/* Mobile badge */}
            <div className="sm:hidden mb-4">
              <span
                className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  EMPLOYEE_TYPE_STYLES[user.employeeType]
                }`}
              >
                {user.employeeType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Password</p>
                  <p className="text-sm text-muted-foreground">
                    You can only change password not view it.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Date Created</p>
                  <p className="text-sm font-medium">
                    {user.date_added && !Number.isNaN(user.date_added.getTime?.())
                      ? format(user.date_added, 'PPP')
                      : Date.now().toString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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
  );
}
