import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import ContactMessage, { ContactStatus } from '@/models/ContactMessage';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageId, replyMessage } = body;

    // Validate input
    if (!messageId || !replyMessage || replyMessage.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message ID and reply message are required' },
        { status: 400 }
      );
    }

    if (replyMessage.length > 2000) {
      return NextResponse.json(
        { error: 'Reply message cannot exceed 2000 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the contact message
    const contactMessage = await ContactMessage.findById(messageId);
    if (!contactMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Create reply email
    const replySubject = `Re: ${contactMessage.subject}`;
    const replyHtml = createReplyEmailHtml(contactMessage.name, contactMessage.message, replyMessage);
    const replyText = createReplyEmailText(contactMessage.name, contactMessage.message, replyMessage);

    // Send email
    console.log('Attempting to send email to:', contactMessage.email);
    console.log('Email user configured:', process.env.EMAIL_USER);
    console.log('Email password configured:', process.env.EMAIL_PASSWORD ? 'Yes' : 'No');
    
    const emailSent = await sendEmail({
      to: contactMessage.email,
      subject: replySubject,
      html: replyHtml,
      text: replyText,
    });

    console.log('Email send result:', emailSent);

    if (!emailSent) {
      console.error('Email sending failed - check email configuration');
      return NextResponse.json(
        { error: 'Failed to send reply email - email service configuration issue' },
        { status: 500 }
      );
    }

    // Update contact message with reply details
    contactMessage.replyMessage = replyMessage;
    contactMessage.repliedAt = new Date();
    contactMessage.status = ContactStatus.RESPONDED;
    await contactMessage.save();

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        messageId: contactMessage._id,
        email: contactMessage.email,
        repliedAt: contactMessage.repliedAt,
      },
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function createReplyEmailHtml(userName: string, originalMessage: string, replyMessage: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reply from TaskKash Support</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          color: #333;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .message-section {
          margin-bottom: 25px;
        }
        .original-message {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .reply-message {
          background-color: #e8f5e8;
          border-left: 4px solid #28a745;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Reply from TaskKash Support</h1>
        </div>
        
        <div class="message-section">
          <p>Hello ${userName},</p>
          <p>Thank you for reaching out to us. We've reviewed your message and our response is below:</p>
          
          <div class="original-message">
            <strong>Your original message:</strong><br>
            "${originalMessage}"
          </div>
          
          <div class="reply-message">
            <strong>Our reply:</strong><br>
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us again.</p>
        </div>
        
        <div class="footer">
          <p>Best regards,<br>The TaskKash Team</p>
          <p style="font-size: 12px; color: #999;">
            This is a reply to your support request. You can respond to this email if needed.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function createReplyEmailText(userName: string, originalMessage: string, replyMessage: string): string {
  return `
    Reply from TaskKash Support
    
    Hello ${userName},
    
    Thank you for reaching out to us. We've reviewed your message and our response is below:
    
    Your original message:
    "${originalMessage}"
    
    Our reply:
    ${replyMessage}
    
    If you have any further questions, please don't hesitate to contact us again.
    
    Best regards,
    The TaskKash Team
    
    This is a reply to your support request. You can respond to this email if needed.
  `;
}
