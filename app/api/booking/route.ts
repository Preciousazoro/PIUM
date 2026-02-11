import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { AdminNotifications } from "@/lib/adminNotifications";

// GET /api/booking - Fetch all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all bookings, sorted by newest first
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bookings,
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/booking - Create new booking (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, email, phone, message } = body;

    // Validate required fields
    if (!companyName || !email) {
      return NextResponse.json(
        { error: "Company name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Create booking record
    const booking = await Booking.create({
      companyName,
      email,
      phone: phone || "",
      message: message || "",
      status: "pending",
      metadata: {
        userAgent: request.headers.get("user-agent"),
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      },
    });

    // Create admin notification for new booking
    try {
      await AdminNotifications.bookingCreated(booking._id.toString(), companyName);
    } catch (error) {
      console.error('Failed to create booking notification:', error);
      // Don't fail the request if notification fails
    }

    // TODO: Send confirmation email
    // TODO: Send notification to admin team
    // TODO: Integrate with calendar service (Calendly/Cal.com)

    return NextResponse.json({
      success: true,
      bookingId: booking._id,
      message: "Booking request submitted successfully",
    });

  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking request" },
      { status: 500 }
    );
  }
}
