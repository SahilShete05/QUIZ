import { MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-xl',
        'border border-white/[0.08] bg-white/[0.03]',
        'text-slate-400 shadow-sm backdrop-blur-md',
        'transition-all duration-200',
        'hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50',
        'active:scale-95',
      ].join(' ')}
    >
      {isDark ? (
        <SunMedium size={17} strokeWidth={2} />
      ) : (
        <MoonStar size={17} strokeWidth={2} />
      )}
    </button>
  );
}