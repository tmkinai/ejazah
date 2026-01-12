-- Ijazah Management System - Initial Database Schema
-- Run this in Supabase SQL Editor
-- Version: 1.1 (Fixed profile creation and RLS policies)

-- =============================================
-- PROFILES TABLE
-- =============================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    full_name_arabic TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female')),
    country TEXT,
    city TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_level TEXT DEFAULT 'basic' CHECK (verification_level IN ('basic', 'verified', 'premium')),
    roles TEXT[] DEFAULT ARRAY['student']::TEXT[],
    metadata JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Admin policies
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'admin' = ANY(roles)
        )
    );

CREATE POLICY "Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'admin' = ANY(roles)
        )
    );

-- =============================================
-- SCHOLARS TABLE
-- =============================================

-- Create scholars table
CREATE TABLE IF NOT EXISTS public.scholars (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specialization TEXT NOT NULL,
    credentials JSONB NOT NULL DEFAULT '{}',
    sanad_chain JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    acceptance_rate DECIMAL DEFAULT 0.0,
    total_ijazat_issued INTEGER DEFAULT 0,
    bio_detailed TEXT,
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'students_only')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scholars_specialization ON public.scholars(specialization);
CREATE INDEX IF NOT EXISTS idx_scholars_is_active ON public.scholars(is_active);

-- Enable RLS
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active scholars" ON public.scholars;
DROP POLICY IF EXISTS "Scholars can update own profile" ON public.scholars;

-- RLS policies for scholars
CREATE POLICY "Public can view active scholars" 
    ON public.scholars FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Scholars can update own profile" 
    ON public.scholars FOR UPDATE 
    USING (auth.uid() = id);

-- =============================================
-- IJAZAH APPLICATIONS TABLE
-- =============================================

-- Create ENUM types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE ijazah_type AS ENUM ('hifz', 'qirat', 'tajweed', 'sanad');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('draft', 'submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'expired', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.ijazah_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL,
    application_number TEXT UNIQUE NOT NULL,
    ijazah_type ijazah_type NOT NULL,
    status application_status NOT NULL DEFAULT 'draft',
    
    -- Personal Information
    personal_info JSONB NOT NULL DEFAULT '{}',
    
    -- Academic Background
    academic_background JSONB NOT NULL DEFAULT '{}',
    
    -- Quran Experience
    quran_experience JSONB NOT NULL DEFAULT '{}',
    
    -- Prerequisites
    prerequisites JSONB DEFAULT '[]'::JSONB,
    
    -- Documents
    documents JSONB DEFAULT '[]'::JSONB,
    
    -- Review Process
    reviewer_notes TEXT,
    interview_notes TEXT,
    prerequisites_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    interview_completed_at TIMESTAMP WITH TIME ZONE,
    decided_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.ijazah_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scholar_id ON public.ijazah_applications(scholar_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.ijazah_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_ijazah_type ON public.ijazah_applications(ijazah_type);
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.ijazah_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.ijazah_applications(created_at);

-- Enable RLS
ALTER TABLE public.ijazah_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own applications" ON public.ijazah_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.ijazah_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.ijazah_applications;
DROP POLICY IF EXISTS "Users can delete own draft applications" ON public.ijazah_applications;
DROP POLICY IF EXISTS "Scholars can view assigned applications" ON public.ijazah_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.ijazah_applications;

-- RLS policies for applications
CREATE POLICY "Users can view own applications" 
    ON public.ijazah_applications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" 
    ON public.ijazah_applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" 
    ON public.ijazah_applications FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Users can delete own draft applications" 
    ON public.ijazah_applications FOR DELETE 
    USING (auth.uid() = user_id AND status = 'draft');

CREATE POLICY "Scholars can view assigned applications" 
    ON public.ijazah_applications FOR SELECT 
    TO authenticated 
    USING (
        scholar_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'scholar' = ANY(roles)
        )
    );

CREATE POLICY "Admins can manage all applications" 
    ON public.ijazah_applications FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND 'admin' = ANY(roles)
        )
    );

-- =============================================
-- IJAZAH CERTIFICATES TABLE
-- =============================================

-- Create certificate status enum
DO $$ BEGIN
    CREATE TYPE certificate_status AS ENUM ('active', 'revoked', 'expired', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.ijazah_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID REFERENCES public.ijazah_applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE SET NULL,
    
    -- Certificate Details
    certificate_number TEXT UNIQUE NOT NULL,
    ijazah_type ijazah_type NOT NULL,
    status certificate_status NOT NULL DEFAULT 'active',
    
    -- Quranic Details
    recitation TEXT, -- e.g., "Hafs 'an 'Asim"
    memorization_level TEXT, -- e.g., "Complete Quran", "Juz Amma"
    sanad_chain JSONB, -- Chain of narration from the Prophet (PBUH)
    
    -- Certificate Data
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE, -- Optional expiration
    qr_code_url TEXT, -- URL to QR code image
    qr_code_data TEXT, -- Raw QR code data
    certificate_pdf_url TEXT, -- URL to generated PDF
    
    -- Verification
    verification_hash TEXT UNIQUE, -- For blockchain/verification
    is_verified BOOLEAN DEFAULT TRUE,
    verification_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Additional Data
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.ijazah_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_scholar_id ON public.ijazah_certificates(scholar_id);
CREATE INDEX IF NOT EXISTS idx_certificates_application_id ON public.ijazah_certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.ijazah_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_hash ON public.ijazah_certificates(verification_hash);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.ijazah_certificates(status);

-- Enable RLS
ALTER TABLE public.ijazah_certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own certificates" ON public.ijazah_certificates;
DROP POLICY IF EXISTS "Public can verify certificates" ON public.ijazah_certificates;
DROP POLICY IF EXISTS "Scholars can view issued certificates" ON public.ijazah_certificates;
DROP POLICY IF EXISTS "Admins can manage all certificates" ON public.ijazah_certificates;

-- RLS policies for certificates
CREATE POLICY "Users can view own certificates" 
    ON public.ijazah_certificates FOR SELECT 
    USING (auth.uid() = user_id);

-- Allow anyone to verify certificates by certificate_number or verification_hash
CREATE POLICY "Public can verify certificates" 
    ON public.ijazah_certificates FOR SELECT 
    TO anon, authenticated
    USING (TRUE);

CREATE POLICY "Scholars can view issued certificates" 
    ON public.ijazah_certificates FOR SELECT 
    TO authenticated 
    USING (scholar_id = auth.uid());

CREATE POLICY "Admins can manage all certificates" 
    ON public.ijazah_certificates FOR ALL 
    TO authenticated 
    USING (auth_user_is_admin());

-- =============================================
-- VERIFICATION LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_id UUID REFERENCES public.ijazah_certificates(id) ON DELETE CASCADE,
    
    -- Verifier Information
    verifier_ip TEXT,
    verifier_user_agent TEXT,
    verifier_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Verification Details
    verification_method TEXT, -- 'qr_code', 'certificate_number', 'hash'
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    
    -- Geolocation (optional)
    country TEXT,
    city TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_logs_certificate_id ON public.verification_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON public.verification_logs(created_at);

-- Enable RLS (everyone can create verification logs)
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create verification logs" ON public.verification_logs;
DROP POLICY IF EXISTS "Users can view own verification attempts" ON public.verification_logs;
DROP POLICY IF EXISTS "Admins can view all verification logs" ON public.verification_logs;

CREATE POLICY "Anyone can create verification logs" 
    ON public.verification_logs FOR INSERT 
    TO anon, authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Users can view own verification attempts" 
    ON public.verification_logs FOR SELECT 
    TO authenticated
    USING (verifier_user_id = auth.uid());

CREATE POLICY "Admins can view all verification logs" 
    ON public.verification_logs FOR SELECT 
    TO authenticated 
    USING (auth_user_is_admin());

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (drop first if exists)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_scholars_updated_at ON public.scholars;
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.ijazah_applications;
DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.ijazah_certificates;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scholars_updated_at 
    BEFORE UPDATE ON public.scholars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON public.ijazah_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at 
    BEFORE UPDATE ON public.ijazah_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROFILE AUTO-CREATION ON SIGNUP
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, phone_number)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
        phone_number = COALESCE(NULLIF(EXCLUDED.phone_number, ''), public.profiles.phone_number),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number(ijazah_type_param ijazah_type)
RETURNS TEXT AS $$
DECLARE
    type_prefix TEXT;
    year_part TEXT;
    random_part TEXT;
BEGIN
    -- Generate prefix based on type
    type_prefix := CASE ijazah_type_param
        WHEN 'hifz' THEN 'HFZ'
        WHEN 'qirat' THEN 'QRT'
        WHEN 'tajweed' THEN 'TJW'
        WHEN 'sanad' THEN 'SND'
        ELSE 'IJZ'
    END;
    
    year_part := TO_CHAR(NOW(), 'YY');
    random_part := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    
    RETURN type_prefix || '-' || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to increment certificate verification count
CREATE OR REPLACE FUNCTION increment_certificate_verification(cert_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.ijazah_certificates 
    SET 
        verification_count = verification_count + 1,
        last_verified_at = NOW()
    WHERE id = cert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'IJZ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION auth_user_has_role(target_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND target_role = ANY(roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth_user_has_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- Insert default specializations for scholars
-- You can uncomment and run this if you want preset data

/*
INSERT INTO public.scholars (id, specialization, credentials, sanad_chain)
VALUES 
    -- Add your first admin/scholar user's ID here after creating them
    -- ('your-user-uuid-here', 'Hifz & Tajweed', '{"degrees": ["Ijazah in Hafs"]}', '{"chain": ["Scholar Name"]}')
;
*/

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- =============================================
-- SUBMISSIONS TABLE (Student Recitation Uploads)
-- =============================================

CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.ijazah_applications(id) ON DELETE CASCADE NOT NULL,
    student_email TEXT NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    audio_url TEXT,
    audio_uri TEXT,
    student_notes TEXT,
    sheikh_notes TEXT,
    is_reviewed BOOLEAN DEFAULT FALSE,
    student_seen_review BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_request_id ON public.submissions(request_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_email ON public.submissions(student_email);
CREATE INDEX IF NOT EXISTS idx_submissions_is_reviewed ON public.submissions(is_reviewed);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (student_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Users can create submissions for their requests
CREATE POLICY "Users can create submissions"
    ON public.submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

-- Users can update their own unreviewed submissions
CREATE POLICY "Users can update own unreviewed submissions"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING (student_email = (SELECT email FROM public.profiles WHERE id = auth.uid()) AND is_reviewed = FALSE);

-- Scholars and admins can view all submissions
CREATE POLICY "Scholars and admins can view all submissions"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (public.is_scholar() = true OR public.is_admin() = true);

-- Scholars and admins can update submissions (for reviews)
CREATE POLICY "Scholars and admins can update submissions"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING (public.is_scholar() = true OR public.is_admin() = true);

-- =============================================
-- NARRATION TYPES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.narration_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_reading TEXT NOT NULL,
    description TEXT,
    details TEXT,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, parent_reading)
);

CREATE INDEX IF NOT EXISTS idx_narration_types_parent ON public.narration_types(parent_reading);
CREATE INDEX IF NOT EXISTS idx_narration_types_active ON public.narration_types(active);

ALTER TABLE public.narration_types ENABLE ROW LEVEL SECURITY;

-- Everyone can view active narration types
CREATE POLICY "Anyone can view active narration types"
    ON public.narration_types FOR SELECT
    USING (active = TRUE);

-- Admins can manage narration types
CREATE POLICY "Admins can manage narration types"
    ON public.narration_types FOR ALL
    TO authenticated
    USING (public.is_admin() = true)
    WITH CHECK (public.is_admin() = true);

-- =============================================
-- APP SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- General Settings
    app_name TEXT DEFAULT 'نظام الإجازة',
    footer_info TEXT DEFAULT 'أسانيد الإجازات القرآنية',
    student_label TEXT DEFAULT 'المجــــاز',
    narration_label TEXT DEFAULT 'الإجازة',
    narration_description TEXT,
    
    -- Design Settings
    primary_color TEXT DEFAULT '#1B4332',
    secondary_color TEXT DEFAULT '#B8860B',
    bg_color TEXT DEFAULT '#FFFBF5',
    font_family TEXT DEFAULT 'IBM Plex Sans Arabic',
    font_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap',
    custom_font_name TEXT,
    custom_font_file_url TEXT,
    content_font_size INTEGER DEFAULT 16 CHECK (content_font_size BETWEEN 12 AND 50),
    
    -- Certificate Settings
    header_text TEXT DEFAULT 'إجازة قرآنية',
    first_signature_name TEXT DEFAULT 'المجيز',
    signature_image_url TEXT,
    second_signature_image_url TEXT,
    second_signature_title TEXT,
    background_image_url TEXT,
    background_pattern TEXT DEFAULT 'diamonds' CHECK (background_pattern IN ('diamonds', 'geometric', 'islamic', 'waves', 'dots', 'lines', 'none')),
    
    -- Content Settings
    template_short TEXT,
    template_detailed TEXT,
    default_introduction TEXT,
    default_sanad_text TEXT,
    default_issue_place TEXT DEFAULT 'المملكة العربية السعودية',
    
    -- Display Settings
    show_public_page BOOLEAN DEFAULT FALSE,
    allow_public_view_details BOOLEAN DEFAULT FALSE,
    qr_size INTEGER DEFAULT 80 CHECK (qr_size BETWEEN 50 AND 200),
    qr_position TEXT DEFAULT 'left' CHECK (qr_position IN ('left', 'center', 'right')),
    signature_size INTEGER DEFAULT 280 CHECK (signature_size BETWEEN 100 AND 500),
    seal_size INTEGER DEFAULT 120 CHECK (seal_size BETWEEN 80 AND 300),
    header_align TEXT DEFAULT 'center' CHECK (header_align IN ('center', 'right')),
    content_align TEXT DEFAULT 'center' CHECK (content_align IN ('center', 'right', 'justify')),
    student_info_layout TEXT DEFAULT 'inline' CHECK (student_info_layout IN ('inline', 'stacked')),
    show_guilloche BOOLEAN DEFAULT TRUE,
    pattern_opacity DECIMAL DEFAULT 0.35 CHECK (pattern_opacity BETWEEN 0.1 AND 0.5),
    border_style TEXT DEFAULT 'simple' CHECK (border_style IN ('simple', 'double', 'decorative')),
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read app settings
CREATE POLICY "Anyone can read app settings"
    ON public.app_settings FOR SELECT
    USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
    ON public.app_settings FOR ALL
    TO authenticated
    USING (public.is_admin() = true)
    WITH CHECK (public.is_admin() = true);

-- =============================================
-- MEDIA FILES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_uri TEXT,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'signature', 'seal', 'background', 'font', 'audio', 'document', 'image')),
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_category ON public.media_files(category);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON public.media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON public.media_files(file_type);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Users can view public media files
CREATE POLICY "Users can view public media files"
    ON public.media_files FOR SELECT
    USING (is_public = TRUE);

-- Users can view their own media files
CREATE POLICY "Users can view own media files"
    ON public.media_files FOR SELECT
    TO authenticated
    USING (uploaded_by = auth.uid());

-- Admins can view all media files
CREATE POLICY "Admins can view all media files"
    ON public.media_files FOR SELECT
    TO authenticated
    USING (public.is_admin() = true);

-- Admins can manage media files
CREATE POLICY "Admins can manage media files"
    ON public.media_files FOR ALL
    TO authenticated
    USING (public.is_admin() = true)
    WITH CHECK (public.is_admin() = true);

-- =============================================
-- BIOGRAPHIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.biographies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholar_id UUID REFERENCES public.scholars(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    personal_photo_url TEXT,
    title TEXT,
    motto TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    
    -- Biography Sections
    education_text TEXT,
    certificates_text TEXT,
    courses_text TEXT,
    publications_text TEXT,
    memberships_text TEXT,
    positions_text TEXT,
    activities_text TEXT,
    
    -- Additional Resources
    cv_file_url TEXT,
    sanad_image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Display Settings
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biographies_scholar_id ON public.biographies(scholar_id);
CREATE INDEX IF NOT EXISTS idx_biographies_is_public ON public.biographies(is_public);

ALTER TABLE public.biographies ENABLE ROW LEVEL SECURITY;

-- Everyone can view public biographies
CREATE POLICY "Anyone can view public biographies"
    ON public.biographies FOR SELECT
    USING (is_public = TRUE);

-- Scholars can view and edit their own biography
CREATE POLICY "Scholars can manage own biography"
    ON public.biographies FOR ALL
    TO authenticated
    USING (scholar_id = auth.uid())
    WITH CHECK (scholar_id = auth.uid());

-- Admins can manage all biographies
CREATE POLICY "Admins can manage all biographies"
    ON public.biographies FOR ALL
    TO authenticated
    USING (public.is_admin() = true)
    WITH CHECK (public.is_admin() = true);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_narration_types_updated_at ON public.narration_types;
CREATE TRIGGER update_narration_types_updated_at
    BEFORE UPDATE ON public.narration_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_files_updated_at ON public.media_files;
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON public.media_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_biographies_updated_at ON public.biographies;
CREATE TRIGGER update_biographies_updated_at
    BEFORE UPDATE ON public.biographies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- UPDATE GRANTS FOR NEW TABLES
-- =============================================

-- Ensure the anon and authenticated roles have proper access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Note: RLS policies handle the actual access control
-- These grants just allow the roles to "see" the tables

-- =============================================
-- VERIFICATION
-- =============================================

-- Run these queries to verify everything was created correctly:
-- SELECT * FROM public.profiles LIMIT 5;
-- SELECT * FROM public.submissions LIMIT 5;
-- SELECT * FROM public.narration_types LIMIT 5;
-- SELECT * FROM public.app_settings LIMIT 5;
-- SELECT * FROM public.media_files LIMIT 5;
-- SELECT * FROM public.biographies LIMIT 5;
-- SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
