export default function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-[3px]', lg: 'w-12 h-12 border-4' }[size];
  return <div className={`${s} rounded-full border-slate-200 dark:border-slate-700 border-t-indigo-600 animate-spin ${className}`} />;
}
