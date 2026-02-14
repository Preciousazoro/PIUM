'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface InactivityLogoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
  enabled?: boolean;
}

export function InactivityLogoutProvider({
  children,
  timeoutMinutes = 15, // Increased from 10 to 15 minutes
  warningMinutes = 14,  // Increased from 9 to 14 minutes
  enabled = true,
}: InactivityLogoutProviderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(60);
  
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Update last activity
    lastActivityRef.current = Date.now();
    
    // Store in localStorage for cross-tab sync
    localStorage.setItem('lastActivity', lastActivityRef.current.toString());

    // Hide warning if shown
    setShowWarning(false);
    setWarningCountdown(60);

    // Set warning timeout (if warning is enabled)
    if (warningMinutes < timeoutMinutes) {
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        setWarningCountdown(60);
        
        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setWarningCountdown((prev) => {
            if (prev <= 1) {
              // Logout when countdown reaches 0
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningMs);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [timeoutMs, warningMs, warningMinutes, timeoutMinutes]);

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
      
      // Show toast notification
      toast.info('You have been logged out due to inactivity');
      
      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback redirect
      window.location.href = '/auth/login';
    }
  }, [router]);

  const handleActivity = useCallback(() => {
    if (!enabled || status !== 'authenticated') return;
    
    // Throttle activity handling to prevent excessive calls
    const now = Date.now();
    if (now - lastActivityRef.current < 1000) return; // Ignore if less than 1 second since last activity
    
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
      } else if (timeSinceActivity >= warningMs) {
        // Show warning immediately
        setShowWarning(true);
        const remainingTime = Math.ceil((timeoutMs - timeSinceActivity) / 1000);
        setWarningCountdown(remainingTime);
        
        countdownIntervalRef.current = setInterval(() => {
          setWarningCountdown((prev) => {
            if (prev <= 1) {
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
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
  }, [enabled, status, timeoutMs, warningMs, resetTimers, handleLogout]);

  // Don't render anything if not enabled or not authenticated
  if (!enabled || status !== 'authenticated') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Session Timeout Warning
              </h3>
              
              <p className="text-muted-foreground mb-4">
                You'll be logged out in{' '}
                <span className="font-bold text-foreground">{warningCountdown}</span>{' '}
                seconds due to inactivity.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetTimers}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
                >
                  Logout Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
