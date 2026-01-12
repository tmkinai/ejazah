import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      dir="rtl"
      className={cn(
        'flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 text-right text-foreground',
        'placeholder:text-muted-foreground placeholder:text-right',
        'focus:bg-background focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        'hover:border-primary-200',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
