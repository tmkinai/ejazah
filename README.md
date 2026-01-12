# Ejazah - نظام الإجازة الإلكتروني

منصة رقمية متكاملة لإدارة الإجازات القرآنية والتحقق منها.

## المميزات

- ✅ تقديم سهل ومنظم للطلبات
- ✅ التحقق الآمن من الشهادات برمز QR
- ✅ شهادات معترف بها مع سلسلة السند
- ✅ لوحة تحكم للشيوخ والمُجيزين
- ✅ لوحة إدارة شاملة
- ✅ دعم اللغة العربية (RTL)

## التقنيات المستخدمة

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## التثبيت والتشغيل

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```

## المتغيرات البيئية

أنشئ ملف `.env.local` وأضف:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## الهيكل

```
src/
├── app/                 # App Router pages
├── components/          # React components
├── lib/                 # Utility functions
└── hooks/               # Custom React hooks
```

## الترخيص

جميع الحقوق محفوظة © 2026 Ejazah Team
# ejazah
