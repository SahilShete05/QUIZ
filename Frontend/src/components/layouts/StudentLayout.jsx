import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Gauge,
  LogOut,
  Menu,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '../../features/auth/AuthContext';
import { ThemeToggle } from '../theme/ThemeToggle';

export function StudentLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = user?.name?.slice(0, 1).toUpperCase() || 'S';

  const closeSidebar = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  const navClass = ({ isActive }) =>
    [
      'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5',
      'text-sm font-medium transition-all duration-200',
      isActive
        ? [
            'bg-emerald-400/10 text-emerald-300',
            'ring-1 ring-emerald-400/10',
          ].join(' ')
        : [
            'text-slate-400',
            'hover:bg-white/[0.04]',
            'hover:text-slate-100',
          ].join(' '),
    ].join(' ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col',
          'border-r border-white/[0.07]',
          'bg-slate-950/95 backdrop-blur-xl',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Student navigation"
      >
        {/* Mobile close */}
        <div className="flex h-16 items-center justify-end px-4 lg:hidden">
          <button
            type="button"
            className={[
              'inline-flex h-9 w-9 items-center justify-center',
              'rounded-lg text-slate-400',
              'transition',
              'hover:bg-white/[0.06]',
              'hover:text-white',
            ].join(' ')}
            aria-label="Close navigation"
            onClick={closeSidebar}
          >
            <X size={19} />
          </button>
        </div>

        {/* Brand */}
        <div className="px-5 pb-6 lg:pt-6">
          <Link
            to="/student/dashboard"
            className="group inline-flex items-center gap-3"
            onClick={closeSidebar}
            aria-label="Quizzly student dashboard"
          >
            <span
              className={[
                'flex h-10 w-10 items-center justify-center',
                'rounded-xl',
                'bg-emerald-400/10',
                'text-emerald-300',
                'ring-1 ring-emerald-400/20',
                'transition',
                'group-hover:bg-emerald-400/15',
              ].join(' ')}
            >
              <Sparkles size={19} strokeWidth={2.2} />
            </span>

            <span className="text-xl font-bold tracking-tight text-white">
              quizzly<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Student workspace
            </span>
          </div>
        </div>

        {/* User card */}
        <div className="mx-4 mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="flex items-center gap-3">
            <div
              className={[
                'flex h-10 w-10 shrink-0 items-center justify-center',
                'rounded-xl',
                'bg-emerald-400/10',
                'text-sm font-bold text-emerald-300',
                'ring-1 ring-emerald-400/15',
              ].join(' ')}
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {user?.name || 'Student'}
              </p>

              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {user?.role?.toLowerCase() || 'student'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-4"
          aria-label="Student sections"
        >
          {/* Learn */}
          <div className="space-y-1">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Learn
            </p>

            <NavLink
              to="/student/dashboard"
              className={navClass}
              onClick={closeSidebar}
            >
              <Gauge size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/student/quizzes"
              className={navClass}
              onClick={closeSidebar}
            >
              <BookOpen size={18} />
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/student/attempts"
              className={navClass}
              onClick={closeSidebar}
            >
              <BadgeCheck size={18} />
              <span>Attempts</span>
            </NavLink>

            <NavLink
              to="/student/badges"
              className={navClass}
              onClick={closeSidebar}
            >
              <Trophy size={18} />
              <span>Badges</span>
            </NavLink>

            <NavLink
              to="/student/notifications"
              className={navClass}
              onClick={closeSidebar}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>

            <NavLink
              to="/student/leaderboard"
              className={navClass}
              onClick={closeSidebar}
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </NavLink>
          </div>

          {/* Account */}
          <div className="my-5 border-t border-white/[0.05]" />

          <div className="space-y-1">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
              Account
            </p>

            <NavLink
              to="/student/profile"
              className={navClass}
              onClick={closeSidebar}
            >
              <UserRound size={18} />
              <span>Profile</span>
            </NavLink>
          </div>
        </nav>

        {/* Sign out */}
        <div className="border-t border-white/[0.07] p-4">
          <button
            type="button"
            className={[
              'flex w-full items-center gap-3 rounded-xl',
              'px-3 py-2.5',
              'text-sm font-medium text-slate-500',
              'transition',
              'hover:bg-red-400/[0.06]',
              'hover:text-red-300',
            ].join(' ')}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="min-h-screen lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/[0.07] bg-slate-950/80 backdrop-blur-xl">
          <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu */}
            <button
              type="button"
              className={[
                'inline-flex h-10 w-10 items-center justify-center',
                'rounded-xl',
                'border border-white/[0.08]',
                'bg-white/[0.025]',
                'text-slate-400',
                'transition',
                'hover:bg-white/[0.06]',
                'hover:text-white',
                'lg:hidden',
              ].join(' ')}
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <Link
                className={[
                  'flex h-10 w-10 items-center justify-center',
                  'rounded-xl',
                  'border border-emerald-400/15',
                  'bg-emerald-400/10',
                  'text-sm font-bold text-emerald-300',
                  'transition',
                  'hover:bg-emerald-400/15',
                ].join(' ')}
                to="/student/profile"
                aria-label="Open student profile"
              >
                {initials}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}