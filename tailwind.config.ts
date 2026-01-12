import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Elegant Islamic Color Palette - Deep & Refined
        primary: {
          DEFAULT: '#1B4332',      // Deep forest green - Islamic green
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#1B4332',           // Main primary
          950: '#0F2419',
        },
        // Rich gold - Represents sacred knowledge
        gold: {
          DEFAULT: '#B8860B',       // Dark goldenrod
          50: '#FFFDF7',
          100: '#FEF9E7',
          200: '#FDF0C3',
          300: '#FAE48F',
          400: '#F5D15B',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#B8860B',           // Main gold
          800: '#854D0E',
          900: '#713F12',
        },
        // Deep burgundy/maroon accent
        accent: {
          DEFAULT: '#7C2D12',       // Deep burgundy brown
          light: '#9A3412',
          dark: '#5C1D0E',
          foreground: '#FFFFFF',
        },
        // Warm cream backgrounds
        background: {
          DEFAULT: '#FFFBF5',       // Warm cream white
          alt: '#FEF7ED',           // Slightly warmer
          paper: '#FFFEF9',         // Clean paper white
        },
        foreground: '#1C1917',      // Almost black - warm
        // Muted tones
        muted: {
          DEFAULT: '#F5F0E8',       // Warm muted
          foreground: '#78716C',    // Stone gray
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#E7E5E4',          // Stone border
        input: '#E7E5E4',
        ring: '#1B4332',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1917',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1C1917',
        },
        // Semantic colors
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        info: {
          DEFAULT: '#0284C7',
          light: '#E0F2FE',
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-ibm-plex)', 'serif'],
        display: ['var(--font-amiri)', 'serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'elegant': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'elegant-lg': '0 10px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'gold': '0 4px 20px -2px rgba(184, 134, 11, 0.25)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-elegant': 'linear-gradient(135deg, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%)',
        'pattern-geometric': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231B4332' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        'pattern-arabesque': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%231B4332' fill-opacity='0.02' d='M50 0L100 50L50 100L0 50z M50 10L90 50L50 90L10 50z M50 20L80 50L50 80L20 50z M50 30L70 50L50 70L30 50z M50 40L60 50L50 60L40 50z'/%3E%3C/svg%3E")`,
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        // Card with elegant shadow
        '.card-elegant': {
          '@apply bg-white rounded-xl shadow-elegant border border-border/50': {},
        },
        // Card hover effect
        '.card-hover': {
          '@apply transition-all duration-300 hover:shadow-elegant-lg hover:-translate-y-1': {},
        },
        // Gold gradient button
        '.btn-gold': {
          '@apply bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-white font-medium shadow-gold hover:from-gold-700 hover:via-gold-600 hover:to-gold-700 transition-all duration-300': {},
        },
        // Primary gradient
        '.gradient-primary': {
          '@apply bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950': {},
        },
        // Gold gradient
        '.gradient-gold': {
          '@apply bg-gradient-to-r from-gold-700 via-gold-500 to-gold-600': {},
        },
        // Elegant text gradient
        '.text-gradient-gold': {
          '@apply bg-gradient-to-r from-gold-700 via-gold-500 to-gold-600 bg-clip-text text-transparent': {},
        },
        // Glass effect
        '.glass': {
          '@apply bg-white/80 backdrop-blur-md border border-white/20': {},
        },
        // Section divider
        '.divider-ornate': {
          '@apply flex items-center gap-4 text-gold-600': {},
          '&::before, &::after': {
            content: '""',
            flex: '1',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
          },
        },
      })
      addUtilities({
        // RTL utilities
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        // Text balance
        '.text-balance': {
          textWrap: 'balance',
        },
      })
    }),
  ],
}

export default config
