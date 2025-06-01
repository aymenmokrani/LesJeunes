# LesJeunes Project

Full-stack application with Next.js frontend and NestJS backend.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- npm

### Development Setup

#### 1. Start Database
Run Docker Compose in the project root to start PostgreSQL database:

```bash
docker-compose up -d postgres
```

#### 2. Start Backend
Navigate to backend directory and start the NestJS server:

```bash
cd lesjeunes-backend
npm install
npm run start:dev
```

The backend will be available at: `http://localhost:4000`

#### 3. Start Frontend
Navigate to frontend directory and start the Next.js development server:

```bash
cd lesjeunes-frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Project Structure

```
lesjeunes/
├── docker-compose.yml       # Database services
├── .env                     # Environment variables
├── lesjeunes-backend/       # NestJS API
└── lesjeunes-frontend/      # Next.js client
```

## Environment Variables

Create a `.env` file in the project root and in lesjeunes/backend with:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=lesjeunes_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=dev_password
```

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Backend**: NestJS, TypeORM, TypeScript
- **Database**: PostgreSQL