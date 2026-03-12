'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Download, Share2, Loader2, Printer, ArrowLeft, Eye, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'

interface CertificateViewProps {
  certificateId: string
  onBack?: () => void
}

export default function CertificateView({ certificateId, onBack }: CertificateViewProps) {
  const supabase = createClient()
  const [certificate, setCertificate] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const certificateRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [certScale, setCertScale] = useState(1)

  const A4_WIDTH = 794
  const A4_HEIGHT = 1123

  useEffect(() => {
    if (certificateId) {
      fetchData()
    }
  }, [certificateId])

  // Scale certificate to fit container on all screen sizes
  useEffect(() => {
    if (!certificate) return
    const updateScale = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.offsetWidth
        setCertScale(w / A4_WIDTH)
      }
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    return () => observer.disconnect()
  }, [certificate])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch certificate
      const { data: certData, error: certError } = await supabase
        .from('ijazah_certificates')
        .select('*')
        .eq('id', certificateId)
        .single()

      if (certError) throw certError
      if (!certData) throw new Error('Certificate not found')

      // Fetch user profile if exists
      let studentName = certData.metadata?.student_name || 'غير محدد'
      if (certData.user_id && !certData.metadata?.student_name) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, full_name_arabic')
          .eq('id', certData.user_id)
          .single()
        if (profile) {
          studentName = profile.full_name_arabic || profile.full_name || studentName
        }
      }

      // Fetch scholar name if exists
      let scholarName = 'غير محدد'
      if (certData.scholar_id) {
        const { data: scholarProfile } = await supabase
          .from('profiles')
          .select('full_name, full_name_arabic')
          .eq('id', certData.scholar_id)
          .single()
        if (scholarProfile) {
          scholarName = scholarProfile.full_name_arabic || scholarProfile.full_name || scholarName
        }
      }

      // Fetch app settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single()

      setCertificate({
        ...certData,
        student_name: studentName,
        scholar_name: scholarName,
      })
      setSettings(settingsData || getDefaultSettings())
    } catch (err: any) {
      console.error('Error fetching certificate:', err)
      setError(err.message || 'حدث خطأ في تحميل الشهادة')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSettings = () => ({
    primary_color: '#1B4332',
    secondary_color: '#B8860B',
    bg_color: '#FFFBF5',
    font_family: 'IBM Plex Sans Arabic',
    font_url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    header_text: 'إجازة قرآنية',
    student_label: 'المجــــاز',
    narration_label: 'الإجازة',
    content_font_size: 16,
    background_pattern: 'diamonds',
    show_guilloche: true,
    pattern_opacity: 0.35,
    border_style: 'simple',
    header_align: 'center',
    content_align: 'center',
    student_info_layout: 'inline',
    qr_size: 80,
    signature_size: 280,
    seal_size: 120,
    footer_info: 'أسانيد الإجازات القرآنية',
    default_issue_place: 'المملكة العربية السعودية',
  })

  // Settings variables
  const primaryColor = settings?.primary_color || '#1B4332'
  const secondaryColor = settings?.secondary_color || '#B8860B'
  const bgColor = settings?.bg_color || '#FFFBF5'
  const fontFamily = settings?.font_family || 'IBM Plex Sans Arabic'
  const fontUrl = settings?.font_url || 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap'
  const customFontFile = settings?.custom_font_file_url || ''
  const certificateTitle = certificate?.metadata?.certificate_title || settings?.header_text || 'إجازة قرآنية'
  const studentLabel = settings?.student_label || 'المجــــاز'
  const narrationLabel = settings?.narration_label || 'الإجازة'
  const fontSize = settings?.content_font_size || 16
  const backgroundPattern = settings?.background_pattern || 'diamonds'
  const showGuilloche = settings?.show_guilloche !== false
  const patternOpacity = settings?.pattern_opacity || 0.35
  const borderStyle = settings?.border_style || 'simple'
  const headerAlign = settings?.header_align || 'center'
  const contentAlign = settings?.content_align || 'center'
  const studentInfoLayout = settings?.student_info_layout || 'inline'
  const qrSize = settings?.qr_size || 80
  const signatureSize = settings?.signature_size || 280
  const sealSize = settings?.seal_size || 120
  const backgroundImage = settings?.background_image_url || ''
  const secondSignatureTitle = settings?.second_signature_title || 'الختم'

  // Certificate data
  const studentName = certificate?.student_name || 'غير محدد'
  const narrationText = certificate?.recitation || certificate?.metadata?.narration_type_name || 'غير محدد'
  const introductionText = certificate?.metadata?.introduction || settings?.default_introduction || ''
  const ijazahText = certificate?.metadata?.custom_content || certificate?.metadata?.ijazah_text || ''
  const issuePlace = certificate?.metadata?.issue_place || settings?.default_issue_place || 'المملكة العربية السعودية'
  const serialNumber = certificate?.certificate_number || 'N/A'
  const studentInfo = certificate?.metadata?.student_information || ''
  const narrationDescription = settings?.narration_description || ''
  const hijriDate = certificate?.metadata?.hijri_date || ''
  const digitalFingerprint = certificate?.verification_hash || ''

  const gregorianDate = certificate?.issue_date
    ? format(new Date(certificate.issue_date), 'yyyy/MM/dd', { locale: ar })
    : ''

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify?certificate=${certificate?.certificate_number}`
    : ''

  const getPatternSVG = () => {
    const baseOpacity = patternOpacity
    
    switch(backgroundPattern) {
      case 'geometric':
        return `
          <pattern id="bg-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="20" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <rect x="20" y="20" width="40" height="40" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <polygon points="40,10 50,30 30,30" fill="${primaryColor}" opacity="${baseOpacity * 0.6}" />
            <polygon points="40,70 50,50 30,50" fill="${primaryColor}" opacity="${baseOpacity * 0.6}" />
          </pattern>
        `
      case 'islamic':
        return `
          <pattern id="bg-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30,10 L40,25 L30,40 L20,25 Z" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <circle cx="30" cy="30" r="8" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <path d="M15,15 L45,15 L45,45 L15,45 Z" fill="none" stroke="${primaryColor}" stroke-width="0.3" opacity="${baseOpacity * 0.6}" />
          </pattern>
        `
      case 'waves':
        return `
          <pattern id="bg-pattern" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
            <path d="M0,25 Q25,15 50,25 T100,25" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <path d="M0,35 Q25,25 50,35 T100,35" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <line x1="0" y1="10" x2="100" y2="10" stroke="${primaryColor}" stroke-width="0.3" opacity="${baseOpacity * 0.6}" />
          </pattern>
        `
      case 'dots':
        return `
          <pattern id="bg-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="${primaryColor}" opacity="${baseOpacity}" />
            <circle cx="30" cy="10" r="2" fill="${primaryColor}" opacity="${baseOpacity * 0.8}" />
            <circle cx="10" cy="30" r="2" fill="${primaryColor}" opacity="${baseOpacity * 0.8}" />
            <circle cx="30" cy="30" r="2" fill="${primaryColor}" opacity="${baseOpacity * 0.6}" />
            <circle cx="20" cy="20" r="1.5" fill="${primaryColor}" opacity="${baseOpacity * 0.5}" />
          </pattern>
        `
      case 'lines':
        return `
          <pattern id="bg-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="50" y2="50" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <line x1="50" y1="0" x2="0" y2="50" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <line x1="25" y1="0" x2="25" y2="50" stroke="${primaryColor}" stroke-width="0.3" opacity="${baseOpacity * 0.8}" />
            <line x1="0" y1="25" x2="50" y2="25" stroke="${primaryColor}" stroke-width="0.3" opacity="${baseOpacity * 0.8}" />
          </pattern>
        `
      case 'diamonds':
      default:
        return `
          <pattern id="bg-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <polygon points="30,10 40,20 30,30 20,20" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity}" />
            <polygon points="30,30 40,40 30,50 20,40" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <polygon points="10,30 20,40 10,50 0,40" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <polygon points="50,30 60,40 50,50 40,40" fill="none" stroke="${primaryColor}" stroke-width="0.5" opacity="${baseOpacity * 0.8}" />
            <polygon points="15,15 18,21 12,21" fill="${primaryColor}" opacity="${baseOpacity * 0.6}" />
            <polygon points="45,15 48,21 42,21" fill="${primaryColor}" opacity="${baseOpacity * 0.6}" />
          </pattern>
        `
    }
  }

  const getBorderStyle = () => {
    if (borderStyle === 'double') {
      return {
        border: `3px solid ${primaryColor}`,
        boxShadow: `0 0 0 1px ${primaryColor}, 0 0 0 8px ${bgColor}, 0 0 0 11px ${primaryColor}40`,
      }
    } else if (borderStyle === 'decorative') {
      return {
        border: `4px solid ${primaryColor}`,
        boxShadow: `inset 0 0 0 2px ${bgColor}, 0 0 0 8px ${bgColor}, 0 0 0 12px ${primaryColor}30`,
      }
    } else {
      return {
        border: `3px solid ${primaryColor}`,
        boxShadow: `0 0 0 8px ${bgColor}, 0 0 0 11px ${primaryColor}20`,
      }
    }
  }

  const downloadAsImage = async () => {
    if (!certificateRef.current) return
    
    setIsGenerating(true)
    
    const element = certificateRef.current

    try {
      // Wait for all fonts to load
      await document.fonts.ready
      
      // Small delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const link = document.createElement('a')
      link.href = imgData
      link.download = `إجازة-${studentName}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating image:', error)
      alert('حدث خطأ أثناء إنشاء الصورة. الرجاء المحاولة مرة أخرى.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCertificateImage = async (): Promise<string | null> => {
    if (!certificateRef.current) return null
    await document.fonts.ready
    await new Promise(resolve => setTimeout(resolve, 300))
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
      logging: false,
    })
    return canvas.toDataURL('image/png', 1.0)
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      const imgData = await generateCertificateImage()
      if (!imgData) return
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
          <html dir="rtl">
            <head>
              <title>طباعة الشهادة - ${studentName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                @page { size: A4 landscape; margin: 0; }
                body { margin: 0; padding: 0; background: white; display: flex; align-items: center; justify-content: center; height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; display: block; }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
              <script>
                window.onload = function() {
                  setTimeout(function() { window.print(); window.close(); }, 600);
                };
              </script>
            </body>
          </html>`)
        printWindow.document.close()
      }
    } catch (err) {
      console.error('Print error:', err)
    } finally {
      setIsPrinting(false)
    }
  }

  const handlePreview = async () => {
    setIsGenerating(true)
    try {
      const imgData = await generateCertificateImage()
      if (!imgData) return
      setPreviewImage(imgData)
      setShowPreview(true)
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `إجازة قرآنية للطالب: ${studentName}`,
          text: 'يمكنكم التحقق من صحة هذه الإجازة عبر الرابط التالي.',
          url: shareUrl,
        })
        return
      } catch (error: any) {
        if (error.name === 'AbortError') return
        console.log('Share failed, falling back to clipboard:', error)
      }
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('تم نسخ الرابط!')
    } catch (clipboardError) {
      console.error('Clipboard copy failed:', clipboardError)
      alert(`الرابط: ${shareUrl}\n\nيمكنك نسخه يدوياً`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary-700" />
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4 font-arabic">لم يتم العثور على الإجازة</h2>
        <p className="text-red-500 mb-4">{error}</p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        )}
      </div>
    )
  }

  // Unified View (all screen sizes — certificate scales to fit container)
  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
        ${customFontFile ? `
          @font-face {
            font-family: 'CustomFont';
            src: url('${customFontFile}');
            font-weight: normal;
            font-style: normal;
          }
        ` : `@import url('${fontUrl}');`}
        
        .certificate-content {
          font-family: ${customFontFile ? "'CustomFont'" : `'${fontFamily}'`}, 'Amiri', sans-serif !important;
        }
        
        .certificate-title {
          font-family: 'Amiri', 'Traditional Arabic', 'Arial', sans-serif !important;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          font-weight: 700;
          letter-spacing: 2px;
        }
        
        .cert-scale-wrapper {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .cert-scale-inner {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: top left;
        }
        
        .security-watermark {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 1;
        }
        
        .security-watermark svg {
          width: 100%;
          height: 100%;
        }
        
        .security-line {
          font-size: 6px;
          line-height: 1.2;
          letter-spacing: 1px;
          color: ${primaryColor}50;
          overflow: hidden;
          white-space: nowrap;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          text-rendering: geometricPrecision;
        }
        
        .guilloche-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          overflow: hidden;
          z-index: 2;
        }
        
        .guilloche-corner.top-right {
          top: -2px;
          right: -2px;
          background: 
            radial-gradient(circle at 100% 0%, transparent 45%, ${primaryColor}15 45%, ${primaryColor}15 47%, transparent 47%),
            radial-gradient(circle at 100% 0%, transparent 55%, ${primaryColor}25 55%, ${primaryColor}25 57%, transparent 57%),
            radial-gradient(circle at 100% 0%, transparent 65%, ${primaryColor}35 65%, ${primaryColor}35 67%, transparent 67%);
          border-top-right-radius: 8px;
        }
        
        .guilloche-corner.top-left {
          top: -2px;
          left: -2px;
          background: 
            radial-gradient(circle at 0% 0%, transparent 45%, ${primaryColor}15 45%, ${primaryColor}15 47%, transparent 47%),
            radial-gradient(circle at 0% 0%, transparent 55%, ${primaryColor}25 55%, ${primaryColor}25 57%, transparent 57%),
            radial-gradient(circle at 0% 0%, transparent 65%, ${primaryColor}35 65%, ${primaryColor}35 67%, transparent 67%);
          border-top-left-radius: 8px;
        }
        
        .guilloche-corner.bottom-right {
          bottom: -2px;
          right: -2px;
          background: 
            radial-gradient(circle at 100% 100%, transparent 45%, ${primaryColor}15 45%, ${primaryColor}15 47%, transparent 47%),
            radial-gradient(circle at 100% 100%, transparent 55%, ${primaryColor}25 55%, ${primaryColor}25 57%, transparent 57%),
            radial-gradient(circle at 100% 100%, transparent 65%, ${primaryColor}35 65%, ${primaryColor}35 67%, transparent 67%);
          border-bottom-right-radius: 8px;
        }
        
        .guilloche-corner.bottom-left {
          bottom: -2px;
          left: -2px;
          background: 
            radial-gradient(circle at 0% 100%, transparent 45%, ${primaryColor}15 45%, ${primaryColor}15 47%, transparent 47%),
            radial-gradient(circle at 0% 100%, transparent 55%, ${primaryColor}25 55%, ${primaryColor}25 57%, transparent 57%),
            radial-gradient(circle at 0% 100%, transparent 65%, ${primaryColor}35 65%, ${primaryColor}35 67%, transparent 67%);
          border-bottom-left-radius: 8px;
        }
      `}} />

      {/* Action Buttons — responsive for all screen sizes */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center px-2">
        {onBack && (
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
        )}
        <Button
          onClick={downloadAsImage}
          className="flex items-center gap-2"
          style={{ backgroundColor: primaryColor }}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Download size={16} />
              حفظ (صورة)
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2"
        >
          {isPrinting ? (
            <><Loader2 className="w-4 h-4 animate-spin ml-1" />جاري التجهيز...</>
          ) : (
            <><Printer size={16} />طباعة</>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin ml-1" />جاري المعاينة...</>
          ) : (
            <><Eye size={16} />معاينة</>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 size={16} />
          مشاركة
        </Button>
      </div>

      {/* Certificate — scales proportionally to fit any screen */}
      <div
        id="print-certificate"
        ref={wrapperRef}
        className="cert-scale-wrapper shadow-2xl w-full"
        style={{ height: `${A4_HEIGHT * certScale}px` }}
      >
        <div
          ref={certificateRef}
          className="cert-scale-inner bg-cover bg-center text-right flex flex-col p-8"
          style={{
            width: `${A4_WIDTH}px`,
            height: `${A4_HEIGHT}px`,
            transform: `scale(${certScale})`,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundColor: bgColor,
          }}
        >
          {backgroundImage && (
            <div 
              className="absolute inset-0" 
              style={{
                background: `linear-gradient(135deg, ${bgColor}e0 0%, ${bgColor}d8 50%, ${bgColor}e0 100%)`,
                backdropFilter: 'blur(0.5px)',
              }}
            />
          )}
          
          <div 
            className="relative z-10 h-full bg-white/70 backdrop-blur-sm p-10 flex flex-col rounded-lg"
            style={getBorderStyle()}
          >
            {/* Security Watermark Pattern */}
            <div className="security-watermark">
              <svg xmlns="http://www.w3.org/2000/svg" dangerouslySetInnerHTML={{ __html: `
                <defs>${getPatternSVG()}</defs>
                <rect width="100%" height="100%" fill="url(#bg-pattern)" opacity="${patternOpacity * 1.5}" />
              `}} />
            </div>
            
            {/* Guilloche Corners */}
            {showGuilloche && (
              <>
                <div className="guilloche-corner top-right"></div>
                <div className="guilloche-corner top-left"></div>
                <div className="guilloche-corner bottom-right"></div>
                <div className="guilloche-corner bottom-left"></div>
              </>
            )}
            
            {/* Security Line Top */}
            <div className="security-line mb-2 text-center relative z-10">
              AUTHENTIC • VERIFIED • {serialNumber} • SECURE DOCUMENT • لا يمكن تزويره • مصادق رقمياً
            </div>
            
            {/* Header */}
            <div className="mb-6 relative z-10 text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  width="100%" 
                  height="80" 
                  viewBox="0 0 400 60" 
                  style={{ maxWidth: '500px' }}
                >
                  <text 
                    x="50%" 
                    y="50%" 
                    dominantBaseline="middle" 
                    textAnchor="middle"
                    fill={primaryColor}
                    fontSize="42"
                    fontWeight="bold"
                    fontFamily="'Amiri', 'Traditional Arabic', 'Times New Roman', serif"
                  >
                    {certificateTitle}
                  </text>
                </svg>
              </div>
              
              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-3 mt-6 mb-6">
                <div className="h-px flex-1 max-w-32" style={{ backgroundColor: `${primaryColor}60` }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: primaryColor }}></div>
                <div className="h-px flex-1 max-w-32" style={{ backgroundColor: `${primaryColor}60` }}></div>
              </div>

              {/* Student Info */}
              {studentInfoLayout === 'inline' ? (
                <div className="flex justify-center items-center gap-8 flex-wrap certificate-content" style={{ fontSize: `${Math.round(fontSize * 0.95)}px` }}>
                  <div>
                    <span className="font-bold">{studentLabel}: </span>
                    <span style={{ color: primaryColor }} className="font-bold">
                      {studentName}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">{narrationLabel}: </span>
                    <span style={{ color: primaryColor }} className="font-bold">
                      {narrationText}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 certificate-content" style={{ fontSize: `${Math.round(fontSize * 0.95)}px` }}>
                  <div className="text-center">
                    <span className="font-bold">{studentLabel}: </span>
                    <span style={{ color: primaryColor }} className="font-bold">
                      {studentName}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="font-bold">{narrationLabel}: </span>
                    <span style={{ color: primaryColor }} className="font-bold">
                      {narrationText}
                    </span>
                  </div>
                </div>
              )}
              
              {studentInfo && (
                <p className="text-sm text-gray-600 mt-5">{studentInfo}</p>
              )}
              {narrationDescription && (
                <p className="text-sm text-gray-600 mt-1">{narrationDescription}</p>
              )}
            </div>

            {/* Content Body */}
            <div 
              className="space-y-4 flex-grow certificate-content px-6 relative z-10"
              style={{ 
                fontSize: `${Math.round(fontSize * 1.15)}px`, 
                lineHeight: '2.1',
                textAlign: 'justify',
                textJustify: 'inter-word',
                wordBreak: 'break-word',
                hyphens: 'auto',
              }}
            >
              {introductionText && (
                <div 
                  className="font-semibold"
                  style={{ 
                    color: primaryColor, 
                    lineHeight: '2.1',
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                  }}
                >
                  {introductionText}
                </div>
              )}
              {ijazahText && (
                <div 
                  className="font-semibold"
                  style={{ 
                    color: primaryColor, 
                    lineHeight: '2.1',
                    textAlign: 'justify',
                    textJustify: 'inter-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: ijazahText }}
                />
              )}
            </div>

            {/* Security Line Bottom */}
            <div className="security-line mt-2 mb-4 text-center relative z-10">
              SHA-256 • DIGITAL FINGERPRINT • {digitalFingerprint?.substring(0, 16) || 'SECURE'}... • مؤمن رقمياً
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t relative z-10" style={{ borderColor: `${primaryColor}30` }}>
              <div className="grid grid-cols-3 items-end gap-4 certificate-content">
                {/* QR Code & Details */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-center">
                    <div 
                      className="p-2 rounded-lg inline-block"
                      style={{ backgroundColor: `${primaryColor}10`, border: `2px solid ${primaryColor}30` }}
                    >
                      <QRCodeSVG 
                        value={verificationUrl}
                        size={qrSize}
                        level="H"
                      />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">للتحقق من صحة الإجازة</div>
                  </div>
                  
                  <div className="text-sm flex-1">
                    <div className="mb-2">
                      <div className="font-bold text-gray-800">رقم الإجازة:</div>
                      <div className="font-bold font-mono" style={{ color: primaryColor, fontSize: '13px' }}>
                        {serialNumber}
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold text-gray-800">مكان الإصدار: </span>
                      <span className="font-semibold text-gray-700" style={{ fontSize: '12px' }}>{issuePlace}</span>
                    </div>
                    <div className="mb-2">
                      <span className="font-bold text-gray-800">تاريخ الإصدار: </span>
                      <span className="font-semibold text-gray-700" style={{ fontSize: '12px' }}>{gregorianDate}</span>
                    </div>
                    {hijriDate && (
                      <div>
                        <span className="font-bold text-gray-800">التاريخ الهجري: </span>
                        <span className="font-semibold text-gray-700" style={{ fontSize: '12px' }}>{hijriDate}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Seal / Second Signature */}
                <div className="flex flex-col items-center justify-end">
                  {settings?.second_signature_image_url && (
                    <div className="text-center">
                      <img 
                        src={settings.second_signature_image_url}
                        alt={secondSignatureTitle}
                        className="w-auto object-contain mx-auto"
                        style={{ maxWidth: `${sealSize}px`, maxHeight: `${sealSize}px` }}
                      />
                      {secondSignatureTitle && (
                        <p className="text-xs text-gray-700 mt-2 font-semibold text-center">{secondSignatureTitle}</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Main Signature */}
                <div className="flex flex-col items-end justify-end">
                  {settings?.signature_image_url ? (
                    <img 
                      src={settings.signature_image_url}
                      alt="توقيع المجيز"
                      className="w-auto object-contain"
                      style={{ maxWidth: `${signatureSize}px`, maxHeight: '120px', minHeight: '60px' }}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="font-bold" style={{ color: primaryColor }}>{certificate?.scholar_name}</p>
                      <p className="text-xs text-gray-500 mt-1">المُجيز</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Link */}
      <div className="text-sm text-gray-500 text-center p-2">
        يمكن التحقق من صحة هذه الإجازة عبر زيارة:{' '}
        <a 
          href={verificationUrl} 
          className="hover:underline break-all" 
          style={{ color: primaryColor }}
          target="_blank" 
          rel="noopener noreferrer"
        >
          {verificationUrl}
        </a>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl w-full p-2 overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader className="px-4 pt-2 pb-1 sticky top-0 bg-white z-10 border-b">
            <DialogTitle className="text-right font-arabic">معاينة الشهادة</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {previewImage && (
              <img
                src={previewImage}
                alt="معاينة الشهادة"
                className="w-full rounded-lg shadow-lg"
              />
            )}
            <div className="flex gap-2 justify-center pb-2">
              <Button
                onClick={handlePrint}
                disabled={isPrinting}
                style={{ backgroundColor: primaryColor }}
                className="flex items-center gap-2"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer size={16} />}
                طباعة
              </Button>
              <Button
                onClick={downloadAsImage}
                disabled={isGenerating}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                حفظ صورة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
