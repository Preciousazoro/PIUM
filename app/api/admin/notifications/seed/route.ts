import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import { createSampleAdminNotifications } from '@/lib/notifications';

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const notifications = await createSampleAdminNotifications();

    return NextResponse.json({
      success: true,
      message: `Created ${notifications.length} sample notifications`,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error seeding notifications:', error);
    return NextResponse.json(
      { error: 'Failed to seed notifications' },
      { status: 500 }
    );
  }
}
