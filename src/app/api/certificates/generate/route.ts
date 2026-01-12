import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is scholar or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single()

    const isScholar = profile?.roles?.includes('scholar')
    const isAdmin = profile?.roles?.includes('admin')

    if (!isScholar && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { application_id } = body

    if (!application_id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    // Fetch application details
    const { data: application, error: appError } = await supabase
      .from('ijazah_applications')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          full_name_arabic,
          email
        ),
        scholars:scholar_id (
          id,
          specialization,
          sanad_chain,
          profiles:id (
            full_name,
            full_name_arabic
          )
        )
      `)
      .eq('id', application_id)
      .eq('status', 'approved')
      .single()

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found or not approved' }, { status: 404 })
    }

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('ijazah_certificates')
      .select('id, certificate_number')
      .eq('application_id', application_id)
      .single()

    if (existingCert) {
      return NextResponse.json({
        message: 'Certificate already exists',
        certificate_number: existingCert.certificate_number,
        certificate_id: existingCert.id,
      })
    }

    // Generate certificate number
    const { data: certNumberData, error: certNumberError } = await supabase
      .rpc('generate_certificate_number', { ijazah_type_param: application.ijazah_type })

    if (certNumberError) {
      console.error('Error generating certificate number:', certNumberError)
      return NextResponse.json({ error: 'Failed to generate certificate number' }, { status: 500 })
    }

    const certificateNumber = certNumberData

    // Generate verification hash
    const verificationHash = `${certificateNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Generate QR code
    const verificationUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ijazah.app'}/verify/${certificateNumber}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 1,
      color: {
        dark: '#1B4332',
        light: '#FFFFFF',
      },
    })

    // Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from('ijazah_certificates')
      .insert({
        application_id: application.id,
        user_id: application.user_id,
        scholar_id: application.scholar_id,
        certificate_number: certificateNumber,
        ijazah_type: application.ijazah_type,
        status: 'active',
        recitation: application.quran_experience?.recitation || null,
        memorization_level: application.quran_experience?.memorization_level || null,
        sanad_chain: (application as any).scholars?.sanad_chain || {},
        issue_date: new Date().toISOString().split('T')[0],
        qr_code_data: qrCodeDataUrl,
        qr_code_url: qrCodeDataUrl,
        verification_hash: verificationHash,
        metadata: {
          issued_by: user.id,
          issued_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (certError) {
      console.error('Error creating certificate:', certError)
      return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 })
    }

    // Update scholar's total ijazat issued count
    if (application.scholar_id) {
      // Increment scholar's total ijazat issued count
      const { error: rpcError } = await supabase.rpc('increment', {
        table_name: 'scholars',
        id_val: application.scholar_id,
        column_name: 'total_ijazat_issued',
      })

      if (rpcError) {
        // Manual update if RPC fails
        const { data: scholarData } = await supabase
          .from('scholars')
          .select('total_ijazat_issued')
          .eq('id', application.scholar_id)
          .single()

        if (scholarData) {
          await supabase
            .from('scholars')
            .update({ total_ijazat_issued: (scholarData.total_ijazat_issued || 0) + 1 })
            .eq('id', application.scholar_id)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        id: certificate.id,
        certificate_number: certificate.certificate_number,
        qr_code_url: certificate.qr_code_url,
        verification_url: verificationUrl,
      },
    })
  } catch (error: any) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
