import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'whatsapp' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-royal-700 text-white hover:bg-royal-800 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]',
  gold: 'gold-gradient text-royal-950 font-semibold hover:brightness-105 shadow-[var(--shadow-gold)]',
  outline: 'border-2 border-royal-700 text-royal-700 hover:bg-royal-50 bg-transparent',
  ghost: 'text-royal-700 hover:bg-royal-50 bg-transparent',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1fbd5a] shadow-[var(--shadow-soft)]',
  dark: 'bg-royal-950 text-white hover:bg-royal-900',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 gap-1.5',
  md: 'text-sm px-5 py-3 gap-2',
  lg: 'text-base px-7 py-3.5 gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}
