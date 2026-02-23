'use client';

import { useState } from 'react';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NotificationMessage } from './types';

interface NotificationBannerProps {
  notification: NotificationMessage;
  onClose?: () => void;
}

/**
 * NotificationBanner - Client Component
 * Displays a dismissible notification message with icon
 */
export function NotificationBanner({
  notification,
  onClose,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm">
      <Zap className="h-5 w-5 text-orange-600" />
      <span className="font-semibold text-orange-600">NEW!</span>
      <span className="text-orange-700">{notification.text}</span>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto h-5 w-5 p-0 text-orange-600 hover:bg-orange-100"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
