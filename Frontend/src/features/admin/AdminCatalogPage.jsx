import { useState } from 'react';
import {
  AlertCircle,
  Award,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useAdminBadgesQuery,
  useAdminCategoriesQuery,
  useCreateBadgeMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from './hooks';

import { getApiErrorMessage } from '../../lib/api';

function CategoryRow({ category, onEdit, onDelete }) {
  return (
    <div
      className={[
        'group flex items-center gap-3 rounded-xl',
        'border border-[var(--border)]',
        'bg-[var(--surface-soft)] p-3.5',
        'transition-all duration-200',
        'hover:border-[var(--border-strong)]',
        'hover:bg-[var(--surface-hover)]',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Tags size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {category.name}
        </p>

        <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
          Quiz category
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'border border-transparent',
            'text-[var(--text-subtle)]',
            'transition-all duration-200',
            'hover:border-[var(--border)]',
            'hover:bg-[var(--surface-hover)]',
            'hover:text-[var(--text-primary)]',
          ].join(' ')}
          aria-label={`Edit ${category.name}`}
          onClick={onEdit}
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          className={[
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'border border-transparent',
            'text-[var(--text-subtle)]',
            'transition-all duration-200',
            'hover:border-red-500/15',
            'hover:bg-red-500/10',
            'hover:text-red-600',
            'dark:hover:border-red-400/15',
            'dark:hover:bg-red-400/10',
            'dark:hover:text-red-300',
          ].join(' ')}
          aria-label={`Delete ${category.name}`}
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function BadgeRow({ badge }) {
  return (
    <div
      className={[
        'group flex items-start gap-3 rounded-xl',
        'border border-[var(--border)]',
        'bg-[var(--surface-soft)] p-3.5',
        'transition-all duration-200',
        'hover:border-[var(--border-strong)]',
        'hover:bg-[var(--surface-hover)]',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
        <Award size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {badge.name}
        </p>

        <p className="mt-1 text-xs leading-5 text-[var(--text-subtle)]">
          {badge.description || 'No description provided.'}
        </p>
      </div>
    </div>
  );
}

function CatalogSkeleton({ rows = 4, showActions = true }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5"
        >
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[var(--surface-hover)]" />

          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--surface-hover)]" />
            <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-[var(--surface-soft)]" />
          </div>

          {showActions && (
            <div className="flex gap-2">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-[var(--surface-hover)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyCatalogState({ icon: Icon, children }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-hover)] text-[var(--text-subtle)]">
        <Icon size={19} />
      </div>

      <p className="mt-3 text-sm text-[var(--text-muted)]">
        {children}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
      </div>

      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          iconClassName,
        ].join(' ')}
      >
        <Icon size={18} />
      </div>
    </div>
  );
}

function FieldLabel({ htmlFor, children, optional = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-[var(--text-secondary)]"
      >
        {children}
      </label>

      {optional && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
          Optional
        </span>
      )}
    </div>
  );
}

const inputClassName = [
  'w-full rounded-xl',
  'border border-[var(--border-strong)]',
  'bg-[var(--input-bg)]',
  'px-3.5 py-2.5',
  'text-sm text-[var(--text-primary)]',
  'outline-none transition-all duration-200',
  'placeholder:text-[var(--text-subtle)]',
  'focus:border-emerald-500/30',
  'focus:bg-[var(--input-bg-focus)]',
  'focus:ring-4 focus:ring-emerald-500/10',
].join(' ');

export function AdminCatalogPage() {
  const categories = useAdminCategoriesQuery();
  const badges = useAdminBadgesQuery();

  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();
  const createBadge = useCreateBadgeMutation();

  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [badge, setBadge] = useState({
    name: '',
    description: '',
    iconUrl: '',
  });

  const error = categories.error || badges.error;

  const notifyError = (failure) => {
    toast.error(
      getApiErrorMessage(
        failure,
        'Request failed',
      ),
    );
  };

  if (categories.isLoading || badges.isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
            CATALOG MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Loading catalog...
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            Fetching categories and badges from the backend.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <CatalogSkeleton rows={4} />
          </section>

          <section className="glass-panel rounded-2xl p-5 sm:p-6">
            <CatalogSkeleton rows={3} showActions={false} />
          </section>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div
          className={[
            'mx-auto w-full max-w-lg rounded-2xl',
            'border border-red-500/15',
            'bg-[var(--surface)] p-7 text-center',
            'shadow-[var(--shadow-card)] backdrop-blur-xl',
            'sm:p-10',
          ].join(' ')}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300">
            <AlertCircle size={23} />
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-300">
            Catalog Management
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Catalog data could not be loaded
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
            Check the backend response and try again.
          </p>

          <button
            type="button"
            className="button button-primary mt-6"
            onClick={() => {
              categories.refetch();
              badges.refetch();
            }}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </main>
    );
  }

  const categoryList = categories.data?.categories ?? [];
  const badgeList = badges.data?.badges ?? [];

  const saveCategory = (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) return;

    const action = editingId
      ? updateCategory
      : createCategory;

    const payload = editingId
      ? {
          categoryId: editingId,
          payload: { name },
        }
      : { name };

    action.mutate(payload, {
      onSuccess: (data) => {
        toast.success(
          data?.message || 'Category saved',
        );

        setCategoryName('');
        setEditingId(null);
      },

      onError: notifyError,
    });
  };

  const saveBadge = (event) => {
    event.preventDefault();

    createBadge.mutate(
      {
        ...badge,
        iconUrl: badge.iconUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Badge created');

          setBadge({
            name: '',
            description: '',
            iconUrl: '',
          });
        },

        onError: notifyError,
      },
    );
  };

  const handleDeleteCategory = (category) => {
    const confirmed = window.confirm(
      `Delete ${category.name}?`,
    );

    if (!confirmed) return;

    deleteCategory.mutate(category.id, {
      onSuccess: (data) => {
        toast.success(
          data?.message || 'Category deleted',
        );
      },

      onError: notifyError,
    });
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
          CATALOG MANAGEMENT
        </p>

        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              Categories and badges.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              Manage the catalog resources exposed by the Admin API.
            </p>
          </div>

          <div className="w-fit rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5 text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {categoryList.length + badgeList.length}
            </span>{' '}
            total resources
          </div>
        </div>
      </div>

      {/* Management grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Categories */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionHeader
            eyebrow="CATEGORIES"
            title={`${categoryList.length} ${
              categoryList.length === 1
                ? 'category'
                : 'categories'
            }`}
            icon={Tags}
            iconClassName="border border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300"
          />

          {/* Category form */}
          <form
            className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
            onSubmit={saveCategory}
          >
            <div>
              <label
                htmlFor="category-name"
                className="text-sm font-semibold text-[var(--text-secondary)]"
              >
                {editingId
                  ? 'Edit category'
                  : 'New category'}
              </label>

              <p className="mt-1 text-xs text-[var(--text-subtle)]">
                {editingId
                  ? 'Update the existing category name.'
                  : 'Add a category that teachers can use for quizzes.'}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="category-name"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(event.target.value)
                }
                placeholder="e.g. JavaScript"
                minLength={3}
                required
                className={inputClassName}
              />

              <div className="flex shrink-0 gap-2">
                <button
                  type="submit"
                  disabled={
                    createCategory.isPending ||
                    updateCategory.isPending
                  }
                  className="button button-primary"
                >
                  {editingId ? (
                    <Check size={15} />
                  ) : (
                    <Plus size={15} />
                  )}

                  {editingId
                    ? updateCategory.isPending
                      ? 'Saving...'
                      : 'Save'
                    : createCategory.isPending
                      ? 'Creating...'
                      : 'Create'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => {
                      setEditingId(null);
                      setCategoryName('');
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Categories */}
          <div className="mt-5 space-y-2.5">
            {categoryList.length > 0 ? (
              categoryList.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={() => {
                    setEditingId(category.id);
                    setCategoryName(category.name);
                  }}
                  onDelete={() =>
                    handleDeleteCategory(category)
                  }
                />
              ))
            ) : (
              <EmptyCatalogState icon={Tags}>
                No categories found.
              </EmptyCatalogState>
            )}
          </div>
        </section>

        {/* Badges */}
        <section className="glass-panel rounded-2xl p-5 sm:p-6">
          <SectionHeader
            eyebrow="ALL BADGES"
            title={`${badgeList.length} ${
              badgeList.length === 1
                ? 'badge'
                : 'badges'
            }`}
            icon={Award}
            iconClassName="border border-amber-500/15 bg-amber-500/10 text-amber-600 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300"
          />

          {/* Badge form */}
          <form
            className="mt-6 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
            onSubmit={saveBadge}
          >
            <div>
              <FieldLabel htmlFor="badge-name">
                Badge name
              </FieldLabel>

              <input
                id="badge-name"
                value={badge.name}
                onChange={(event) =>
                  setBadge({
                    ...badge,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. Quiz Master"
                minLength={2}
                required
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <div>
              <FieldLabel htmlFor="badge-description">
                Description
              </FieldLabel>

              <textarea
                id="badge-description"
                value={badge.description}
                onChange={(event) =>
                  setBadge({
                    ...badge,
                    description: event.target.value,
                  })
                }
                placeholder="Describe what this badge represents..."
                minLength={5}
                required
                rows={3}
                className={[
                  'mt-2 resize-none',
                  inputClassName,
                ].join(' ')}
              />
            </div>

            <div>
              <FieldLabel
                htmlFor="badge-icon"
                optional
              >
                Icon URL
              </FieldLabel>

              <input
                id="badge-icon"
                value={badge.iconUrl}
                onChange={(event) =>
                  setBadge({
                    ...badge,
                    iconUrl: event.target.value,
                  })
                }
                placeholder="https://..."
                className={`mt-2 ${inputClassName}`}
              />
            </div>

            <button
              type="submit"
              disabled={createBadge.isPending}
              className="button button-primary w-full sm:w-auto"
            >
              <Plus size={15} />

              {createBadge.isPending
                ? 'Creating...'
                : 'Create badge'}
            </button>
          </form>

          {/* Badges */}
          <div className="mt-5 space-y-2.5">
            {badgeList.length > 0 ? (
              badgeList.map((item) => (
                <BadgeRow
                  key={item.id}
                  badge={item}
                />
              ))
            ) : (
              <EmptyCatalogState icon={Award}>
                No badges found.
              </EmptyCatalogState>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}