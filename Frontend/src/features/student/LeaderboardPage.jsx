import { Trophy } from 'lucide-react';
import { useGlobalLeaderboardQuery } from './hooks';
import {
  EmptyState,
  ErrorState,
  PageIntro,
  LoadingSkeleton,
} from './ui';

function RankBadge({ rank }) {
  const rankStyles =
    rank === 1
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300'
      : rank === 2
        ? 'border-slate-400/20 bg-slate-400/10 text-slate-600 dark:border-slate-300/20 dark:bg-slate-300/10 dark:text-slate-200'
        : rank === 3
          ? 'border-orange-500/20 bg-orange-500/10 text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300'
          : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]';

  return (
    <div
      className={[
        'flex h-10 w-10 shrink-0 items-center justify-center',
        'rounded-xl border text-sm font-bold',
        rankStyles,
      ].join(' ')}
    >
      #{rank}
    </div>
  );
}

export function LeaderboardPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGlobalLeaderboardQuery();

  const leaderboard = data?.leaderboard || [];

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="LEADERBOARD"
          title="Global leaderboard"
          description="Loading the latest rankings."
        />

        <div className="mt-7">
          <LoadingSkeleton type="hero" />
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="LEADERBOARD"
          title="Global leaderboard"
          description="The latest rankings could not be loaded."
        />

        <div className="mt-7">
          <ErrorState
            title="Could not load leaderboard"
            description="The leaderboard endpoint returned an error."
            action={
              <button
                type="button"
                className="button button-primary"
                onClick={() => refetch()}
              >
                Try again
              </button>
            }
          />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="LEADERBOARD"
        title="Global leaderboard"
        description="Rankings are sourced from the live leaderboard endpoint."
      />

      {leaderboard.length === 0 ? (
        <div className="mt-7">
          <EmptyState
            icon={<Trophy size={18} />}
            title="No leaderboard entries"
            description="No users were returned by the backend."
          />
        </div>
      ) : (
        <section className="glass-panel mt-7 overflow-hidden rounded-2xl">
          {/* Desktop header */}
          <div className="hidden grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--border)] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:grid">
            <span>Rank</span>
            <span>Player</span>
            <span>XP</span>
          </div>

          <div>
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-[var(--border)] px-4 py-4 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)] sm:gap-4 sm:px-5"
              >
                <RankBadge rank={entry.rank} />

                <div className="min-w-0">
                  <strong className="block truncate text-sm font-semibold text-[var(--text-primary)] sm:text-[15px]">
                    {entry.name}
                  </strong>

                  <span className="mt-1 block text-xs text-[var(--text-subtle)]">
                    Level {entry.level}

                    <span className="mx-1.5">
                      ·
                    </span>

                    <span className="text-[var(--text-muted)]">
                      {entry.xp} XP
                    </span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-300">
                    {entry.xp}
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
                    XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}