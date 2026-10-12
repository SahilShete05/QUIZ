import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />
        </div>

        <p className="text-sm font-medium text-slate-300">
          Preparing your learning space
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}