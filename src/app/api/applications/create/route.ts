import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      ijazahType,
      personalInfo,
      academicBackground,
      quranExperience,
    } = body

    // Validate required fields
    if (!ijazahType?.ijazahType || !personalInfo || !academicBackground || !quranExperience) {
      return NextResponse.json(
        { error: 'بيانات ناقصة. يرجى ملء جميع الحقول المطلوبة.' },
        { status: 400 }
      )
    }

    // Generate application number
    const applicationNumber = `IJZ-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`

    // Create application in database
    const { data: application, error: dbError } = await supabase
      .from('ijazah_applications')
      .insert({
        user_id: user.id,
        application_number: applicationNumber,
        ijazah_type: ijazahType.ijazahType,
        status: 'submitted',
        personal_info: personalInfo,
        academic_background: academicBackground,
        quran_experience: quranExperience,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'فشل في حفظ الطلب. يرجى المحاولة لاحقاً.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        applicationNumber: application.application_number,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
