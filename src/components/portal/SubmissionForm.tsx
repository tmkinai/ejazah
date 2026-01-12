'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle } from 'lucide-react'

interface SubmissionFormProps {
  requestId: string
  studentEmail: string
  onSuccess: (submission: any) => void
}

export default function SubmissionForm({ requestId, studentEmail, onSuccess }: SubmissionFormProps) {
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [studentNotes, setStudentNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let audioUrl = ''

      // Upload audio file if provided
      if (audioFile) {
        const fileExt = audioFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(`${requestId}/${fileName}`, audioFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(uploadData.path)

        audioUrl = publicUrl
      }

      // Create submission record
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          request_id: requestId,
          student_email: studentEmail,
          audio_url: audioUrl,
          student_notes: studentNotes,
        })
        .select()
        .single()

      if (error) throw error

      onSuccess(data)
      setAudioFile(null)
      setStudentNotes('')
    } catch (error) {
      console.error('Error submitting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-200">
      <CardHeader className="border-b bg-primary-100">
        <CardTitle className="font-arabic text-primary-900">رفع تلاوة جديدة</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio" className="font-arabic">
              ملف التلاوة (اختياري)
            </Label>
            <Input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="font-arabic">
              ملاحظات
            </Label>
            <Textarea
              id="notes"
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              rows={4}
              placeholder="أضف أي ملاحظات أو أسئلة للشيخ..."
              disabled={isSubmitting}
              className="font-arabic"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full font-arabic">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 ml-2" />
                رفع التلاوة
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
