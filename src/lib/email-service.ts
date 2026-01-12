// Email service using Resend
// Resend is recommended for Next.js applications due to its simplicity and reliability

import { emailTemplates } from './email-templates'

interface SendEmailOptions {
  to: string
  type: 'applicationSubmitted' | 'applicationStatusChanged' | 'certificateIssued' | 'reviewRequest'
  data: {
    recipientName: string
    recipientEmail: string
    [key: string]: any
  }
}

/**
 * Send email notification using Resend
 * @param options Email options including recipient, type, and data
 * @returns Promise with success status
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    // Get email template
    const template = emailTemplates[options.type](options.data)

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'نظام الإجازة <noreply@ijazah.app>',
        to: options.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        reply_to: process.env.EMAIL_REPLY_TO || 'support@ijazah.app',
        tags: [
          { name: 'category', value: options.type },
          { name: 'environment', value: process.env.NODE_ENV || 'development' },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to send email:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }

    const result = await response.json()
    console.log('Email sent successfully:', result.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Helper function to send application submitted notification
 */
export async function sendApplicationSubmittedEmail(data: {
  email: string
  name: string
  applicationNumber: string
  ijazahType: string
  submittedDate: string
  applicationUrl: string
}) {
  return sendEmail({
    to: data.email,
    type: 'applicationSubmitted',
    data: {
      recipientName: data.name,
      recipientEmail: data.email,
      applicationNumber: data.applicationNumber,
      ijazahType: getIjazahTypeArabic(data.ijazahType),
      submittedDate: data.submittedDate,
      applicationUrl: data.applicationUrl,
    },
  })
}

/**
 * Helper function to send application status changed notification
 */
export async function sendApplicationStatusChangedEmail(data: {
  email: string
  name: string
  applicationNumber: string
  status: string
  notes?: string
  applicationUrl: string
}) {
  return sendEmail({
    to: data.email,
    type: 'applicationStatusChanged',
    data: {
      recipientName: data.name,
      recipientEmail: data.email,
      applicationNumber: data.applicationNumber,
      statusArabic: getStatusArabic(data.status),
      statusColor: getStatusColor(data.status),
      notes: data.notes,
      applicationUrl: data.applicationUrl,
    },
  })
}

/**
 * Helper function to send certificate issued notification
 */
export async function sendCertificateIssuedEmail(data: {
  email: string
  name: string
  certificateNumber: string
  ijazahType: string
  scholarName: string
  certificateUrl: string
  downloadUrl: string
}) {
  return sendEmail({
    to: data.email,
    type: 'certificateIssued',
    data: {
      recipientName: data.name,
      recipientEmail: data.email,
      certificateNumber: data.certificateNumber,
      ijazahType: getIjazahTypeArabic(data.ijazahType),
      scholarName: data.scholarName,
      certificateUrl: data.certificateUrl,
      downloadUrl: data.downloadUrl,
    },
  })
}

/**
 * Helper function to send review request notification to scholars
 */
export async function sendReviewRequestEmail(data: {
  email: string
  scholarName: string
  applicationNumber: string
  ijazahType: string
  studentName: string
  submittedDate: string
  reviewUrl: string
  isUrgent?: boolean
}) {
  return sendEmail({
    to: data.email,
    type: 'reviewRequest',
    data: {
      recipientName: data.scholarName,
      recipientEmail: data.email,
      applicationNumber: data.applicationNumber,
      ijazahType: getIjazahTypeArabic(data.ijazahType),
      studentName: data.studentName,
      submittedDate: data.submittedDate,
      reviewUrl: data.reviewUrl,
      isUrgent: data.isUrgent || false,
    },
  })
}

// Helper functions to translate values to Arabic
function getIjazahTypeArabic(type: string): string {
  const map: Record<string, string> = {
    'hifz': 'حفظ',
    'qirat': 'قراءات',
    'tajweed': 'تجويد',
    'sanad': 'سند',
  }
  return map[type] || type
}

function getStatusArabic(status: string): string {
  const map: Record<string, string> = {
    'submitted': 'تم التقديم',
    'under_review': 'قيد المراجعة',
    'interview_scheduled': 'تم جدولة المقابلة',
    'approved': 'تم القبول',
    'rejected': 'مرفوض',
    'expired': 'منتهي الصلاحية',
    'withdrawn': 'تم السحب',
  }
  return map[status] || status
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    'submitted': '#3B82F6',
    'under_review': '#F59E0B',
    'interview_scheduled': '#8B5CF6',
    'approved': '#10B981',
    'rejected': '#EF4444',
    'expired': '#6B7280',
    'withdrawn': '#6B7280',
  }
  return map[status] || '#1B4332'
}
