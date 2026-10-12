import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  LockKeyhole,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from './AuthContext';
import { getRoleLandingPath } from '../../lib/routes';
import { getApiErrorMessage } from '../../lib/api';

const defaultState = {
  name: '',
  email: '',
  password: '',
};

function AuthBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-500/5">
        <Sparkles size={17} />
      </span>

      <span className="text-xl font-bold tracking-tight text-white">
        quizzly
        <span className="text-emerald-400">.</span>
      </span>
    </div>
  );
}

function AuthHeader({ eyebrow }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <AuthBrand />

      <span className="w-fit rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-emerald-300">
        {eyebrow}
      </span>
    </div>
  );
}

function AuthField({
  label,
  icon: Icon,
  ...props
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          {...props}
          className={[
            'w-full rounded-xl border border-white/[0.09]',
            'bg-white/[0.025] py-3 pl-10 pr-4',
            'text-sm text-slate-100 placeholder:text-slate-600',
            'outline-none transition-all duration-200',
            'focus:border-emerald-400/30',
            'focus:bg-white/[0.04]',
            'focus:ring-4 focus:ring-emerald-400/[0.06]',
            'disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        />
      </div>
    </label>
  );
}

function FormError({ children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3.5 py-3 text-sm text-red-300">
      <AlertCircle
        size={16}
        className="mt-0.5 shrink-0"
      />

      <span className="leading-5">{children}</span>
    </div>
  );
}

function FormMessage({ type, children }) {
  const success = type === 'success';

  return (
    <div
      className={[
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        success
          ? 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300'
          : 'border-red-400/15 bg-red-400/[0.06] text-red-300',
      ].join(' ')}
    >
      {success ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <AlertCircle
          size={16}
          className="mt-0.5 shrink-0"
        />
      )}

      <span className="leading-5">{children}</span>
    </div>
  );
}

function AuthButton({
  loading,
  children,
  loadingText,
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={[
        'inline-flex min-h-12 w-full items-center justify-center gap-2',
        'rounded-xl border border-emerald-400/25',
        'bg-emerald-400 px-5 py-3',
        'text-sm font-bold text-emerald-950',
        'shadow-lg shadow-emerald-500/10',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:bg-emerald-300',
        'active:translate-y-0',
        'disabled:cursor-not-allowed disabled:opacity-60',
      ].join(' ')}
    >
      {loading ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  compact = false,
}) {
  return (
    <div className="relative flex w-full justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/[0.05] blur-3xl" />

      <div
        className={[
          'relative w-full rounded-3xl border border-white/[0.08]',
          'bg-slate-950/70 shadow-2xl shadow-black/30',
          'backdrop-blur-2xl',
          compact ? 'max-w-md' : 'max-w-lg',
        ].join(' ')}
      >
        <div className="p-6 sm:p-8 lg:p-9">
          <AuthHeader eyebrow={eyebrow} />

          <div className="mt-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[2.15rem]">
              {title}
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-[15px]">
              {subtitle}
            </p>
          </div>

          <div className="mt-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthLinks({ children }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-white/[0.06] pt-5 text-xs font-medium text-slate-500">
      {children}
    </div>
  );
}

function AuthLink({ to, children }) {
  return (
    <Link
      to={to}
      className="transition-colors hover:text-emerald-300"
    >
      {children}
    </Link>
  );
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      });

      const destination =
        location.state?.from?.pathname ||
        getRoleLandingPath(response?.user?.role);

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to sign in. Please try again.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      title="Your next win starts here."
      subtitle="Pick up where you left off and keep your momentum going."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthField
          label="Email"
          icon={Mail}
          required
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          placeholder="you@example.com"
        />

        <AuthField
          label="Password"
          icon={LockKeyhole}
          required
          type="password"
          minLength="6"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="••••••••"
        />

        {error && <FormError>{error}</FormError>}

        <AuthButton
          loading={loading}
          loadingText="Please wait..."
        >
          <>
            Enter my workspace
            <ArrowRight size={17} />
          </>
        </AuthButton>
      </form>

      <AuthLinks>
        <AuthLink to="/register">
          Create an account
        </AuthLink>

        <AuthLink to="/forgot-password">
          Forgot password?
        </AuthLink>
      </AuthLinks>
    </AuthShell>
  );
}

export function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate(
        getRoleLandingPath(response?.user?.role),
        { replace: true },
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'Unable to create your account.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="START YOUR STREAK"
      title="Make learning feel like play."
      subtitle="Create an account and turn every quiz into measurable progress."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthField
          label="Name"
          icon={UserRound}
          required
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          placeholder="Alex Morgan"
        />

        <AuthField
          label="Email"
          icon={Mail}
          required
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          placeholder="you@example.com"
        />

        <AuthField
          label="Password"
          icon={LockKeyhole}
          required
          type="password"
          minLength="6"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              password: event.target.value,
            }))
          }
          placeholder="••••••••"
        />

        {error && <FormError>{error}</FormError>}

        <AuthButton
          loading={loading}
          loadingText="Please wait..."
        >
          <>
            Create my account
            <ArrowRight size={17} />
          </>
        </AuthButton>
      </form>

      <AuthLinks>
        <AuthLink to="/login">
          Already have an account?
        </AuthLink>
      </AuthLinks>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({
    type: 'idle',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setStatus({
      type: 'idle',
      message: '',
    });

    try {
      const response = await forgotPassword(email);

      setStatus({
        type: 'success',
        message:
          response.message ||
          'Reset link sent successfully.',
      });
    } catch (requestError) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(
          requestError,
          'Unable to send reset link.',
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      compact
      eyebrow="RESET ACCESS"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a secure reset link."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthField
          label="Email"
          icon={Mail}
          required
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
        />

        {status.message && (
          <FormMessage type={status.type}>
            {status.message}
          </FormMessage>
        )}

        <AuthButton
          loading={loading}
          loadingText="Sending..."
        >
          Send reset link
        </AuthButton>
      </form>

      <AuthLinks>
        <AuthLink to="/login">
          Back to sign in
        </AuthLink>
      </AuthLinks>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const { token } = useMemo(
    () => ({
      token: window.location.pathname
        .split('/')
        .pop(),
    }),
    [],
  );

  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({
    type: 'idle',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setStatus({
      type: 'idle',
      message: '',
    });

    try {
      const response = await resetPassword(
        token,
        password,
      );

      setStatus({
        type: 'success',
        message:
          response.message ||
          'Password reset successfully.',
      });

      setTimeout(
        () => navigate('/login', { replace: true }),
        1200,
      );
    } catch (requestError) {
      setStatus({
        type: 'error',
        message: getApiErrorMessage(
          requestError,
          'Unable to reset password.',
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      compact
      eyebrow="SET NEW PASSWORD"
      title="Choose a new password."
      subtitle="Use a strong password you haven't used before."
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <AuthField
          label="New password"
          icon={LockKeyhole}
          required
          type="password"
          minLength="6"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="••••••••"
        />

        {status.message && (
          <FormMessage type={status.type}>
            {status.message}
          </FormMessage>
        )}

        <AuthButton
          loading={loading}
          loadingText="Updating..."
        >
          Update password
        </AuthButton>
      </form>
    </AuthShell>
  );
}