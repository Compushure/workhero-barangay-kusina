/**
 * Profile Image Hook
 * ===================
 * Centralized hook for managing profile image state across the application.
 * Handles storage checks, event listeners, and cache busting in one place.
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProfileImageState, ProfileImageEvent, ProfileImageHookOptions } from '@/types/profile-image';

/**
 * Hook for managing profile image state
 * - Checks storage existence
 * - Listens for update/delete events
 * - Manages cache busting key
 * - Memoizes expensive operations
 */
export function useProfileImage(options: ProfileImageHookOptions) {
  const { userId, profilePictureUrl, enabled = true } = options;
  
  const [state, setState] = useState<ProfileImageState>({
    exists: false,
    checking: true,
    error: false,
    key: Date.now(),
  });

  // Memoized storage check function
  const checkImageExists = useCallback(async () => {
    if (!enabled || !userId) {
      setState(prev => ({ ...prev, exists: false, checking: false }));
      return;
    }

    setState(prev => ({ ...prev, checking: true }));
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('employees')
        .list(userId, {
          limit: 1,
          search: 'profile.png',
        });

      setState(prev => ({
        ...prev,
        exists: !error && !!data && data.length > 0,
        error: false,
        checking: false,
      }));
    } catch (error) {
      console.error('[useProfileImage] Storage check error:', error);
      setState(prev => ({ ...prev, exists: false, error: true, checking: false }));
    }
  }, [userId, profilePictureUrl, enabled]);

  // Initial check and event listener setup
  useEffect(() => {
    checkImageExists();

    // Event handlers
    const handleImageUpdated = (event: Event) => {
      const { userId: eventUserId, timestamp } = (event as CustomEvent<ProfileImageEvent>).detail;
      if (eventUserId === userId) {
        setState(prev => ({ ...prev, key: timestamp, error: false }));
        checkImageExists();
      }
    };

    const handleImageDeleted = (event: Event) => {
      const { userId: eventUserId } = (event as CustomEvent<ProfileImageEvent>).detail;
      if (eventUserId === userId) {
        setState(prev => ({ ...prev, exists: false, error: true, key: Date.now() }));
      }
    };

    window.addEventListener('profile-image-updated', handleImageUpdated);
    window.addEventListener('profile-image-deleted', handleImageDeleted);

    return () => {
      window.removeEventListener('profile-image-updated', handleImageUpdated);
      window.removeEventListener('profile-image-deleted', handleImageDeleted);
    };
  }, [userId, checkImageExists]);

  // Memoized image URL with cache busting - build URL from storage directly
  const imageUrl = useMemo(() => {
    if (!state.exists || !userId || state.error) return undefined;
    // Build the public URL directly from Supabase storage
    const supabase = createClient();
    const { data } = supabase.storage.from('employees').getPublicUrl(`${userId}/profile.png`);
    if (!data?.publicUrl) return undefined;
    return `${data.publicUrl}?t=${state.key}`;
  }, [state.exists, state.error, state.key, userId]);

  // Memoized initials helper
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  return {
    imageUrl,
    exists: state.exists,
    checking: state.checking,
    error: state.error,
    key: state.key,
    getInitials,
    refresh: checkImageExists,
  };
}
