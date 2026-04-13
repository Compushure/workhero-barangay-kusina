/**
 // honestly i made this hook because iw as thinking about people spamming acions
 and i wanted to store a config where i can jsut edit cooldowns
A cooldown between actions (minimum time between attempts).

A maximum number of attempts allowed before blocking.

A reset window after which attempts are cleared.
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
    cooldown = 1000, // 1000 ms
    maxAttempts = 3, // 3 ttries only
    resetTime = 10000, // reset time for the next is 10 seconds
  } = options;

  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const lastAttemptRef = useRef<number>(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canExecute = useCallback(() => {
    // this returns a value boolena when the canexecute is accessed through the hook
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
    // note this is a dependency array so this is reconstructure when valus change
  }, [cooldown, maxAttempts, attemptCount, isBlocked]);

  const execute = useCallback(async <T,>(
    action: () => Promise<T>
  ): Promise<T | null> => {
    // Action to run when allowed, REMEMBER UARE PASSING A FUNCTION 
  // const handleClick = async () => {
  //   await execute(async () => {
  //     // Simulate an async action (like an API call)
  //     console.log("Action executed!");
  //     return "done";
  //   });
  // };
    // generic  async T 
    // returns an action that can be executed with anti-spam protection
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
    execute, // function to execute an action with anti-spam protection
    canExecute: canExecute(), // boolean indicating if action can currently be executed
    isBlocked, // boolean indicating if user is currently blocked from executing actions
    attemptCount, // number of attempts made in the current window
    reset, // function to manually reset the anti-spam state
  };
}
