# Task Management App (Assignment)

A full-stack task management application with user authentication, built with Next.js and Express.

## Live Demo

- **Web App**: [https://task-management.sudipbiswas.dev](https://task-management.sudipbiswas.dev)
- **API**: [https://task-management-api.sudipbiswas.dev](https://task-management-api.sudipbiswas.dev)

## Tech Stack

**Frontend**

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI / shadcn components
- React Hook Form + Zod

**Backend**

- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- JWT Authentication

## Features

- User registration and login with JWT-based auth
- Create, edit, and delete tasks
- Toggle task completion status
- Filter tasks by status (all, pending, done)
- Search tasks by title
- Pagination with configurable page size
- Responsive design
- Optimistic UI updates

## Local Development Setup

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (or [Neon](https://neon.tech) account)

### 1. Clone the repository

```bash
git clone https://github.com/sudiphq/task-management-app.git
cd task-management-app
```

### 2. Setup the API

```bash
cd api

# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env
```

Edit `.env` with your values:

```env
NODE_ENV=development
PORT=8080
CORS_ORIGIN="http://localhost:3000"
DATABASE_URL="postgresql://user:password@host/database"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

Run database migrations and start the server:

```bash
# Run migrations
pnpm run db:migrate

# Start development server
pnpm dev
```

The API will be running at `http://localhost:8080`

### 3. Setup the Web App

```bash
cd web

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the development server:

```bash
pnpm dev
```

The web app will be running at `http://localhost:3000`

## API Endpoints

### Authentication

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| POST   | `/auth/register` | Register a new user       |
| POST   | `/auth/login`    | Login with email/password |
| POST   | `/auth/logout`   | Logout and clear cookies  |
| POST   | `/auth/refresh`  | Refresh access token      |
| GET    | `/auth/me`       | Get current user          |

### Tasks (Protected)

| Method | Endpoint            | Description                           |
| ------ | ------------------- | ------------------------------------- |
| GET    | `/tasks`            | List tasks (with pagination, filters) |
| POST   | `/tasks`            | Create a new task                     |
| GET    | `/tasks/:id`        | Get a single task                     |
| PATCH  | `/tasks/:id`        | Update a task                         |
| DELETE | `/tasks/:id`        | Delete a task                         |
| POST   | `/tasks/:id/toggle` | Toggle task status                    |

## Project Structure

```
task-management-app/
├── api/                    # Express backend
│   ├── src/
│   │   ├── db/             # Database schema & migrations
│   │   ├── middlewares/    # Auth & error handling
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helpers & validation
│   └── package.json
│
└── web/                    # Next.js frontend
    ├── app/                # App router pages
    ├── components/         # React components
    ├── context/            # Auth & tasks context
    ├── lib/                # API client & utilities
    └── package.json
```
