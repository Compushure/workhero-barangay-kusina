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
  manager: 'bg-accent text-white font-semibold',
  hr: 'bg-[#faa938] text-foreground font-semibold',
  regular: 'bg-gray-200 text-foreground font-semibold',
  superadmin: 'bg-foreground text-white font-semibold border-2 border-accent',
};

const EMPLOYMENT_STATUS_STYLES: Record<string, string> = {
  probational: 'bg-[#faa938] text-foreground font-semibold',
  regular: 'bg-accent text-white font-semibold',
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
  const { exists: hasImage, imageUrl, key: imageKey, refresh: refreshImage } = useProfileImage({
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
      <div className="rounded-2xl bg-background-soft overflow-hidden border-t border-gray-300 shadow-sm/25 hover:shadow-lg transition-all duration-300">
        <div className="w-full p-3 sm:p-4 lg:p-2 xl:p-3 2xl:p-4 flex items-start justify-between gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
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
                    className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full object-cover"
                  />
                ) : hasImage === true ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${user.id}-${imageKey}`}
                    src={imageUrl}
                    alt={`${user.name}'s profile`}
                    className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-full object-cover"
                    loading="lazy"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                  />
                ) : (
                  <span className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-foreground">
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
              <div className="flex items-center gap-1 sm:gap-1 lg:gap-2 mb-0.5 sm:mb-1 lg:mb-1">
                <p className="font-semibold text-sm sm:text-sm lg:text-sm xl:text-sm truncate text-foreground">{user.name}</p>
                {user.employeeId ? (
                  <Badge
                    variant="outline"
                    className="hidden md:inline-flex text-xs lg:text-xs rounded-lg border-gray-300 text-gray-500 bg-white"
                  >
                    {user.employeeId}
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs sm:text-xs lg:text-xs text-gray-600 truncate">{user.email}</p>
              <div className="flex gap-1.5 sm:gap-2 lg:gap-3 mt-1.5 sm:mt-2 lg:mt-3 md:hidden">
                <span
                  className={`inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-sm font-medium capitalize ${
                    EMPLOYEE_TYPE_STYLES[user.employeeType]
                  }`}
                >
                  {user.employeeType}
                </span>
                <span
                  className={`inline-block px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-meta font-medium capitalize ${employmentStatusClass}`}
                >
                  {employmentStatus}
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-4 shrink-0">
              <span
                className={`px-2.5 py-1 lg:px-3.5 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium capitalize ${
                  EMPLOYEE_TYPE_STYLES[user.employeeType]
                }`}
              >
                {user.employeeType}
              </span>
              <span
                className={`px-2.5 py-1 lg:px-3.5 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium capitalize ${employmentStatusClass}`}
              >
                {employmentStatus}
              </span>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={isOpen ? 'Collapse user' : 'Expand user'}
              className="p-1.5 sm:p-2 lg:p-2.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            >
              <ChevronDown
                className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-gray-600 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-3 sm:px-4 lg:px-6 xl:px-7 2xl:px-8 pb-3 sm:pb-4 lg:pb-6 xl:pb-7 2xl:pb-8 border-t border-[#f47812]/15 pt-3 sm:pt-4 lg:pt-6 xl:pt-7 space-y-4 sm:space-y-6 lg:space-y-8">
            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3 lg:mb-4">
                Basic Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Name</p>
                    <p className="text-sm lg:text-base font-medium text-foreground truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Email</p>
                    <p className="text-sm lg:text-base font-medium text-foreground break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Contact</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{user.contactNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3 lg:mb-4">
                Employment Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Building2 className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Company ID</p>
                    <p className="text-sm lg:text-base font-medium text-gray-600">{user.companyId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <IdCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Employee ID</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{user.employeeId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <BadgeCheck className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Status</p>
                    <p className="text-sm lg:text-base font-medium text-foreground capitalize">{employmentStatus}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Date Created</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{dateCreated}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3 lg:mb-4">Address</p>
              <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                <MapPin className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                <p className="text-sm lg:text-base text-foreground">{user.address || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs lg:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3 lg:mb-4">
                Philippine Government IDs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">TIN</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{user.tin || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">SSS</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{user.sss || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                  <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-gray-600">Pag-IBIG</p>
                    <p className="text-sm lg:text-base font-medium text-foreground">{user.pagibig || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2 lg:pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-2 flex-1 sm:flex-none cursor-pointer bg-white hover:bg-gray-100 hover:text-foreground border-zinc-300 transition-all duration-500 ease-in-out text-xs sm:text-sm"
              >
                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Edit User
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="gap-2 flex-1 sm:flex-none bg-destructive cursor-pointer text-white hover:bg-destructive/90 transition-all duration-500 ease-in-out text-xs sm:text-sm"
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
            <DialogTitle className="text-base lg:text-lg text-foreground">{user.name}&apos;s Profile Picture</DialogTitle>
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
