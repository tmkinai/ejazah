import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic, Amiri } from 'next/font/google'
import { RTLProvider } from '@/components/shared/rtl-provider'
import { SessionProvider } from '@/components/shared/session-provider'
import './globals.css'

// Primary font for UI — load both arabic + latin so Latin text also uses IBM Plex
const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
  preload: true,
})

// Display font for headings and decorative text
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-amiri',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'نظام الإجازة - Ejazah',
  description: 'منصة رقمية متكاملة لإدارة الإجازات القرآنية والتحقق منها',
  keywords: 'إجازة, قرآن, تحقق, سند, شهادة, ejazah',
  authors: [{ name: 'Ejazah Team' }],
  creator: 'Ejazah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={`${ibmPlexSansArabic.variable} ${amiri.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${ibmPlexSansArabic.className} antialiased`}>
        <SessionProvider>
          <RTLProvider defaultRTL={true}>
            {children}
          </RTLProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
