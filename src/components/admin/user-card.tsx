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
    EMPLOYMENT_STATUS_STYLES[employmentStatus] || 'bg-muted text-foreground';
  const dateCreated = formatDate(user.createdAt || user.date_added);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-3xl bg-background overflow-hidden border-b-3 border-x-2 border-[#f47812]/15 shadow-sm/25 hover:shadow-lg transition-all duration-300">
        <div className="w-full p-4 sm:p-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div
              className="relative group cursor-zoom-in hover:opacity-90 transition-opacity"
              onClick={handleAvatarClick}
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              <div
                className={`w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 transition-colors ${
                  isHoveringAvatar ? 'bg-accent/20' : ''
                }`}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={`${user.name}'s profile (preview)`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : hasImage === true ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${user.id}-${imageKey}`}
                    src={imageUrl}
                    alt={`${user.name}'s profile`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              {isHoveringAvatar && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold truncate text-foreground">{user.name}</p>
                {user.employeeId ? (
                  <Badge
                    variant="outline"
                    className="hidden sm:inline-flex text-xs border-gray-300 text-gray-700 bg-white"
                  >
                    {user.employeeId}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
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
          <CollapsibleTrigger asChild>
            <button
              type="button"
              aria-label={isOpen ? 'Collapse user' : 'Expand user'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
            >
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-[#f47812]/15 pt-4 space-y-6">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                Basic Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Contact</p>
                    <p className="text-sm font-medium text-foreground">{user.contactNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                Employment Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Company ID</p>
                    <p className="text-sm font-medium text-gray-600">{user.companyId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IdCard className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Employee ID</p>
                    <p className="text-sm font-medium text-foreground">{user.employeeId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Status</p>
                    <p className="text-sm font-medium text-foreground capitalize">{employmentStatus}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Date Created</p>
                    <p className="text-sm font-medium text-foreground">{dateCreated}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Address</p>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{user.address || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
                Philippine Government IDs
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">TIN</p>
                    <p className="text-sm font-medium text-foreground">{user.tin || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">SSS</p>
                    <p className="text-sm font-medium text-foreground">{user.sss || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Pag-IBIG</p>
                    <p className="text-sm font-medium text-foreground">{user.pagibig || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="gap-2 flex-1 sm:flex-none cursor-pointer bg-white hover:bg-gray-100 hover:text-foreground border-zinc-300 transition-all duration-500 ease-in-out"
              >
                <Edit2 className="h-4 w-4" />
                Edit User
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(user)}
                className="gap-2 flex-1 sm:flex-none bg-destructive cursor-pointer text-white hover:bg-destructive/90 transition-all duration-500 ease-in-out"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
      
      {/* Image Preview Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">{user.name}&apos;s Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {hasImage === true ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={`${user.name}'s profile`}
                className="max-w-full max-h-[70vh] rounded-lg object-contain"
              />
            ) : (
              <div className="w-64 h-64 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-8xl font-semibold text-foreground/60">
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
