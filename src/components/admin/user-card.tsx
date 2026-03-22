'use client';

import { useRef, useState, useEffect as React_useEffect } from 'react';
import * as React from 'react';
import type { EmployeeTypeValue, User, UserWithExtras } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Upload,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { ProfileAvatar } from '@/components/shared/ProfileAvatar';
import { useProfileImage } from '@/hooks/useProfileImage';

interface UserCardProps {
  user: UserWithExtras;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onHandleProfilePictureUpload?: (userid: string, file: File, username: string) => Promise<void>;
}

const EMPLOYEE_TYPE_STYLES: Record<EmployeeTypeValue, string> = {
  manager: 'bg-primary-gradient text-card font-semibold',
  hr: 'bg-accent/80 text-primary-foreground font-semibold',
  regular: 'bg-secondary text-secondary-foreground font-semibold',
  superadmin: 'bg-foreground text-white font-semibold border-2 border-accent',
};

const EMPLOYMENT_STATUS_STYLES: Record<string, string> = {
  probational: 'bg-accent/70 text-primary-foreground font-semibold',
  regular: 'bg-primary-gradient text-card font-semibold',
};

function formatDate(value?: Date | string) {
  if (!value) return 'N/A';
  const parsed = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(parsed.getTime()) ? 'N/A' : format(parsed, 'PPP');
}

// Global version store that survives component unmounts
const globalImageVersions = new Map<string, number>();

export function UserCard({ user, onEdit, onDelete, onHandleProfilePictureUpload }: UserCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Use optimized profile image hook
  const {
    exists: hasImage,
    imageUrl,
    key: imageKey,
    refresh: refreshImage,
  } = useProfileImage({
    userId: user.id,
    profilePictureUrl: user.profilePictureUrl,
  });

  function handleAvatarClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setShowImageModal(true);
  }

  function getProfileUrl(userId: string) {
    const supabase = createClient();
    const { data } = supabase.storage.from('employees').getPublicUrl(`${userId}/profile.png`);
    if (!data) return '';
    return data.publicUrl;
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleImageSelect(file: File) {
    console.log('Selected file:', file?.name);
    if (!file) return;
    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Clear preview after brief delay for new image to load
    setTimeout(() => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPreviewUrl(null);
      refreshImage(); // Refresh after upload completes
    }, 1500);
  }

  const employmentStatus = user.employmentStatus || 'unknown';
  const employmentStatusClass =
    EMPLOYMENT_STATUS_STYLES[employmentStatus] || 'bg-backgroundround text-foreground';
  const dateCreated = formatDate(user.createdAt || user.date_added);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-2xl bg-card overflow-hidden border border-accent/20 shadow-sm/25 hover:shadow-md transition-all duration-300">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={isOpen ? 'Collapse user' : 'Expand user'}
            className="w-full cursor-pointer p-3 sm:p-4 lg:p-5 flex items-start justify-between gap-2 sm:gap-3 lg:gap-4 transition-colors hover:bg-accent/5"
          >
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
              <div
                className="relative group cursor-zoom-in hover:opacity-90 transition-opacity"
                onClick={handleAvatarClick}
                onMouseEnter={() => setIsHoveringAvatar(true)}
                onMouseLeave={() => setIsHoveringAvatar(false)}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0 transition-colors ${
                    isHoveringAvatar ? 'bg-accent/20' : ''
                  }`}
                >
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={`${user.name}'s profile (preview)`}
                      className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover"
                    />
                  ) : hasImage === true ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${user.id}-${imageKey}`}
                      src={imageUrl}
                      alt={`${user.name}'s profile`}
                      className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover"
                      loading="lazy"
                      onLoad={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                  ) : (
                    <span className="text-xs sm:text-sm lg:text-base font-semibold text-foreground">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                {isHoveringAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-0.5 sm:mb-1 lg:mb-2">
                  <p className="font-semibold text-sm sm:text-base lg:text-task-title truncate text-foreground">
                    {user.name}
                  </p>
                  {user.employeeId ? (
                    <Badge
                      variant="outline"
                      className="hidden md:inline-flex text-[11px] border-gray-300 text-gray-700 bg-white"
                    >
                      {user.employeeId}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-meta text-muted-foreground truncate">{user.email}</p>
                <div className="flex gap-1.5 sm:gap-2 lg:gap-3 mt-1.5 sm:mt-2 lg:mt-3 md:hidden">
                  <span
                    className={`inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-medium capitalize ${
                      EMPLOYEE_TYPE_STYLES[user.employeeType]
                    }`}
                  >
                    {user.employeeType}
                  </span>
                  <span
                    className={`inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] font-medium capitalize ${employmentStatusClass}`}
                  >
                    {employmentStatus}
                  </span>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4 shrink-0">
                <span
                  className={`px-2.5 py-1 lg:px-3.5 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-medium capitalize ${
                    EMPLOYEE_TYPE_STYLES[user.employeeType]
                  }`}
                >
                  {user.employeeType}
                </span>
                <span
                  className={`px-2.5 py-1 lg:px-3.5 lg:py-1.5 rounded-full text-[11px] lg:text-xs font-medium capitalize ${employmentStatusClass}`}
                >
                  {employmentStatus}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-full bg-background/80 shrink-0">
              <ChevronDown
                className={`h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5 border-t border-accent/15 pt-3 sm:pt-4 lg:pt-5 space-y-4 sm:space-y-5 lg:space-y-6">
            <div>
              <p className="text-[11px] lg:text-xs font-semibold text-muted-foreground uppercase mb-2 sm:mb-3">
                Basic Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium text-foreground">
                      {user.contactNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] lg:text-xs font-semibold text-muted-foreground uppercase mb-2 sm:mb-3">
                Employment Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Company ID</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {user.companyId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <IdCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-medium text-foreground">
                      {user.employeeId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <BadgeCheck className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Status</p>
                    <p className="text-sm font-medium text-foreground capitalize">
                      {employmentStatus}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Date Created</p>
                    <p className="text-sm font-medium text-foreground">{dateCreated}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] lg:text-xs font-semibold text-muted-foreground uppercase mb-2 sm:mb-3">
                Address
              </p>
              <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{user.address || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] lg:text-xs font-semibold text-muted-foreground uppercase mb-2 sm:mb-3">
                Philippine Government IDs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">TIN</p>
                    <p className="text-sm font-medium text-foreground">{user.tin || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">SSS</p>
                    <p className="text-sm font-medium text-foreground">{user.sss || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">Pag-IBIG</p>
                    <p className="text-sm font-medium text-foreground">{user.pagibig || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2 lg:pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="text-button control-h gap-2 flex-1 sm:flex-none cursor-pointer rounded-md border border-zinc-300 bg-card hover:bg-gray-200 hover:text-foreground transition-all duration-300"
              >
                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Edit User
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="text-button control-h gap-2 flex-1 sm:flex-none bg-destructive cursor-pointer text-white hover:bg-destructive/90 transition-all duration-300"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-2xl lg:max-w-4xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-base lg:text-lg text-foreground">
              {user.name}&apos;s Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {hasImage === true ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${user.name}'s profile`}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
                loading="eager"
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
            ) : (
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-8xl lg:text-9xl font-semibold text-foreground/60">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Collapsible>
  );
}
