import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseInput =
  'w-full px-4 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100 ' +
  'placeholder-slate-400 dark:placeholder-slate-500 ' +
  'rounded-[12px] border transition-all duration-200 ' +
  'focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/20 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          {...props}
          className={`
            ${baseInput}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20 animate-shake' : 'border-slate-200 dark:border-slate-700'}
            h-12
            ${className}
          `.trim().replace(/\s+/g, ' ')}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        {...props}
        className={`
          ${baseInput}
          py-3 resize-none
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-700'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';

export default Input;
