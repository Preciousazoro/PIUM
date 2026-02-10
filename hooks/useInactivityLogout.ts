'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
  onWarning?: (remainingSeconds: number) => void;
  onLogout?: () => void;
}

export function useInactivityLogout({
  timeoutMinutes = 10,
  warningMinutes = 9,
  enabled = true,
  onWarning,
  onLogout,
}: UseInactivityLogoutOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    try {
      // Clear all timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      // Clear localStorage
      localStorage.removeItem('lastActivity');
      
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Call custom logout handler if provided
      if (onLogout) {
        onLogout();
      } else {
        // Default behavior
        toast.info('You have been logged out due to inactivity');
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback redirect
      window.location.href = '/auth/login';
    }
  }, [router, onLogout]);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Update last activity
    lastActivityRef.current = Date.now();
    
    // Store in localStorage for cross-tab sync
    localStorage.setItem('lastActivity', lastActivityRef.current.toString());

    // Set warning timeout (if warning is enabled and callback provided)
    if (warningMinutes < timeoutMinutes && onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        let remainingSeconds = 60;
        
        // Call warning callback immediately
        onWarning(remainingSeconds);
        
        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          remainingSeconds -= 1;
          
          if (remainingSeconds <= 0) {
            // Logout when countdown reaches 0
            handleLogout();
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else {
            onWarning(remainingSeconds);
          }
        }, 1000);
      }, warningMs);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [timeoutMs, warningMs, warningMinutes, timeoutMinutes, onWarning, handleLogout]);

  const handleActivity = useCallback(() => {
    if (!enabled || status !== 'authenticated') return;
    resetTimers();
  }, [enabled, status, resetTimers]);

  // Setup activity event listeners
  useEffect(() => {
    if (!enabled || status !== 'authenticated') return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
      'keydown',
      'keyup',
    ];

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'authenticated') {
        handleActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle cross-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastActivity' && e.newValue) {
        const newActivityTime = parseInt(e.newValue);
        if (newActivityTime > lastActivityRef.current) {
          lastActivityRef.current = newActivityTime;
          resetTimers();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initialize timers
    resetTimers();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [enabled, status, handleActivity, resetTimers]);

  // Check for existing activity on mount
  useEffect(() => {
    if (!enabled || status !== 'authenticated') return;

    const storedActivity = localStorage.getItem('lastActivity');
    if (storedActivity) {
      const storedTime = parseInt(storedActivity);
      const timeSinceActivity = Date.now() - storedTime;
      
      if (timeSinceActivity >= timeoutMs) {
        // Already timed out, logout immediately
        handleLogout();
      } else if (timeSinceActivity >= warningMs && onWarning) {
        // Show warning immediately
        const remainingTime = Math.ceil((timeoutMs - timeSinceActivity) / 1000);
        
        countdownIntervalRef.current = setInterval(() => {
          const currentRemaining = Math.max(0, remainingTime - Math.floor((Date.now() - storedTime) / 1000));
          
          if (currentRemaining <= 0) {
            handleLogout();
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
          } else {
            onWarning(currentRemaining);
          }
        }, 1000);
      } else {
        // Reset timers with existing activity
        lastActivityRef.current = storedTime;
        resetTimers();
      }
    } else {
      // No stored activity, start fresh
      resetTimers();
    }
  }, [enabled, status, timeoutMs, warningMs, resetTimers, handleLogout, onWarning]);

  return {
    resetTimers,
    handleLogout,
    lastActivity: lastActivityRef.current,
    isEnabled: enabled && status === 'authenticated',
  };
}
