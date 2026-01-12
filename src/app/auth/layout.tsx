import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المصادقة - Ejazah',
  description: 'تسجيل الدخول والتسجيل',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
