
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUserRole,
} from './api';

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-panel rounded-2xl border border-[var(--border)] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
        <Icon size={19} />
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </p>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN: 'bg-purple-500/10 text-purple-500',
    TEACHER: 'bg-blue-500/10 text-blue-500',
    STUDENT: 'bg-emerald-500/10 text-emerald-500',
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[role] || 'bg-gray-500/10 text-gray-500'
      }`}
    >
      {role || 'UNKNOWN'}
    </span>
  );
}

function formatDate(date) {
  if (!date) return '—';

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString();
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newRole, setNewRole] = useState('');

  const limit = 10;

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', { page, limit, search, role }],
    queryFn: () => getAdminUsers({ page, limit, search, role }),
  });

  const detailQuery = useQuery({
    queryKey: ['admin', 'user', selectedUserId],
    queryFn: () => getAdminUserById(selectedUserId),
    enabled: Boolean(selectedUserId),
  });

  const roleMutation = useMutation({
    mutationFn: updateAdminUserRole,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['admin', 'users'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['admin', 'user'],
        }),
      ]);

      setNewRole('');
      window.alert('User role updated successfully.');
    },
  });

  const response = usersQuery.data;
  const users = response?.users ?? [];
  const pagination = response?.pagination;

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  // These counts describe the currently loaded page, not the whole database.
  const pageCounts = users.reduce(
    (counts, user) => {
      counts[user.role] = (counts[user.role] || 0) + 1;
      return counts;
    },
    { STUDENT: 0, TEACHER: 0, ADMIN: 0 }
  );

  const selectedUser = detailQuery.data?.user;

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function changeRole() {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${selectedUser.name}'s role from ${selectedUser.role} to ${newRole}?`
    );

    if (!confirmed) return;

    roleMutation.mutate({
      userId: selectedUser.id,
      role: newRole,
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">
            ADMINISTRATION
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Users
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Search registered accounts and manage user roles.
          </p>
        </div>

        <button
          type="button"
          onClick={() => usersQuery.refetch()}
          disabled={usersQuery.isFetching}
          className="button button-primary inline-flex items-center justify-center gap-2"
        >
          <RefreshCw
            size={16}
            className={usersQuery.isFetching ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={Users} label="Matching users" value={total} />
        <SummaryCard
          icon={GraduationCap}
          label="Students on this page"
          value={pageCounts.STUDENT}
        />
        <SummaryCard
          icon={BookOpen}
          label="Teachers on this page"
          value={pageCounts.TEACHER}
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Admins on this page"
          value={pageCounts.ADMIN}
        />
      </section>

      <section className="glass-panel rounded-2xl border border-[var(--border)] p-4 sm:p-5">
        <form
          onSubmit={applySearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500"
          >
            <option value="">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
          </select>

          <button type="submit" className="button button-primary">
            Search
          </button>
        </form>

        {usersQuery.isError && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-red-500">
              {usersQuery.error?.response?.data?.message ||
                'Unable to load users. Make sure you are signed in as an administrator.'}
            </p>
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="mt-3 text-sm font-semibold text-emerald-500"
            >
              Try again
            </button>
          </div>
        )}

        {usersQuery.isLoading ? (
          <div className="py-14 text-center text-sm text-[var(--text-muted)]">
            Loading users...
          </div>
        ) : !usersQuery.isError && users.length === 0 ? (
          <div className="py-14 text-center">
            <Users
              size={32}
              className="mx-auto text-[var(--text-muted)]"
            />
            <p className="mt-3 font-semibold text-[var(--text-primary)]">
              No users found
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Try changing your search or role filter.
            </p>
          </div>
        ) : !usersQuery.isError ? (
          <>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    <th className="px-4 py-4 font-semibold">User</th>
                    <th className="px-4 py-4 font-semibold">Role</th>
                    <th className="px-4 py-4 font-semibold">Level</th>
                    <th className="px-4 py-4 font-semibold">XP</th>
                    <th className="px-4 py-4 font-semibold">Joined</th>
                    <th className="px-4 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-emerald-500/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-500">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text-primary)]">
                              {user.name}
                            </p>
                            <p className="mt-1 break-all text-xs text-[var(--text-muted)]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-4 py-4 text-[var(--text-primary)]">
                        {user.level ?? 1}
                      </td>

                      <td className="px-4 py-4 text-[var(--text-primary)]">
                        {user.xp ?? 0}
                      </td>

                      <td className="px-4 py-4 text-[var(--text-muted)]">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setNewRole('');
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 font-medium text-[var(--text-primary)] transition hover:border-emerald-500 hover:text-emerald-500"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                Page {pagination?.page ?? page} of {Math.max(totalPages, 1)}
                {' · '}
                {total} matching users
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || usersQuery.isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= totalPages || usersQuery.isFetching
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {/* User details modal */}
      {selectedUserId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUserId(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="glass-panel my-auto w-full max-w-lg rounded-2xl border border-[var(--border)] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                  ACCOUNT DETAILS
                </p>
                <h2
                  id="user-details-title"
                  className="mt-2 text-2xl font-bold text-[var(--text-primary)]"
                >
                  User details
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close user details"
                onClick={() => setSelectedUserId(null)}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface)]"
              >
                <X size={20} />
              </button>
            </div>

            {detailQuery.isLoading ? (
              <p className="py-8 text-sm text-[var(--text-muted)]">
                Loading user details...
              </p>
            ) : detailQuery.isError ? (
              <div className="py-6">
                <p className="text-sm text-red-500">
                  {detailQuery.error?.response?.data?.message ||
                    'Unable to load user details.'}
                </p>
                <button
                  type="button"
                  onClick={() => detailQuery.refetch()}
                  className="mt-3 text-sm font-semibold text-emerald-500"
                >
                  Retry
                </button>
              </div>
            ) : selectedUser ? (
              <>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-xl font-bold text-emerald-500">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="break-words text-lg font-semibold text-[var(--text-primary)]">
                      {selectedUser.name}
                    </p>
                    <p className="break-all text-sm text-[var(--text-muted)]">
                      {selectedUser.email}
                    </p>
                    <div className="mt-2">
                      <RoleBadge role={selectedUser.role} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['Level', selectedUser.level ?? 1],
                    ['XP', selectedUser.xp ?? 0],
                    ['Attempts', selectedUser._count?.attempts ?? 0],
                    ['Quizzes created', selectedUser._count?.quizzesCreated ?? 0],
                    ['Badges', selectedUser._count?.badges ?? 0],
                    ['Joined', formatDate(selectedUser.createdAt)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[var(--border)] p-3"
                    >
                      <p className="text-xs text-[var(--text-muted)]">
                        {label}
                      </p>
                      <p className="mt-1 break-words font-semibold text-[var(--text-primary)]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {selectedUser.id === response?.currentUserId ? null : (
                  <div className="mt-6 border-t border-[var(--border)] pt-5">
                    <label
                      htmlFor="user-role"
                      className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Change role
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        id="user-role"
                        value={newRole || selectedUser.role}
                        onChange={(event) => setNewRole(event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-emerald-500"
                      >
                        {ROLES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={
                          !newRole ||
                          newRole === selectedUser.role ||
                          roleMutation.isPending
                        }
                        onClick={changeRole}
                        className="button button-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {roleMutation.isPending ? 'Saving...' : 'Save role'}
                      </button>
                    </div>

                    {roleMutation.isError && (
                      <p className="mt-3 text-sm text-red-500">
                        {roleMutation.error?.response?.data?.message ||
                          'Unable to update user role.'}
                      </p>
                    )}
                  </div>
                )}

                {selectedUser.role === 'ADMIN' && (
                  <p className="mt-4 text-xs text-[var(--text-muted)]">
                    Admin role changes are subject to backend safeguards,
                    including protection against demoting the last administrator.
                  </p>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}
