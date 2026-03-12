import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: 'default' | 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ 
  className = '', 
  showText = true, 
  variant = 'default',
  size = 'md' 
}: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-8 h-8', text: 'text-base', subtext: 'text-[10px]', letter: 'text-lg' },
    md: { icon: 'w-11 h-11', text: 'text-lg', subtext: 'text-xs', letter: 'text-xl' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', subtext: 'text-sm', letter: 'text-2xl' },
  }

  const variantClasses = {
    default: {
      icon: 'bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 border-2 border-gold-500/30',
      text: 'text-primary-900',
      subtext: 'text-muted-foreground',
    },
    light: {
      icon: 'bg-gradient-to-br from-white/20 to-white/10 border-2 border-gold-400/40',
      text: 'text-white',
      subtext: 'text-white/70',
    },
    dark: {
      icon: 'bg-gradient-to-br from-primary-800 to-primary-950 border-2 border-gold-500/30',
      text: 'text-primary-900',
      subtext: 'text-primary-600',
    },
  }

  const s = sizeClasses[size]
  const v = variantClasses[variant]

  return (
    <Link href="/" className={`flex items-center gap-3 group ${className}`}>
      {/* Logo Icon */}
      <div className={`
        ${s.icon} 
        ${v.icon}
        rounded-xl 
        flex items-center justify-center 
        shadow-lg
        transition-all duration-300
        group-hover:shadow-gold
        group-hover:scale-105
        relative
        overflow-hidden
      `}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%23B8860B' fill-opacity='0.5' d='M20 0L40 20L20 40L0 20z M20 5L35 20L20 35L5 20z'/%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
        }} />
        {/* Quran / open-book icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`relative z-10 drop-shadow-sm text-gold-400 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'}`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Open book */}
          <path d="M12 6C10 4.5 7 4 4 4.5V19c3-.5 6 0 8 1.5" />
          <path d="M12 6c2-1.5 5-2 8-1.5V19c-3-.5-6 0-8 1.5" />
          <path d="M12 6v15.5" />
          {/* Decorative lines (text lines on pages) */}
          <path d="M6 8.5h4M6 11h3.5M6 13.5h4" strokeWidth="1" opacity="0.7" />
          <path d="M14 8.5h4M14 11h3.5M14 13.5h4" strokeWidth="1" opacity="0.7" />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`
            font-arabic 
            ${s.text} 
            font-bold 
            ${v.text}
            transition-colors duration-200
          `}>
            الإجازة
          </span>
          <span className={`
            ${s.subtext}
            ${v.subtext}
            tracking-widest
            uppercase
            font-light
            opacity-60
          `}>
            EJAZAH
          </span>
        </div>
      )}
    </Link>
  )
}

// Ornamental divider component
export function OrnamentalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 py-4 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold-400" />
      <span className="text-gold-500 text-lg">✦</span>
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  )
}

// Bismillah component
export function Bismillah({ className = '' }: { className?: string }) {
  return (
    <div className={`text-center ${className}`}>
      <p className="font-arabic text-2xl md:text-3xl text-gold-600 mb-2">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>
      <OrnamentalDivider />
    </div>
  )
}
