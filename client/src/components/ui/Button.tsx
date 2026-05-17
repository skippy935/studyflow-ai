import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'coral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold ' +
    'shadow-[0_4px_12px_rgba(99,102,241,0.35)] ' +
    'hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 ' +
    'active:translate-y-0 active:shadow-[0_2px_8px_rgba(99,102,241,0.3)]',
  secondary:
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold ' +
    'border border-slate-200 dark:border-slate-700 ' +
    'hover:bg-slate-50 dark:hover:bg-slate-750 hover:-translate-y-0.5 ' +
    'active:translate-y-0',
  ghost:
    'bg-transparent text-slate-600 dark:text-slate-400 font-medium ' +
    'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 ' +
    'active:bg-slate-200 dark:active:bg-slate-700',
  danger:
    'bg-red-500 hover:bg-red-600 text-white font-semibold ' +
    'shadow-sm hover:-translate-y-0.5 active:translate-y-0',
  coral:
    'bg-gradient-to-br from-orange-500 to-red-500 text-white font-semibold ' +
    'shadow-[0_4px_12px_rgba(249,115,22,0.35)] ' +
    'hover:shadow-[0_8px_24px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 ' +
    'active:translate-y-0',
};

const sizes: Record<string, string> = {
  sm:  'px-3.5 py-1.5 text-sm   rounded-xl  min-h-[36px]',
  md:  'px-5   py-2.5 text-sm   rounded-[14px] min-h-[44px]',
  lg:  'px-6   py-3   text-base rounded-[14px] min-h-[52px]',
  xl:  'px-8   py-4   text-base rounded-2xl min-h-[56px] w-full',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
}
