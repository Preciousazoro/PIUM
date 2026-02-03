import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has admin role
  const adminCheck = await isAdmin();
  
  if (!adminCheck) {
    // Redirect to user dashboard if not admin
    redirect('/user-dashboard/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
