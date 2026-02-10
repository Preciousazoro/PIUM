import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { InactivityLogoutProvider } from '@/components/providers/InactivityLogoutProvider';

// Force dynamic rendering for user dashboard routes since they depend on authentication
export const dynamic = 'force-dynamic';

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const session = await auth();
  
  if (!session) {
    // Redirect to login if not authenticated
    redirect('/login');
  }

  return (
    <InactivityLogoutProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </InactivityLogoutProvider>
  );
}
