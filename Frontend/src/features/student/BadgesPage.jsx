import { Medal } from 'lucide-react';
import {
  useAllBadgesQuery,
  useMyBadgesQuery,
} from './hooks';

import {
  BadgeCard,
  EmptyState,
  ErrorState,
  PageIntro,
  LoadingSkeleton,
} from './ui';

function BadgeSection({ title, children }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
          <Medal size={17} />
        </div>

        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

export function BadgesPage() {
  const allBadges = useAllBadgesQuery();
  const myBadges = useMyBadgesQuery();

  if (allBadges.isLoading || myBadges.isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="BADGES"
          title="Badge library"
          description="Loading your badge progress and the available badge catalog."
        />

        <div className="mt-7">
          <LoadingSkeleton type="hero" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <LoadingSkeleton key={item} />
          ))}
        </div>
      </main>
    );
  }

  if (allBadges.isError || myBadges.isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <PageIntro
          eyebrow="BADGES"
          title="Badge library"
          description="Your badge information could not be loaded."
        />

        <div className="mt-7">
          <ErrorState
            title="Could not load badges"
            description="The badge endpoints returned an error."
          />
        </div>
      </main>
    );
  }

  const earnedBadges = myBadges.data?.badges || [];
  const badgeCatalog = allBadges.data?.badges || [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="BADGES"
        title="Badge library"
        description="Track the badges you have earned and explore the rewards available to you."
      />

      {/* My badges */}
      <BadgeSection title="My badges">
        {earnedBadges.length === 0 ? (
          <div className="glass-panel rounded-2xl p-2">
            <EmptyState
              icon={<Medal size={18} />}
              title="No badges earned"
              description="Keep taking quizzes to unlock rewards."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {earnedBadges.map((item) => (
              <BadgeCard
                key={item.id}
                badge={item.badge}
                awardedAt={item.awardedAt}
              />
            ))}
          </div>
        )}
      </BadgeSection>

      {/* All badges */}
      <BadgeSection title="All badges">
        {badgeCatalog.length === 0 ? (
          <div className="glass-panel rounded-2xl p-2">
            <EmptyState
              icon={<Medal size={18} />}
              title="No badge catalog"
              description="The backend did not return any badges."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {badgeCatalog.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
              />
            ))}
          </div>
        )}
      </BadgeSection>
    </main>
  );
}