'use client'

import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

let client: any = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new instance each time
    return supabaseCreateClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  // Client-side: use singleton
  if (!client) {
    client = supabaseCreateClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return client
}
