function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface EmailData {
  recipientName: string
  recipientEmail: string
  [key: string]: any
}

export const emailTemplates = {
  // Application submitted
  applicationSubmitted: (data: EmailData): EmailTemplate => ({
    subject: '✅ تم استلام طلب الإجازة - Application Received',
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 0; padding: 0; background-color: #FFFBF5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1B4332 0%, #235B3D 100%); padding: 40px 20px; text-center; }
    .header h1 { color: #B8860B; font-size: 28px; margin: 0 0 10px 0; font-family: 'Amiri', serif; }
    .header p { color: white; margin: 0; font-size: 16px; }
    .content { padding: 40px; }
    .content h2 { color: #1B4332; font-size: 22px; margin-bottom: 20px; font-family: 'Amiri', serif; }
    .content p { color: #2C3E50; line-height: 1.8; margin-bottom: 15px; }
    .info-box { background: #F5F0E6; border-right: 4px solid #B8860B; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .info-box strong { color: #1B4332; display: block; margin-bottom: 5px; }
    .button { display: inline-block; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #F5F0E6; padding: 30px; text-center; color: #7F8C8D; font-size: 14px; }
    .divider { height: 2px; background: linear-gradient(90deg, transparent, #B8860B, transparent); margin: 30px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 نظام الإجازة الإلكتروني</h1>
      <p>Ejazah</p>
    </div>
    <div class="content">
      <h2>السلام عليكم ورحمة الله وبركاته</h2>
      <p>عزيزي/عزيزتي <strong>${escapeHtml(data.recipientName)}</strong>،</p>

      <p>نشكركم على تقديم طلب الإجازة في نظامنا. تم استلام طلبكم بنجاح وسيتم مراجعته قريبًا إن شاء الله.</p>

      <div class="info-box">
        <strong>تفاصيل الطلب:</strong>
        <p>رقم الطلب: <strong>${escapeHtml(data.applicationNumber)}</strong></p>
        <p>نوع الإجازة: <strong>${escapeHtml(data.ijazahType)}</strong></p>
        <p>تاريخ التقديم: <strong>${escapeHtml(data.submittedDate)}</strong></p>
      </div>

      <p>سيتم إعلامكم عبر البريد الإلكتروني بأي تحديثات على حالة طلبكم.</p>

      <center>
        <a href="${escapeHtml(data.applicationUrl)}" class="button">
          عرض حالة الطلب
        </a>
      </center>

      <div class="divider"></div>

      <p style="color: #7F8C8D; font-size: 14px;">
        يمكنكم متابعة حالة طلبكم في أي وقت من خلال لوحة التحكم الخاصة بكم.
      </p>
    </div>
    <div class="footer">
      <p><strong>نظام الإجازة الإلكتروني</strong></p>
      <p>لأي استفسارات، يرجى التواصل معنا عبر البريد الإلكتروني</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي ${data.recipientName}،

نشكركم على تقديم طلب الإجازة في نظامنا. تم استلام طلبكم بنجاح وسيتم مراجعته قريبًا إن شاء الله.

تفاصيل الطلب:
- رقم الطلب: ${data.applicationNumber}
- نوع الإجازة: ${data.ijazahType}
- تاريخ التقديم: ${data.submittedDate}

سيتم إعلامكم عبر البريد الإلكتروني بأي تحديثات على حالة طلبكم.

عرض حالة الطلب: ${data.applicationUrl}

---
نظام الإجازة الإلكتروني
© ${new Date().getFullYear()} جميع الحقوق محفوظة
    `,
  }),

  // Application status changed
  applicationStatusChanged: (data: EmailData): EmailTemplate => ({
    subject: `📢 تحديث حالة طلب الإجازة - ${escapeHtml(data.statusArabic)}`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 0; padding: 0; background-color: #FFFBF5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1B4332 0%, #235B3D 100%); padding: 40px 20px; text-center; }
    .header h1 { color: #B8860B; font-size: 28px; margin: 0 0 10px 0; font-family: 'Amiri', serif; }
    .header p { color: white; margin: 0; font-size: 16px; }
    .content { padding: 40px; }
    .content h2 { color: #1B4332; font-size: 22px; margin-bottom: 20px; font-family: 'Amiri', serif; }
    .content p { color: #2C3E50; line-height: 1.8; margin-bottom: 15px; }
    .status-badge { display: inline-block; background: ${escapeHtml(data.statusColor || '#1B4332')}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
    .info-box { background: #F5F0E6; border-right: 4px solid #B8860B; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #F5F0E6; padding: 30px; text-center; color: #7F8C8D; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 نظام الإجازة الإلكتروني</h1>
      <p>تحديث حالة الطلب</p>
    </div>
    <div class="content">
      <h2>السلام عليكم ورحمة الله وبركاته</h2>
      <p>عزيزي/عزيزتي <strong>${escapeHtml(data.recipientName)}</strong>،</p>

      <p>تم تحديث حالة طلب الإجازة الخاص بكم:</p>

      <center>
        <div class="status-badge">${escapeHtml(data.statusArabic)}</div>
      </center>

      <div class="info-box">
        <p><strong>رقم الطلب:</strong> ${escapeHtml(data.applicationNumber)}</p>
        ${data.notes ? `<p><strong>ملاحظات المراجع:</strong></p><p>${escapeHtml(data.notes)}</p>` : ''}
      </div>

      <center>
        <a href="${escapeHtml(data.applicationUrl)}" class="button">
          عرض تفاصيل الطلب
        </a>
      </center>
    </div>
    <div class="footer">
      <p><strong>نظام الإجازة الإلكتروني</strong></p>
      <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي ${data.recipientName}،

تم تحديث حالة طلب الإجازة الخاص بكم إلى: ${data.statusArabic}

رقم الطلب: ${data.applicationNumber}
${data.notes ? `ملاحظات المراجع: ${data.notes}` : ''}

عرض تفاصيل الطلب: ${data.applicationUrl}

---
نظام الإجازة الإلكتروني
© ${new Date().getFullYear()} جميع الحقوق محفوظة
    `,
  }),

  // Certificate issued
  certificateIssued: (data: EmailData): EmailTemplate => ({
    subject: '🎓 تهانينا! تم إصدار شهادة الإجازة - Certificate Issued',
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 0; padding: 0; background-color: #FFFBF5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1B4332 0%, #235B3D 100%); padding: 40px 20px; text-center; position: relative; }
    .header::before { content: '🎓'; font-size: 60px; position: absolute; top: 20px; right: 20px; opacity: 0.2; }
    .header h1 { color: #B8860B; font-size: 32px; margin: 0 0 10px 0; font-family: 'Amiri', serif; }
    .header p { color: white; margin: 0; font-size: 18px; font-weight: 600; }
    .content { padding: 40px; }
    .content h2 { color: #1B4332; font-size: 24px; margin-bottom: 20px; font-family: 'Amiri', serif; text-align: center; }
    .content p { color: #2C3E50; line-height: 1.8; margin-bottom: 15px; }
    .certificate-box { background: linear-gradient(135deg, #F5F0E6 0%, #FFF8E7 100%); border: 3px solid #B8860B; padding: 30px; margin: 30px 0; border-radius: 12px; text-align: center; }
    .certificate-number { font-size: 32px; font-weight: 700; color: #1B4332; font-family: 'Amiri', serif; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
    .button-secondary { background: linear-gradient(135deg, #1B4332 0%, #235B3D 100%); }
    .footer { background: #F5F0E6; padding: 30px; text-center; color: #7F8C8D; font-size: 14px; }
    .congratulations { background: #FFF8E7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .congratulations p { font-size: 18px; color: #1B4332; font-weight: 600; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>مبارك عليكم!</h1>
      <p>تم إصدار شهادة الإجازة</p>
    </div>
    <div class="content">
      <div class="congratulations">
        <p>﴿وَقُلْ رَبِّ زِدْنِي عِلْماً﴾</p>
        <p style="font-size: 14px; color: #7F8C8D;">طه: 114</p>
      </div>

      <h2>السلام عليكم ورحمة الله وبركاته</h2>
      <p>عزيزي/عزيزتي <strong>${escapeHtml(data.recipientName)}</strong>،</p>

      <p>نبارك لكم إتمام مراحل الإجازة بنجاح! تم إصدار شهادة الإجازة الخاصة بكم.</p>

      <div class="certificate-box">
        <p style="color: #7F8C8D; margin-bottom: 10px;">رقم الشهادة</p>
        <div class="certificate-number">${escapeHtml(data.certificateNumber)}</div>
        <p style="color: #7F8C8D; margin-top: 10px;">نوع الإجازة: <strong style="color: #1B4332;">${escapeHtml(data.ijazahType)}</strong></p>
        <p style="color: #7F8C8D;">الشيخ المُجيز: <strong style="color: #1B4332;">${escapeHtml(data.scholarName)}</strong></p>
      </div>

      <p>يمكنكم الآن عرض شهادتكم وتنزيلها ومشاركتها مع الآخرين.</p>

      <center>
        <a href="${escapeHtml(data.certificateUrl)}" class="button">
          عرض الشهادة
        </a>
        <a href="${escapeHtml(data.downloadUrl)}" class="button button-secondary">
          تنزيل PDF
        </a>
      </center>

      <p style="margin-top: 30px; color: #7F8C8D; font-size: 14px; text-align: center;">
        💡 يمكن للجميع التحقق من صحة شهادتكم من خلال صفحة التحقق العامة
      </p>
    </div>
    <div class="footer">
      <p><strong>نظام الإجازة الإلكتروني</strong></p>
      <p>نسأل الله أن ينفعكم بما علمكم وأن يزيدكم علماً</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
مبارك عليكم! تم إصدار شهادة الإجازة

السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي ${data.recipientName}،

نبارك لكم إتمام مراحل الإجازة بنجاح! تم إصدار شهادة الإجازة الخاصة بكم.

رقم الشهادة: ${data.certificateNumber}
نوع الإجازة: ${data.ijazahType}
الشيخ المُجيز: ${data.scholarName}

عرض الشهادة: ${data.certificateUrl}
تنزيل PDF: ${data.downloadUrl}

يمكن للجميع التحقق من صحة شهادتكم من خلال صفحة التحقق العامة.

نسأل الله أن ينفعكم بما علمكم وأن يزيدكم علماً

---
نظام الإجازة الإلكتروني
© ${new Date().getFullYear()} جميع الحقوق محفوظة
    `,
  }),

  // Review request (for scholars)
  reviewRequest: (data: EmailData): EmailTemplate => ({
    subject: '📋 طلب مراجعة جديد - New Application Review Request',
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; margin: 0; padding: 0; background-color: #FFFBF5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #1B4332 0%, #235B3D 100%); padding: 40px 20px; text-center; }
    .header h1 { color: #B8860B; font-size: 28px; margin: 0 0 10px 0; font-family: 'Amiri', serif; }
    .header p { color: white; margin: 0; font-size: 16px; }
    .content { padding: 40px; }
    .content h2 { color: #1B4332; font-size: 22px; margin-bottom: 20px; font-family: 'Amiri', serif; }
    .content p { color: #2C3E50; line-height: 1.8; margin-bottom: 15px; }
    .info-box { background: #F5F0E6; border-right: 4px solid #B8860B; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #B8860B 0%, #D4AF37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background: #F5F0E6; padding: 30px; text-center; color: #7F8C8D; font-size: 14px; }
    .urgent { background: #FFF3CD; border-right-color: #FF6B6B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🕌 نظام الإجازة الإلكتروني</h1>
      <p>طلب مراجعة جديد</p>
    </div>
    <div class="content">
      <h2>السلام عليكم ورحمة الله وبركاته</h2>
      <p>فضيلة الشيخ <strong>${escapeHtml(data.recipientName)}</strong>،</p>

      <p>تم تعيين طلب إجازة جديد لمراجعتكم الكريمة.</p>

      <div class="info-box ${data.isUrgent ? 'urgent' : ''}">
        <p><strong>رقم الطلب:</strong> ${escapeHtml(data.applicationNumber)}</p>
        <p><strong>نوع الإجازة:</strong> ${escapeHtml(data.ijazahType)}</p>
        <p><strong>اسم الطالب:</strong> ${escapeHtml(data.studentName)}</p>
        <p><strong>تاريخ التقديم:</strong> ${escapeHtml(data.submittedDate)}</p>
        ${data.isUrgent ? '<p style="color: #FF6B6B; font-weight: 600;">⚠️ عاجل - يتطلب مراجعة فورية</p>' : ''}
      </div>

      <center>
        <a href="${escapeHtml(data.reviewUrl)}" class="button">
          مراجعة الطلب
        </a>
      </center>

      <p style="color: #7F8C8D; font-size: 14px; margin-top: 30px;">
        يمكنكم الوصول إلى جميع الطلبات المعينة لكم من خلال لوحة التحكم الخاصة بكم.
      </p>
    </div>
    <div class="footer">
      <p><strong>نظام الإجازة الإلكتروني</strong></p>
      <p>جزاكم الله خيراً على جهودكم في خدمة كتاب الله</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
السلام عليكم ورحمة الله وبركاته

فضيلة الشيخ ${data.recipientName}،

تم تعيين طلب إجازة جديد لمراجعتكم الكريمة.

تفاصيل الطلب:
- رقم الطلب: ${data.applicationNumber}
- نوع الإجازة: ${data.ijazahType}
- اسم الطالب: ${data.studentName}
- تاريخ التقديم: ${data.submittedDate}
${data.isUrgent ? '⚠️ عاجل - يتطلب مراجعة فورية' : ''}

مراجعة الطلب: ${data.reviewUrl}

جزاكم الله خيراً على جهودكم في خدمة كتاب الله

---
نظام الإجازة الإلكتروني
© ${new Date().getFullYear()} جميع الحقوق محفوظة
    `,
  }),
}
