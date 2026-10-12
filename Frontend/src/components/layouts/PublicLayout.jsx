import { Link, Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

import { ThemeToggle } from '../theme/ThemeToggle';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <header className="relative z-10 flex h-16 items-center justify-between border-b border-white/[0.07] bg-slate-950/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-3"
          aria-label="Quizzly home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20 transition group-hover:bg-emerald-400/15">
            <Sparkles size={18} strokeWidth={2.2} />
          </span>

          <span className="text-xl font-bold tracking-tight text-white">
            quizzly<span className="text-emerald-400">.</span>
          </span>
        </Link>

        <ThemeToggle />
      </header>

      <main className="relative z-10 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}