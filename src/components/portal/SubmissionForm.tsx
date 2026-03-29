'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, CheckCircle } from 'lucide-react'

interface SubmissionFormProps {
  requestId: string
  studentEmail: string
  onSuccess: (submission: any) => void
}

export default function SubmissionForm({ requestId, studentEmail, onSuccess }: SubmissionFormProps) {
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
        const formData = new FormData()
        formData.append('file', audioFile)
        formData.append('bucket', 'submissions')

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error('Upload failed')

        const uploadData = await uploadRes.json()
        audioUrl = uploadData.url
      }

      // Create submission record
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          studentEmail,
          audioUrl,
          studentNotes,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      const data = await res.json()
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
