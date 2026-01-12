# Environment Setup Guide

## Supabase Configuration

### 1. Create `.env.local` file

Create a file named `.env.local` in the `ijazah-app` directory with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cvzauvdhvjfpcbzoelkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_dbAfrw_PKZ0mzrG0Z48hPw_ICjU-1co

# Database Connection (for migrations - optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.cvzauvdhvjfpcbzoelkg.supabase.co:5432/postgres
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### 2. Apply Database Schema

You need to run the `DATABASE_SCHEMA.sql` file in your Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/cvzauvdhvjfpcbzoelkg
2. Navigate to **SQL Editor** from the left sidebar
3. Click **New Query**
4. Copy the entire content from `DATABASE_SCHEMA.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create all necessary tables, policies, and functions for Phase 3.

### 3. Verify Installation

After running the schema, verify by running this query:

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `profiles`
- `scholars`
- `ijazah_applications`
- `ijazah_certificates`
- `verification_logs`

### 4. Create an Admin User

After setting up the database, you need to promote a user to admin:

1. Register a new account through your app
2. Get your user ID from the Supabase Dashboard (Authentication > Users)
3. Run this SQL query to make yourself an admin:

```sql
-- Replace 'YOUR-USER-ID-HERE' with your actual user ID
UPDATE public.profiles 
SET roles = ARRAY['admin', 'student'] 
WHERE id = 'YOUR-USER-ID-HERE';
```

### 5. Start the Development Server

```bash
cd F:\projects\ejazah\ijazah-app
npm run dev
```

The app will be available at http://localhost:3000

---

## Troubleshooting

### Issue: "Invalid Supabase URL"
- Double-check your `.env.local` file
- Make sure there are no spaces or quotes around the values
- Restart the dev server after changing `.env.local`

### Issue: "Authentication Error"
- Verify your publishable key is correct
- Check Supabase dashboard for any disabled features
- Ensure RLS policies are properly applied

### Issue: "Table does not exist"
- Re-run the `DATABASE_SCHEMA.sql` in Supabase SQL Editor
- Check for any error messages in the SQL Editor output
- Verify you're connected to the correct project

---

## Security Notes

⚠️ **Important Security Practices**:

1. **Never commit `.env.local`** to version control (it's already in `.gitignore`)
2. **Keep your database password secret**
3. **The publishable key is safe to use in client-side code** (it's designed for that)
4. **Row Level Security (RLS)** protects your data even with the public key

---

## Next Steps After Setup

1. ✅ Create your admin account
2. ✅ Access admin dashboard at `/admin`
3. ✅ Add scholars at `/admin/scholars`
4. ✅ Test the application flow
5. ✅ Review the Phase 3 features

---

*Last Updated: January 11, 2026*
