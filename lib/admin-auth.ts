import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: Date;
}

/**
 * Fetches the current authenticated admin user from the database
 * Returns null if user is not authenticated or not an admin
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user || user.role !== 'admin') {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'admin',
      avatarUrl: user.avatarUrl || undefined,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Error fetching current admin:', error);
    return null;
  }
}

/**
 * Server-side helper to check if user is admin
 * Can be used in Server Components and API routes
 */
export async function isAdmin(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}
