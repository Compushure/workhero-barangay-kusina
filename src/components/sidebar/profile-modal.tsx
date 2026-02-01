'use client';

import { useState, useMemo } from 'react';
import { User, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserWithExtras } from '@/types';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithExtras | null;
}

export function ProfileModal({ open, onOpenChange, user }: ProfileModalProps) {
  const [imageError, setImageError] = useState(false);

  // Add cache-busting timestamp to image URL to force refresh when profile picture changes
  const imageUrlWithCacheBust = useMemo(() => {
    if (!user?.profilePictureUrl) return undefined;
    const separator = user.profilePictureUrl.includes('?') ? '&' : '?';
    return `${user.profilePictureUrl}${separator}t=${Date.now()}`;
  }, [user?.profilePictureUrl]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-125 rounded-2xl p-4 sm:p-6 [&>button]:hidden">
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
            Quick view of your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Profile Picture */}
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-[#f2e1c9] rounded-full flex items-center justify-center overflow-hidden border-4 border-[#730202]/10 transition-transform duration-300 hover:scale-105">
              {imageUrlWithCacheBust && !imageError ? (
                <img
                  src={imageUrlWithCacheBust}
                  alt={`${user.name} profile picture`}
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setImageError(true)}
                  onLoad={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              ) : (
                <User className="h-12 w-12 text-[#730202]/40" />
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <p className="text-base font-semibold text-[#730202]">{user.name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <p className="text-sm font-semibold text-[#730202] break-all">{user.email}</p>
              </div>
              {user.employeeId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-base font-semibold text-[#730202]">{user.employeeId}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <div>
                  <Badge variant="default" className="font-semibold capitalize">
                    {user.employeeType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* See Full Profile Button */}
          <div className="pt-4 border-t border-border">
            <Link href={`/profile/${user.id}`} onClick={() => onOpenChange(false)}>
              <Button
                className="w-full bg-[#730202] hover:bg-[#8b0003] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                size="lg"
              >
                <span>See Full Profile Details</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
