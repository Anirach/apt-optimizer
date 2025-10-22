# PAAS Platform - Backend

Backend server for the Patient Appointment Access System.

## Implementation Status

**Part 1 ✅ Complete:** Backend setup with Prisma schema (11 models), TypeScript, and dependencies
**Part 2 ✅ Complete:** Express server, JWT authentication, middleware, and API routes

**Current Status:** Code is complete and ready. Requires `npm run prisma:generate` to be run in an environment with network access to download Prisma engine binaries.

## Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** SQLite3 with Prisma ORM
- **Authentication:** JWT (jsonwebtoken + bcrypt)
- **Validation:** Zod + express-validator
- **Testing:** Vitest + Supertest

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Prisma

Generate the Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

**Note:** If you encounter network errors during Prisma setup, you may need to run the commands with:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run prisma:generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run prisma:migrate
```

### 3. Configure Environment

Copy `.env` file and update values as needed:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:8080"
```

**Important:** Change `JWT_SECRET` in production!

### 4. Run the Server

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## Database Schema

The database includes 11 models:

- **User** - Authentication and user accounts
- **Patient** - Patient information and medical records
- **Provider** - Healthcare providers (doctors, nurses)
- **Department** - Hospital departments (Orthopedics, Cardiology, etc.)
- **Location** - Physical locations within the facility
- **TimeSlot** - Available appointment time slots
- **Appointment** - Scheduled appointments
- **WaitlistEntry** - Waitlist management

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server

# Testing
npm test                 # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report

# Prisma
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with initial data
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

## Database Seeding

The seed script creates:

- 2 locations (Main Clinic, East Wing)
- 3 departments (Orthopedics, Cardiology, General Medicine)
- 1 provider (Dr. Sarah Chen)
- 1 admin user (admin@hospital.com)
- 1 sample patient (John Doe)

**Default credentials:**
- Admin: `admin@hospital.com` / `password123`
- Provider: `sarah.chen@hospital.com` / `password123`

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── src/
│   ├── prisma/
│   │   └── seed.ts        # Database seed script
│   ├── server.ts          # Main server file (to be created)
│   ├── routes/            # API routes (to be created)
│   ├── controllers/       # Route controllers (to be created)
│   ├── services/          # Business logic (to be created)
│   └── middleware/        # Express middleware (to be created)
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

## Next Steps

Continue with **IMPLEMENTATION_GUIDE_PART2.md** to:
- Create Express server setup
- Implement authentication system
- Build API routes and controllers
- Add middleware and error handling

## Troubleshooting

### Prisma Binary Download Errors

If you see 403 Forbidden errors when downloading Prisma engines:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### Port Already in Use

If port 3001 is busy, change `PORT` in `.env` file.

### Database Locked Error

SQLite can only handle one write at a time. Make sure no other processes are accessing the database.
