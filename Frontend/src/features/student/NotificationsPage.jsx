import { Bell } from 'lucide-react';

import {
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from './hooks';

import {
  EmptyState,
  ErrorState,
  NotificationItem,
  PageIntro,
  LoadingSkeleton,
} from './ui';

export function NotificationsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useNotificationsQuery();

  const markRead = useMarkNotificationReadMutation();
  const notifications = data?.notifications || [];

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <LoadingSkeleton type="hero" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <ErrorState
          title="Could not load notifications"
          description="The notifications endpoint returned an error."
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
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <PageIntro
        eyebrow="NOTIFICATIONS"
        title="Your notifications."
        description="Stay up to date with activity and updates from your account."
      />

      {notifications.length === 0 ? (
        <div className="mt-7">
          <div className="glass-panel rounded-2xl p-2">
            <EmptyState
              icon={<Bell size={18} />}
              title="No notifications"
              description="Nothing new is waiting for you right now."
            />
          </div>
        </div>
      ) : (
        <section className="glass-panel mt-7 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Bell size={16} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Notifications
                </h2>

                <p className="mt-0.5 text-[11px] text-[var(--text-subtle)]">
                  Recent account activity
                </p>
              </div>
            </div>

            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
              {notifications.length}
            </span>
          </div>

          {/* Notification list */}
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={[
                  'px-4 py-1',
                  'transition-colors duration-200',
                  'hover:bg-[var(--surface-hover)]',
                ].join(' ')}
              >
                <NotificationItem
                  notification={notification}
                  onMarkRead={(notificationId) =>
                    markRead.mutate(notificationId)
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}