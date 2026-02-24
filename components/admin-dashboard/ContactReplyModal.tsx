"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded';
}

interface ContactReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onReplySent: (messageId: string) => void;
}

export default function ContactReplyModal({ 
  isOpen, 
  onClose, 
  message, 
  onReplySent 
}: ContactReplyModalProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setReplyMessage('');
    }
  }, [isOpen]);

  if (!message) return null;

  const handleSendReply = async () => {
    // Validate input
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    if (replyMessage.length > 2000) {
      toast.error('Reply message cannot exceed 2000 characters');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/admin/contact-messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message._id,
          replyMessage: replyMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reply');
      }

      // Show success message
      toast.success('Reply sent successfully!');

      // Notify parent component
      onReplySent(message._id);

      // Close modal
      onClose();

    } catch (error) {
      console.error('Error sending reply:', error);
      
      // Extract more specific error message
      let errorMessage = 'Failed to send reply';
      if (error instanceof Error) {
        if (error.message.includes('EMAIL_PASSWORD')) {
          errorMessage = 'Email service not configured. Please contact administrator.';
        } else if (error.message.includes('535')) {
          errorMessage = 'Email authentication failed. Please check email credentials.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (!isSending) {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title="Reply to Contact Message"
    >
      <div className="space-y-4">
        {/* Original Message Info */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                value={message.name}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={message.email}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Subject
              </label>
              <input
                type="text"
                value={`Re: ${message.subject}`}
                readOnly
                className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground"
              />
            </div>
          </div>

          {/* Original Message Preview */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Original Message
            </label>
            <div className="p-3 border border-border rounded-lg bg-muted/30 text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {message.message}
            </div>
          </div>
        </div>

        {/* Reply Message */}
        <div>
          <label htmlFor="replyMessage" className="block text-sm font-medium text-foreground mb-1">
            Your Reply <span className="text-red-500">*</span>
          </label>
          <textarea
            id="replyMessage"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply message here..."
            rows={6}
            maxLength={2000}
            disabled={isSending}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {replyMessage.length}/2000 characters
            </span>
            {replyMessage.length > 1800 && (
              <span className="text-xs text-orange-500">
                Approaching character limit
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleCancel}
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSendReply}
            disabled={isSending || !replyMessage.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Reply
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <p className="mb-1">
            <strong>Note:</strong> This reply will be sent directly to the user's email address and the message status will be automatically updated to "Responded".
          </p>
          <p>
            The reply will include both your message and the original message for context.
          </p>
        </div>
      </div>
    </Modal>
  );
}
