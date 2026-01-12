/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cvzauvdhvjfpcbzoelkg.supabase.co',
      },
    ],
  },
}

export default config
