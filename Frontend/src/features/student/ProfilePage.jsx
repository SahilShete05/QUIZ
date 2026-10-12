
import { useEffect, useState } from 'react';
import {
  UserRound,
  Mail,
  ShieldCheck,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Trophy,
  GraduationCap,
} from 'lucide-react';

import {
  useProfileQuery,
  useUpdateMyProfileMutation,
} from './hooks';

const getProfileFromResponse = (data) =>
  data?.profile ??
  data?.data?.profile ??
  data?.data ??
  data;

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Something went wrong. Please try again.';

export default function ProfilePage() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useProfileQuery();

  const updateProfile = useUpdateMyProfileMutation();

  const profile = getProfileFromResponse(data);

  const [name, setName] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (profile?.name != null) {
      setName(profile.name);
    }
  }, [profile?.name]);

  const hasChanges =
    name.trim() !== (profile?.name ?? '').trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice(null);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNotice({
        type: 'error',
        message: 'Name cannot be empty.',
      });
      return;
    }

    if (trimmedName.length < 2) {
      setNotice({
        type: 'error',
        message: 'Name must contain at least 2 characters.',
      });
      return;
    }

    if (!hasChanges) {
      setNotice({
        type: 'info',
        message: 'You have not made any changes.',
      });
      return;
    }

    updateProfile.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setNotice({
            type: 'success',
            message: 'Your profile has been updated successfully.',
          });
        },
        onError: (mutationError) => {
          setNotice({
            type: 'error',
            message: getErrorMessage(mutationError),
          });
        },
      },
    );
  };

  if (isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-muted-foreground">
        <RefreshCw size={20} className="animate-spin" />
        Loading your profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 text-destructive"
          />

          <div>
            <h2 className="font-semibold">
              Could not load your profile
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Your profile information was not returned by the server.
        </p>
      </div>
    );
  }

  const noticeStyles = {
    success:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    error:
      'border-destructive/30 bg-destructive/5 text-destructive',
    info:
      'border-border bg-muted text-muted-foreground',
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-medium text-primary">
          Account settings
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          My profile
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and view your account details.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-primary/5 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound size={28} />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold">
                  Personal information
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Update the name associated with your account.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold"
              >
                Full name
              </label>

              <div className="relative">
                <UserRound
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setNotice(null);
                  }}
                  minLength={2}
                  maxLength={100}
                  required
                  placeholder="Enter your full name"
                  className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-semibold"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email ?? ''}
                  readOnly
                  className="min-h-12 w-full cursor-not-allowed rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm text-muted-foreground outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Email changes are not available through this profile endpoint.
              </p>
            </div>

            {notice && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${noticeStyles[notice.type]}`}
              >
                {notice.type === 'success' ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                ) : notice.type === 'error' ? (
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                ) : null}

                <span>{notice.message}</span>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setName(profile.name ?? '');
                  setNotice(null);
                  updateProfile.reset();
                }}
                disabled={updateProfile.isPending}
                className="min-h-11 rounded-xl border border-border px-5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={
                  updateProfile.isPending ||
                  !name.trim() ||
                  !hasChanges
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateProfile.isPending ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}

                {updateProfile.isPending
                  ? 'Saving changes...'
                  : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Account overview</h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 text-primary"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Account role
                  </p>

                  <p className="mt-1 font-semibold">
                    {profile.role ?? 'STUDENT'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays
                  size={19}
                  className="mt-0.5 text-primary"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Member since
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy
                  size={19}
                  className="mt-0.5 text-primary"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Experience points
                  </p>

                  <p className="mt-1 font-semibold">
                    {profile.xp ?? 0} XP
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap
                  size={19}
                  className="mt-0.5 text-primary"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Current level
                  </p>

                  <p className="mt-1 font-semibold">
                    Level {profile.level ?? 1}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold">Profile tip</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep your name up to date so your account information is displayed correctly throughout Quizzly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
