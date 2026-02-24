import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";

// PUT /api/admin/bookings/reply - Send reply to booking
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, subject, message } = body;

    // Validate required fields
    if (!bookingId || !subject || !message) {
      return NextResponse.json(
        { error: "Booking ID, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message cannot be more than 2000 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Create email HTML
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">${subject}</h2>
          <p style="color: #666; margin: 0;">Dear ${booking.companyName},</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
          <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Original Booking Details</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Company:</strong> ${booking.companyName}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${booking.email}</p>
          ${booking.phone ? `<p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> ${booking.phone}</p>` : ''}
          ${booking.message ? `<p style="color: #666; margin: 5px 0;"><strong>Original Message:</strong> ${booking.message}</p>` : ''}
          <p style="color: #666; margin: 5px 0;"><strong>Submitted:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          <p>This email was sent in response to your booking inquiry.</p>
        </div>
      </div>
    `;

    // Send email using existing email system
    const emailSent = await sendEmail({
      to: booking.email,
      subject: subject,
      html: emailHtml,
      text: `${subject}\n\nDear ${booking.companyName},\n\n${message}\n\nOriginal Booking Details:\nCompany: ${booking.companyName}\nEmail: ${booking.email}\n${booking.phone ? `Phone: ${booking.phone}\n` : ''}${booking.message ? `Original Message: ${booking.message}\n` : ''}Submitted: ${new Date(booking.createdAt).toLocaleDateString()}\n\nThis email was sent in response to your booking inquiry.`
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Add reply to booking
    const replyData = {
      message: message.trim(),
      sentAt: new Date(),
      sentBy: admin.id,
    };

    // Update booking with reply and status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $push: { replies: replyData },
        $set: {
          status: booking.status === 'pending' ? 'contacted' : booking.status,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      booking: updatedBooking,
    });

  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
