import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
    <input
      ref={ref}
      {...props}
      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} ${className}`}
    />
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
