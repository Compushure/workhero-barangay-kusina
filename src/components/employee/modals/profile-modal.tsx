'use client';

import { useState } from 'react';
import { User, X, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserWithExtras } from '@/types';
import { maskSensitiveId } from '@/lib/format';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithExtras | null;
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const [imageError, setImageError] = useState(false);
  const [showUnmaskedIds, setShowUnmaskedIds] = useState(false);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto [&>button]:hidden">
        {/* Custom Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#730202] focus:ring-offset-2 z-50"
        >
          <X className="h-5 w-5 text-[#730202]" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#730202]">
            My Profile
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            View your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="h-32 w-32 bg-[#f2e1c9] rounded-full flex items-center justify-center overflow-hidden border-4 border-[#730202]/10">
              {user.profilePictureUrl && !imageError ? (
                <img
                  src={user.profilePictureUrl}
                  alt={`${user.name} profile picture`}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageError(true)}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.2s' }}
                />
              ) : (
                <User className="h-16 w-16 text-[#730202]/40" />
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#730202] uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <p className="text-base font-semibold text-[#730202]">{user.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <p className="text-base font-semibold text-[#730202] break-all">{user.email}</p>
              </div>
              {user.employeeId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-base font-semibold text-[#730202]">{user.employeeId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-[#730202] uppercase tracking-wide">
              Employment Details
            </h3>
            <div className="space-y-3">
              {user.employmentStatus && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Employment Status</label>
                  <div>
                    <Badge 
                      variant={user.employmentStatus === 'regular' ? 'default' : 'secondary'}
                      className="font-semibold capitalize"
                    >
                      {user.employmentStatus}
                    </Badge>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Date Added</label>
                <p className="text-base font-semibold text-[#730202]">
                  {formatDate(user.date_added || user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(user.contactNumber || user.address) && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-[#730202] uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="space-y-3">
                {user.contactNumber && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-base font-semibold text-[#730202]">{user.contactNumber}</p>
                  </div>
                )}
                {user.address && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Home Address</label>
                    <p className="text-base font-semibold text-[#730202]">{user.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Government IDs */}
          {(user.tin || user.sss || user.pagibig) && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#730202] uppercase tracking-wide">
                  Government IDs
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUnmaskedIds(!showUnmaskedIds)}
                  className="h-8 px-2 text-[#730202] hover:bg-[#f2e1c9]"
                >
                  {showUnmaskedIds ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="ml-1 text-xs">{showUnmaskedIds ? 'Hide' : 'Show'}</span>
                </Button>
              </div>
              <div className="space-y-3">
                {user.tin && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">TIN</label>
                    <p className="text-base font-semibold text-[#730202] font-mono">
                      {showUnmaskedIds ? user.tin : maskSensitiveId(user.tin)}
                    </p>
                  </div>
                )}
                {user.sss && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">SSS</label>
                    <p className="text-base font-semibold text-[#730202] font-mono">
                      {showUnmaskedIds ? user.sss : maskSensitiveId(user.sss)}
                    </p>
                  </div>
                )}
                {user.pagibig && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Pag-IBIG</label>
                    <p className="text-base font-semibold text-[#730202] font-mono">
                      {showUnmaskedIds ? user.pagibig : maskSensitiveId(user.pagibig)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
