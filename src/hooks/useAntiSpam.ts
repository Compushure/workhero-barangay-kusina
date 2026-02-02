/**
 * Anti-Spam Hook
 * ===============
 * Prevents button spam clicking and provides debounced action execution
 */

'use client';

import { useState, useCallback, useRef } from 'react';

interface UseAntiSpamOptions {
  cooldown?: number; // milliseconds
  maxAttempts?: number;
  resetTime?: number; // milliseconds
}

export function useAntiSpam(options: UseAntiSpamOptions = {}) {
  const {
    cooldown = 1000,
    maxAttempts = 3,
    resetTime = 10000,
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const lastAttemptRef = useRef<number>(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canExecute = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptRef.current;

    // If cooldown hasn't passed
    if (timeSinceLastAttempt < cooldown) {
      return false;
    }

    // If max attempts reached and within reset window
    if (attemptCount >= maxAttempts) {
      return false;
    }

    return !isBlocked;
  }, [cooldown, maxAttempts, attemptCount, isBlocked]);

  const execute = useCallback(async <T,>(
    action: () => Promise<T>
  ): Promise<T | null> => {
    if (!canExecute()) {
      console.warn('[useAntiSpam] Action blocked - too many attempts');
      return null;
    }

    const now = Date.now();
    lastAttemptRef.current = now;
    setAttemptCount(prev => prev + 1);

    // Set up reset timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    resetTimeoutRef.current = setTimeout(() => {
      setAttemptCount(0);
      setIsBlocked(false);
    }, resetTime);

    // If this pushes us over the limit, block further attempts
    if (attemptCount + 1 >= maxAttempts) {
      setIsBlocked(true);
    }

    try {
      const result = await action();
      return result;
    } catch (error) {
      throw error;
    }
  }, [canExecute, attemptCount, maxAttempts, resetTime]);

  const reset = useCallback(() => {
    setAttemptCount(0);
    setIsBlocked(false);
    lastAttemptRef.current = 0;
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  return {
    execute,
    canExecute: canExecute(),
    isBlocked,
    attemptCount,
    reset,
  };
}
