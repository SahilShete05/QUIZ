
import { useEffect, useState } from 'react';

import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Save,
  RotateCcw,
  BookOpen,
  GraduationCap,
  BarChart3,
} from 'lucide-react';

import {
  useProfileQuery,
  useUpdateMyProfileMutation,
} from '../student/hooks';

import { useTeacherDashboardQuery } from './hooks';

function ProfileCard({ icon: Icon, label, value, description }) {
  return (
    <div className="glass-panel rounded-2xl border border-[var(--border)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
        <Icon size={20} />
      </div>

      <p className="mt-4 text-sm font-medium text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-xl font-bold text-[var(--text-primary)]">
        {value ?? '—'}
      </p>

      {description && (
        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

export function TeacherProfilePage() {
  const profileQuery = useProfileQuery();
  const dashboardQuery = useTeacherDashboardQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const profile = profileQuery.data?.profile;
  const dashboard = dashboardQuery.data?.dashboard;
  const stats = dashboard?.stats;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (profile?.name != null) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const handleReset = () => {
    setName(profile?.name || '');
    setMessage('');
    setMessageType('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    setMessage('');
    setMessageType('');

    if (!trimmedName) {
      setMessage('Full name is required.');
      setMessageType('error');
      return;
    }

    if (trimmedName.length > 100) {
      setMessage('Name cannot exceed 100 characters.');
      setMessageType('error');
      return;
    }

    updateMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setName(trimmedName);
          setMessage('Your profile has been updated successfully.');
          setMessageType('success');
        },
        onError: (error) => {
          setMessage(
            error?.response?.data?.message ||
              'Unable to update your profile. Please try again.'
          );
          setMessageType('error');
        },
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAverageScore = (score) => {
    if (score == null || !Number.isFinite(Number(score))) {
      return '—';
    }

    return Number(score).toFixed(2);
  };

  if (profileQuery.isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-[var(--text-primary)]">
        Loading teacher profile...
      </main>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          My profile
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          We could not load your profile. Please try again.
        </p>

        <button
          type="button"
          className="button button-primary mt-4"
          onClick={() => profileQuery.refetch()}
        >
          Try again
        </button>
      </main>
    );
  }

  const hasNameChanged = name.trim() !== (profile.name || '');

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
          ACCOUNT SETTINGS
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          My profile
        </h1>

        <p className="mt-2 text-sm text-[var(--text-muted)] sm:text-base">
          Manage your personal information and view your teaching activity.
        </p>
      </header>

      {/* Personal information */}
      <section className="glass-panel rounded-2xl border border-[var(--border)] p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <UserRound size={21} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Personal information
            </h2>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Update the name associated with your account.
            </p>
          </div>
        </div>

        {/* Profile identity */}
        <div className="mb-7 flex flex-col gap-4 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl font-bold text-emerald-500">
            {profile.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold text-[var(--text-primary)]">
              {profile.name || 'Teacher'}
            </h3>

            <p className="mt-1 break-all text-sm text-[var(--text-muted)]">
              {profile.email}
            </p>

            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <ShieldCheck size={14} />
              {profile.role || 'TEACHER'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div>
            <label
              htmlFor="teacher-profile-name"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              Full name
            </label>

            <input
              id="teacher-profile-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="teacher-profile-email"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />

              <input
                id="teacher-profile-email"
                type="email"
                value={profile.email || ''}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-3 pl-11 pr-4 text-[var(--text-muted)] opacity-80"
              />
            </div>

            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Email changes are not available through this profile endpoint.
            </p>
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${
                messageType === 'error'
                  ? 'text-red-500'
                  : 'text-emerald-500'
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={
                updateMutation.isPending ||
                (!hasNameChanged && !message)
              }
              className="button inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="submit"
              disabled={
                updateMutation.isPending ||
                !hasNameChanged
              }
              className="button button-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Account overview */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Account overview
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Your teaching activity and account details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ProfileCard
            icon={ShieldCheck}
            label="Account role"
            value={profile.role || 'TEACHER'}
            description="Your assigned account role"
          />

          <ProfileCard
            icon={CalendarDays}
            label="Member since"
            value={formatDate(profile.createdAt)}
            description="Your account creation date"
          />

          <ProfileCard
            icon={BookOpen}
            label="Quizzes created"
            value={
              stats?.totalQuizzes ??
              (dashboardQuery.isError ? '—' : '...')
            }
            description="Quizzes you have created"
          />

          <ProfileCard
            icon={GraduationCap}
            label="Total attempts"
            value={
              stats?.totalAttempts ??
              (dashboardQuery.isError ? '—' : '...')
            }
            description="Attempts across your quizzes"
          />

          <ProfileCard
            icon={BarChart3}
            label="Average score"
            value={
              stats
                ? formatAverageScore(stats.averageScore)
                : dashboardQuery.isError
                  ? '—'
                  : '...'
            }
            description="Average quiz performance"
          />
        </div>

        {dashboardQuery.isLoading && (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Loading teaching statistics...
          </p>
        )}

        {dashboardQuery.isError && (
          <div className="mt-5 rounded-xl border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--text-muted)]">
              Teaching statistics are currently unavailable. Your profile
              information loaded successfully.
            </p>

            <button
              type="button"
              className="button button-primary mt-3"
              onClick={() => dashboardQuery.refetch()}
            >
              Retry statistics
            </button>
          </div>
        )}
      </section>

      {/* Profile tip */}
      <section className="glass-panel mt-8 flex gap-4 rounded-2xl border border-emerald-500/20 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <Sparkles size={21} />
        </div>

        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            Profile tip
          </h3>

          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            Keep your name up to date and review your teaching statistics
            regularly to track your activity throughout Quizzly.
          </p>
        </div>
      </section>
    </main>
  );
}