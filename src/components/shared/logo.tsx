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
        {/* Arabic letter */}
        <span className={`
          font-arabic 
          ${s.letter} 
          font-bold 
          text-gold-400
          relative z-10
          drop-shadow-sm
        `}>
          إ
        </span>
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
            tracking-wider
            uppercase
            font-medium
          `}>
            Ejazah
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
