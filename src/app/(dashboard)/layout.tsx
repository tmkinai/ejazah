'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardHeader from '@/components/shared/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const [appSettings, setAppSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single()

      if (data) {
        setAppSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = appSettings?.primary_color || '#1B4332'
  const footerInfo = appSettings?.footer_info || 'أسانيد الإجازات القرآنية'
  const appName = appSettings?.app_name || 'نظام الإجازة'

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex flex-col" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
        
        :root {
          --primary-color: ${primaryColor};
        }
        
        .font-arabic {
          font-family: 'Noto Naskh Arabic', serif !important;
        }
        
        .font-ui {
          font-family: 'IBM Plex Sans Arabic', sans-serif !important;
        }
      `}} />

      <DashboardHeader appSettings={appSettings} />

      <main className="flex-1">
        {children}
      </main>

      <footer 
        className="text-white py-4 mt-auto"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-arabic opacity-90">
            {footerInfo} © {new Date().getFullYear()} - {appName}
          </p>
        </div>
      </footer>
    </div>
  )
}
