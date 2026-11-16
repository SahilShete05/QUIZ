# Quiz Platform

An interactive, role-based online quiz platform for students, teachers, and administrators. The application supports quiz authoring, timed attempts, scoring, analytics, gamification, notifications, and AI-assisted quiz generation and attempt reviews.

## Live Demo

**Application:** [https://quiz-sigma-ten-21.vercel.app/login](https://quiz-sigma-ten-21.vercel.app/login)

The application uses role-based access control. After signing in, users are directed to the dashboard that matches their role:

- **Students** take published quizzes, review results, earn XP and badges, and track their leaderboard position.
- **Teachers** create and publish quizzes, manage question banks, review attempts, and view analytics.
- **Administrators** manage users, quizzes, catalog data, and platform analytics.

## Features

### Authentication and account management

- User registration and login
- Cookie-based JWT authentication
- Role-based authorization for students, teachers, and administrators
- Forgot-password and reset-password flows
- Profile management
- Protected frontend routes

### Student experience

- Browse published quizzes
- Start timed quiz attempts
- Submit answers and receive scores
- Automatic submission for expired attempts
- Attempt history and detailed results
- AI-generated attempt explanations and reviews
- XP, levels, badges, and global or quiz-specific leaderboards
- Notifications
- Light/dark theme support

### Teacher tools

- Create, edit, publish, unpublish, and delete quizzes
- Create and manage questions and categories
- Add questions to quizzes and control question order and points
- AI-assisted quiz and question generation
- Teacher dashboard and analytics
- Attempt integrity events such as tab switches, copy attempts, paste attempts, and right-click attempts

### Administration

- User and role management
- Quiz and question catalog management
- Badge management
- Administrative dashboard
- Platform analytics

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

### Backend

- Node.js
- Express 5
- Prisma ORM
- PostgreSQL
- JWT and HTTP-only cookies
- Zod request validation
- Helmet, CORS, and Morgan
- Swagger/OpenAPI documentation
- Google Gemini API integration
- Nodemailer for email workflows
- Node Cron for automatic attempt submission

## Project Structure

```text
QUIZ/
├── Backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validator/
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── AppRoutes.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- A Google Gemini API key for AI features
- OAuth refresh-token credentials for password-reset email delivery, if that workflow is enabled

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/SahilShete05/QUIZ.git
cd QUIZ
```

### 2. Configure the backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"

GEMINI_API_KEY="your-gemini-api-key"

EMAIL_USER="your-email@example.com"
CLIENT_ID="your-oauth-client-id"
CLIENT_SECRET="your-oauth-client-secret"
REFRESH_TOKEN="your-oauth-refresh-token"
```

Generate the Prisma client and apply migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The Vite development server is normally available at `http://localhost:5173`.

If the frontend and backend are served from the same origin, `VITE_API_URL` may be omitted and the frontend will use `/api`.

## Available Scripts

### Backend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Create and apply a development migration |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm test` | Placeholder test command |

### Frontend

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

## API

The backend exposes the following route groups under `/api`:

| Route group | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, logout, and password recovery |
| `/api/quizzes` | Quiz lifecycle and published quiz access |
| `/api/questions` | Question bank management |
| `/api/categories` | Question categories |
| `/api/attempts` | Quiz attempts, answers, submissions, and results |
| `/api/leaderboard` | Global and quiz leaderboards |
| `/api/dashboard` | Student dashboard data |
| `/api/teacher-dashboard` | Teacher dashboard data |
| `/api/admin/dashboard` | Administrative dashboard data |
| `/api/analytics` | Teacher and administrator analytics |
| `/api/ai` | AI quiz generation and attempt reviews |
| `/api/badges` | Badge and achievement data |
| `/api/notifications` | User notifications |
| `/api/users` | Profiles and user administration |

Interactive API documentation is available when the backend is running:

- [Swagger UI](http://localhost:5000/api-docs)
- [OpenAPI JSON](http://localhost:5000/swagger.json)

## Database Model

The PostgreSQL schema is managed with Prisma migrations. Core entities include:

- `User`
- `Quiz`
- `Question`
- `Option`
- `QuizQuestion`
- `Attempt`
- `Answer`
- `AttemptEvent`
- `Category`
- `Badge`
- `UserBadge`
- `Notification`

Attempts support multiple question types, scoring, completion timing, auto-submission, and integrity-event tracking.

## Deployment

### Frontend

The frontend is configured for Vercel deployment. Set the following Vercel environment variable when the API is hosted separately:

```env
VITE_API_URL=https://your-backend-domain.example.com/api
```

Then build with:

```bash
npm run build
```

### Backend

Deploy the `Backend` directory as a Node.js service and configure all required environment variables. Ensure that:

1. `DATABASE_URL` and `DIRECT_URL` point to the production PostgreSQL database.
2. The frontend origin is included in the backend CORS allowlist or supplied through `FRONTEND_URL`.
3. Cookies are configured appropriately for the deployed frontend and API domains.
4. Prisma migrations are applied before starting the application.

## Security Notes

- Never commit `.env` files or API keys.
- Use a strong, unique `JWT_SECRET` in every environment.
- Restrict `FRONTEND_URL` and database access in production.
- Use HTTPS for deployed frontend and backend services.
- Keep production database credentials and OAuth tokens in the hosting provider's secret manager.

## License

This project currently uses the license declared in the repository's package metadata.
