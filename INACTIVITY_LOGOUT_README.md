# Auto Logout After 10 Minutes of Inactivity

This document describes the implementation of the automatic user logout feature for the Taskkash website that logs users out after 10 minutes of inactivity.

## 🚀 Features Implemented

### Core Features
- ✅ **Global Activity Tracking**: Monitors mouse movement, key presses, clicks, scrolls, and touch events
- ✅ **Automatic Logout**: Logs out users after 10 minutes (600,000 ms) of inactivity
- ✅ **Session Cleanup**: Clears NextAuth session, cookies, localStorage, and sessionStorage
- ✅ **Redirect to Login**: Automatically redirects users to `/login` after logout
- ✅ **Protected Routes**: Works across all protected routes (user dashboard, admin dashboard, task pages)
- ✅ **Public Route Exclusion**: Does not run on public pages (landing page, login, register)
- ✅ **Memory Leak Prevention**: Proper cleanup of event listeners and timers on unmount

### Optional Enhancements
- ✅ **Warning Modal**: Shows a warning modal at 9 minutes with 60-second countdown
- ✅ **Cross-Tab Synchronization**: Syncs inactivity across multiple browser tabs
- ✅ **Page Refresh Persistence**: Maintains activity state across page refreshes

## 📁 Files Created/Modified

### New Files
```
components/providers/InactivityLogoutProvider.tsx  # Main provider component
hooks/useInactivityLogout.ts                        # Reusable hook
app/test-inactivity/page.tsx                       # Test page for debugging
INACTIVITY_LOGOUT_README.md                         # This documentation
```

### Modified Files
```
app/user-dashboard/layout.tsx    # Added InactivityLogoutProvider
app/admin-dashboard/layout.tsx   # Added InactivityLogoutProvider
```

## 🛠️ Implementation Details

### 1. InactivityLogoutProvider Component
- **Location**: `components/providers/InactivityLogoutProvider.tsx`
- **Purpose**: Main provider that wraps protected routes
- **Features**:
  - Tracks user activity through multiple event listeners
  - Manages inactivity and warning timers
  - Shows warning modal with countdown
  - Handles logout and cleanup
  - Syncs activity across tabs using localStorage

### 2. useInactivityLogout Hook
- **Location**: `hooks/useInactivityLogout.ts`
- **Purpose**: Reusable hook for custom implementations
- **Features**:
  - Exposes timer controls and logout function
  - Customizable timeouts and warning callbacks
  - Cross-tab synchronization
  - Memory-safe cleanup

### 3. Layout Integration
- **User Dashboard**: `app/user-dashboard/layout.tsx`
- **Admin Dashboard**: `app/admin-dashboard/layout.tsx`
- Both layouts now wrap children with `InactivityLogoutProvider`

## ⚙️ Configuration Options

### InactivityLogoutProvider Props
```typescript
interface InactivityLogoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;    // Default: 10
  warningMinutes?: number;    // Default: 9
  enabled?: boolean;          // Default: true
}
```

### useInactivityLogout Options
```typescript
interface UseInactivityLogoutOptions {
  timeoutMinutes?: number;    // Default: 10
  warningMinutes?: number;    // Default: 9
  enabled?: boolean;          // Default: true
  onWarning?: (remainingSeconds: number) => void;
  onLogout?: () => void;
}
```

## 🧪 Testing

### Test Page
A test page is available at `/test-inactivity` with reduced timeouts for easier testing:
- **Logout after**: 1 minute of inactivity
- **Warning at**: 30 seconds
- **Features**: Activity logging, real-time status, instructions

### Testing Scenarios
1. **Basic Inactivity**: Stay idle for 10 minutes → automatic logout
2. **Activity Reset**: Move mouse/press keys → timer resets
3. **Warning Modal**: Wait 9 minutes → see warning with countdown
4. **Cross-Tab Sync**: Open multiple tabs → activity syncs across tabs
5. **Page Refresh**: Refresh page → activity state persists
6. **Public Pages**: Visit public pages → no inactivity tracking
7. **Memory Cleanup**: Navigate away → timers and listeners cleaned up

## 🔧 Technical Implementation

### Activity Tracking
```typescript
const activityEvents = [
  'mousedown', 'mousemove', 'keypress', 'scroll',
  'touchstart', 'touchmove', 'click', 'keydown', 'keyup'
];
```

### Cross-Tab Synchronization
```typescript
// Store activity in localStorage
localStorage.setItem('lastActivity', Date.now().toString());

// Listen for storage events
window.addEventListener('storage', handleStorageChange);
```

### Cleanup on Unmount
```typescript
return () => {
  activityEvents.forEach(event => {
    document.removeEventListener(event, handleActivity);
  });
  // Clear all timers
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
  if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
};
```

## 🔐 Security Considerations

1. **Session Invalidation**: Uses NextAuth's `signOut()` for proper session invalidation
2. **Client-Side Only**: All logic runs client-side to prevent server-side complexity
3. **Storage Cleanup**: Clears all storage mechanisms on logout
4. **Authentication Check**: Only runs for authenticated users

## 🚨 Edge Cases Handled

1. **Tab Switching**: Handles visibility change events
2. **Browser Refresh**: Maintains state across refreshes
3. **Multiple Tabs**: Syncs activity across all tabs
4. **Network Issues**: Graceful fallback to redirect
5. **Component Unmount**: Proper cleanup prevents memory leaks
6. **Disabled State**: Can be disabled for specific scenarios

## 🔄 Usage Examples

### Basic Usage (Provider)
```typescript
import { InactivityLogoutProvider } from '@/components/providers/InactivityLogoutProvider';

export default function Layout({ children }) {
  return (
    <InactivityLogoutProvider>
      {children}
    </InactivityLogoutProvider>
  );
}
```

### Custom Usage (Hook)
```typescript
import { useInactivityLogout } from '@/hooks/useInactivityLogout';

export default function MyComponent() {
  const { resetTimers, handleLogout } = useInactivityLogout({
    timeoutMinutes: 15,
    warningMinutes: 14,
    onWarning: (seconds) => console.log(`Warning: ${seconds}s left`),
    onLogout: () => console.log('User logged out')
  });

  return <div>...</div>;
}
```

## 🎯 Next Steps

1. **Monitor Usage**: Track user feedback and logout patterns
2. **Adjust Timings**: Fine-tune timeout values based on user behavior
3. **Analytics**: Add logging for logout events and user activity
4. **A/B Testing**: Test different timeout values for optimal user experience

## 🐛 Troubleshooting

### Common Issues
1. **Not Working**: Ensure user is authenticated and provider is wrapping protected routes
2. **Memory Leaks**: Check that all event listeners are properly cleaned up
3. **Cross-Tab Issues**: Verify localStorage is enabled and not blocked by browser settings
4. **Warning Not Showing**: Ensure warningMinutes < timeoutMinutes

### Debug Mode
Use the test page at `/test-inactivity` with reduced timeouts for easier debugging.

---

**Implementation Date**: February 8, 2026  
**Version**: 1.0.0  
**Compatibility**: Next.js 16 (App Router), NextAuth 5.x
