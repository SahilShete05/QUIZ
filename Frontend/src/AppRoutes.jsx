import { Route, Routes } from 'react-router-dom';

// Routing
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PublicRoute } from './components/routing/PublicRoute';
import { RoleRoute } from './components/routing/RoleRoute';
import { AuthLandingRoute } from './components/routing/AuthLandingRoute';

// Layouts
import { PublicLayout } from './components/layouts/PublicLayout';
import { StudentLayout } from './components/layouts/StudentLayout';
import { TeacherLayout } from './components/layouts/TeacherLayout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Authentication
import {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
} from './features/auth/AuthForms';

// Student
import { DashboardPage } from './features/student/DashboardPage';
import { QuizzesPage } from './features/student/QuizzesPage';
import { QuizDetailsPage } from './features/student/QuizDetailsPage';
import { AttemptPage } from './features/student/AttemptPage';
import { AttemptResultPage } from './features/student/AttemptResultPage';
import { AttemptsPage } from './features/student/AttemptsPage';
import  ProfilePage  from './features/student/ProfilePage';
import { BadgesPage } from './features/student/BadgesPage';
import { NotificationsPage } from './features/student/NotificationsPage';
import { LeaderboardPage } from './features/student/LeaderboardPage';

// Teacher
import { TeacherDashboardPage } from './features/teacher/TeacherDashboardPage';
import { TeacherQuizzesPage } from './features/teacher/TeacherQuizzesPage';
import { TeacherQuizEditorPage } from './features/teacher/TeacherQuizEditorPage';
import { TeacherQuizManagementPage } from './features/teacher/TeacherQuizManagementPage';
import { TeacherAIGeneratorPage } from './features/teacher/TeacherAIGeneratorPage';
import { TeacherProfilePage } from './features/teacher/teacherProfilePage';
import { TeacherAnalyticsPage } from "./features/analytics/TeacherAnalyticsPage";

// Admin
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminQuizzesPage } from './features/admin/AdminQuizzesPage';
import { AdminQuizDetailsPage } from './features/admin/AdminQuizDetailsPage';
import { AdminCatalogPage } from './features/admin/AdminCatalogPage';
import { AdminAnalyticsPage } from "./features/analytics/AdminAnalyticsPage";
import { AdminProfilePage } from './features/admin/AdminProfilePage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';


/* =========================================================
   Shared placeholder page
   ========================================================= */

function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="max-w-3xl">
        {eyebrow && (
          <span className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {eyebrow}
          </span>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   Application Routes
   ========================================================= */

export function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}

      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordForm />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPasswordForm />
            </PublicRoute>
          }
        />
      </Route>

      {/* =====================================================
          STUDENT ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route
          path="/student/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/student/quizzes"
          element={<QuizzesPage />}
        />

        <Route
          path="/student/quizzes/:quizId"
          element={<QuizDetailsPage />}
        />

        <Route
          path="/student/attempts"
          element={<AttemptsPage />}
        />

        <Route
          path="/student/attempts/:attemptId"
          element={<AttemptPage />}
        />

        <Route
          path="/student/attempts/:attemptId/result"
          element={<AttemptResultPage />}
        />

        <Route
          path="/student/profile"
          element={<ProfilePage />}
        />

        <Route
          path="/student/badges"
          element={<BadgesPage />}
        />

        <Route
          path="/student/notifications"
          element={<NotificationsPage />}
        />

        <Route
          path="/student/leaderboard"
          element={<LeaderboardPage />}
        />
      </Route>

      {/* =====================================================
          TEACHER ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['TEACHER']}>
              <TeacherLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route
          path="/teacher/dashboard"
          element={<TeacherDashboardPage />}
        />
        <Route
        path="/teacher/analytics"
        element={<TeacherAnalyticsPage />}
        />

        <Route
          path="/teacher/quizzes"
          element={<TeacherQuizzesPage />}
        />

        <Route
          path="/teacher/quizzes/new"
          element={<TeacherQuizEditorPage />}
        />

        <Route
          path="/teacher/quizzes/:quizId/edit"
          element={<TeacherQuizEditorPage />}
        />

        <Route
          path="/teacher/quizzes/:quizId"
          element={<TeacherQuizManagementPage />}
        />

        <Route
          path="/teacher/ai-generator"
          element={<TeacherAIGeneratorPage />}
        />

        <Route
        path="/teacher/profile"
        element={<TeacherProfilePage />}
        />
        
      </Route>

      {/* =====================================================
          ADMIN ROUTES
          ===================================================== */}

      ```jsx
      {/* =====================================================
          ADMIN ROUTES
          ===================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin/dashboard"
          element={<AdminDashboardPage />}
        />

        <Route
          path="/admin/analytics"
          element={<AdminAnalyticsPage />}
        />

        <Route
          path="/admin/quizzes"
          element={<AdminQuizzesPage />}
        />

        <Route
          path="/admin/quizzes/:quizId"
          element={<AdminQuizDetailsPage />}
        />

        <Route
          path="/admin/catalog"
          element={<AdminCatalogPage />}
        />

        <Route
          path="/admin/ai-generator"
          element={<TeacherAIGeneratorPage />}
        />

        <Route
          path="/admin/profile"
          element={<AdminProfilePage />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsersPage />}
        />
      </Route>


      {/* =====================================================
          ROOT
          ===================================================== */}

      <Route
        path="/"
        element={<AuthLandingRoute />}
      />

      <Route
        path="*"
        element={<AuthLandingRoute />}
      />
    </Routes>
  );
}