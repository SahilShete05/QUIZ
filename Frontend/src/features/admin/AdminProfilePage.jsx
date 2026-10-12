
import { useEffect, useState } from 'react';
import {
  Mail,
  UserRound,
  CalendarDays,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import {
  useProfileQuery,
  useUpdateMyProfileMutation,
} from '../student/hooks';

function ProfileCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-panel rounded-2xl border border-[var(--border)] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1 break-words text-xl font-bold text-[var(--text-primary)]">
        {value || '—'}
      </p>
    </div>
  );
}

export function AdminProfilePage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useProfileQuery();

  const updateMutation = useUpdateMyProfileMutation();

  const profile = data?.profile;

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (profile?.name != null) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    setMessage('');
    setMessageType('');

    if (!trimmedName) {
      setMessage('Name cannot be empty.');
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
          setMessage('Profile updated successfully.');
          setMessageType('success');
        },
        onError: (error) => {
          setMessage(
            error?.response?.data?.message ||
              'Could not update your profile. Please try again.'
          );
          setMessageType('error');
        },
      }
    );
  };

  const handleReset = () => {
    setName(profile?.name || '');
    setMessage('');
    setMessageType('');
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 text-[var(--text-primary)]">
        Loading admin profile...
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          My profile
        </h1>

        <p className="mt-3 text-[var(--text-muted)]">
          Could not load your profile. Please try again.
        </p>

        <button
          type="button"
          className="button button-primary mt-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </main>
    );
  }

  const memberSince =
    profile.createdAt &&
    !Number.isNaN(new Date(profile.createdAt).getTime())
      ? new Date(profile.createdAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '—';

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page heading */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">
          ADMIN PROFILE
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          My profile
        </h1>

        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Manage your personal information and view your account details.
        </p>
      </div>

      {/* Personal information */}
      <section className="glass-panel rounded-2xl border border-[var(--border)] p-5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Personal information
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Update the name associated with your administrator account.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl font-bold text-emerald-500">
            {(name || profile.name || 'A').charAt(0).toUpperCase()}
          </div>

          {/* Form */}
          <div className="min-w-0 flex-1">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-profile-name"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Full name
                </label>

                <input
                  id="admin-profile-name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-profile-email"
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
                    id="admin-profile-email"
                    type="email"
                    value={profile.email || ''}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] py-3 pl-11 pr-4 text-[var(--text-muted)] opacity-80 outline-none"
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
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="button button-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {updateMutation.isPending
                    ? 'Saving...'
                    : 'Save changes'}
                </button>

                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={handleReset}
                  className="button inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Account overview */}
      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Account overview
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Your administrator account details.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ProfileCard
            icon={ShieldCheck}
            label="Account role"
            value={profile.role}
          />

          <ProfileCard
            icon={CalendarDays}
            label="Member since"
            value={memberSince}
          />
        </div>
      </section>

      {/* Profile tip */}
      <section className="glass-panel mt-5 flex items-start gap-4 rounded-2xl border border-[var(--border)] p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <Sparkles size={19} />
        </div>

        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            Profile tip
          </h3>

          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            Keep your name up to date so your administrator account
            information is displayed correctly throughout Quizzly.
          </p>
        </div>
      </section>
    </main>
  );
}
