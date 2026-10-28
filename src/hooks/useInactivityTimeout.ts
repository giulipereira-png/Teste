import { useEffect, useRef } from 'react';

/**
 * Inactivity Auto-Logout Hook
 * Automatically logs out active administrative or guardian sessions after
 * a period of inactivity (default 30 minutes) to prevent unauthorized access
 * in shared environments (e.g. reception desks, pool-side computers).
 */
export const useInactivityTimeout = (
  isAuthenticated: boolean,
  onTimeoutLogout: () => void,
  timeoutMinutes = 30
) => {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        console.warn('Inactivity timeout reached: automatically logging out session.');
        onTimeoutLogout();
      }, timeoutMs);
    };

    // Initial timer setup
    resetTimer();

    // User activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttled event listener to prevent high CPU usage on mouse moves
    let lastHandled = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastHandled > 5000) { // check every 5 seconds
        lastHandled = now;
        resetTimer();
      }
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [isAuthenticated, onTimeoutLogout, timeoutMs]);
};
