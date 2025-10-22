# PAAS Platform - Step-by-Step Implementation Guide

## Phase 1: Backend Setup with SQLite3 + Prisma

### Step 1.1: Initialize Backend Project

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet dotenv
npm install @prisma/client
npm install -D prisma typescript @types/node @types/express
npm install -D tsx nodemon ts-node

# Install testing dependencies
npm install -D vitest @vitest/ui supertest @types/supertest
npm install -D c8 # for coverage

# Install authentication dependencies
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt

# Install validation
npm install zod express-validator
```

### Step 1.2: Configure TypeScript

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node", "vitest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 1.3: Set Up Package Scripts

Update `backend/package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon --exec tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx src/prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

### Step 1.4: Initialize Prisma with SQLite

```bash
# Initialize Prisma
npx prisma init --datasource-provider sqlite

# This creates:
# - prisma/schema.prisma
# - .env
```

### Step 1.5: Configure Prisma Schema

Edit `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// Enums (SQLite doesn't support enums, use strings with validation)
enum Role {
  admin
  staff
  provider
  patient
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

enum AppointmentStatus {
  scheduled
  confirmed
  checked_in
  in_progress
  completed
  cancelled
  no_show
  rescheduled
}

enum NoShowRisk {
  low
  medium
  high
}

enum WaitlistPriority {
  low
  medium
  high
  urgent
}

enum WaitlistStatus {
  active
  contacted
  converted
  expired
  cancelled
}

// ============================================================================
// User & Authentication
// ============================================================================

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      String   // Role enum as string
  firstName String
  lastName  String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  provider  Provider?
  patient   Patient?
}

// ============================================================================
// Patient
// ============================================================================

model Patient {
  id              String    @id @default(uuid())
  userId          String?   @unique
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  gender          String    // Gender enum
  phone           String
  email           String?
  nationalId      String?
  addressStreet   String?
  addressDistrict String?
  addressProvince String?
  addressPostal   String?
  addressCountry  String?
  emergencyName   String?
  emergencyRelation String?
  emergencyPhone  String?
  pdpaConsent     Boolean   @default(false)
  pdpaConsentDate DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user          User?           @relation(fields: [userId], references: [id])
  appointments  Appointment[]
  waitlist      WaitlistEntry[]
}

// ============================================================================
// Location
// ============================================================================

model Location {
  id              String       @id @default(uuid())
  name            String
  building        String?
  floor           String?
  room            String?
  addressStreet   String?
  addressDistrict String?
  addressProvince String
  addressPostal   String
  addressCountry  String
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  departments   Department[]
  timeSlots     TimeSlot[]
  appointments  Appointment[]
}

// ============================================================================
// Department
// ============================================================================

model Department {
  id                          String       @id @default(uuid())
  name                        String
  code                        String       @unique
  description                 String?
  locationId                  String
  defaultAppointmentDuration  Int          // minutes
  isActive                    Boolean      @default(true)
  createdAt                   DateTime     @default(now())
  updatedAt                   DateTime     @updatedAt

  location      Location        @relation(fields: [locationId], references: [id])
  providers     Provider[]
  appointments  Appointment[]
  waitlist      WaitlistEntry[]
  timeSlots     TimeSlot[]
}

// ============================================================================
// Provider
// ============================================================================

model Provider {
  id            String       @id @default(uuid())
  userId        String       @unique
  firstName     String
  lastName      String
  title         String
  specialties   String       // JSON array as string
  departments   String       // JSON array of department IDs
  licenseNumber String       @unique
  email         String
  phone         String
  bio           String?
  photoUrl      String?
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user          User          @relation(fields: [userId], references: [id])
  appointments  Appointment[]
  timeSlots     TimeSlot[]
  waitlist      WaitlistEntry[]
}

// ============================================================================
// TimeSlot
// ============================================================================

model TimeSlot {
  id                String    @id @default(uuid())
  providerId        String
  departmentId      String
  locationId        String
  startTime         DateTime
  endTime           DateTime
  duration          Int       // minutes
  capacity          Int       @default(1)
  isAvailable       Boolean   @default(true)
  isRecurring       Boolean   @default(false)
  recurringPattern  String?   // JSON object as string
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  provider      Provider      @relation(fields: [providerId], references: [id])
  department    Department    @relation(fields: [departmentId], references: [id])
  location      Location      @relation(fields: [locationId], references: [id])
  appointments  Appointment[]
}

// ============================================================================
// Appointment
// ============================================================================

model Appointment {
  id                    String    @id @default(uuid())
  confirmationCode      String    @unique
  patientId             String
  providerId            String
  departmentId          String
  timeSlotId            String
  locationId            String
  scheduledStart        DateTime
  scheduledEnd          DateTime
  actualStart           DateTime?
  actualEnd             DateTime?
  status                String    // AppointmentStatus enum
  appointmentType       String
  reason                String?
  notes                 String?
  providerNotes         String?
  noShowRisk            String?   // NoShowRisk enum
  noShowPredictionScore Float?
  remindersSent         Int       @default(0)
  lastReminderSent      DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  cancelledAt           DateTime?
  cancellationReason    String?

  patient     Patient    @relation(fields: [patientId], references: [id])
  provider    Provider   @relation(fields: [providerId], references: [id])
  department  Department @relation(fields: [departmentId], references: [id])
  timeSlot    TimeSlot   @relation(fields: [timeSlotId], references: [id])
  location    Location   @relation(fields: [locationId], references: [id])
}

// ============================================================================
// Waitlist
// ============================================================================

model WaitlistEntry {
  id                        String    @id @default(uuid())
  patientId                 String
  departmentId              String
  providerId                String?
  preferredDates            String?   // JSON array as string
  preferredTimeOfDay        String?   // JSON array as string
  priority                  String    // WaitlistPriority enum
  medicalUrgency            String?
  status                    String    // WaitlistStatus enum
  requestedDate             DateTime
  expiresAt                 DateTime?
  notificationsSent         Int       @default(0)
  lastNotificationSent      DateTime?
  convertedToAppointmentId  String?
  notes                     String?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  patient     Patient     @relation(fields: [patientId], references: [id])
  department  Department  @relation(fields: [departmentId], references: [id])
  provider    Provider?   @relation(fields: [providerId], references: [id])
}

// ============================================================================
// Indexes for performance
// ============================================================================

// Appointments
@@index([patientId], map: "idx_appointment_patient")
@@index([providerId], map: "idx_appointment_provider")
@@index([departmentId], map: "idx_appointment_department")
@@index([scheduledStart], map: "idx_appointment_scheduled")
@@index([status], map: "idx_appointment_status")

// Waitlist
@@index([patientId], map: "idx_waitlist_patient")
@@index([departmentId], map: "idx_waitlist_department")
@@index([status], map: "idx_waitlist_status")
@@index([priority], map: "idx_waitlist_priority")

// TimeSlots
@@index([providerId], map: "idx_timeslot_provider")
@@index([startTime], map: "idx_timeslot_start")
@@index([isAvailable], map: "idx_timeslot_available")
```

### Step 1.6: Create Environment File

Create `backend/.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:8080"
```

### Step 1.7: Run First Migration

```bash
cd backend
npx prisma migrate dev --name init

# This creates:
# - prisma/dev.db (SQLite database)
# - prisma/migrations/ folder
```

### Step 1.8: Create Seed Script

Create `backend/src/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create locations
  const mainClinic = await prisma.location.create({
    data: {
      name: 'Main Clinic',
      building: 'Building A',
      floor: '2nd Floor',
      room: '201',
      addressStreet: '123 Healthcare Road',
      addressDistrict: 'Watthana',
      addressProvince: 'Bangkok',
      addressPostal: '10110',
      addressCountry: 'Thailand',
    },
  });

  const eastWing = await prisma.location.create({
    data: {
      name: 'East Wing',
      building: 'Building B',
      floor: '1st Floor',
      room: '105',
      addressStreet: '123 Healthcare Road',
      addressDistrict: 'Watthana',
      addressProvince: 'Bangkok',
      addressPostal: '10110',
      addressCountry: 'Thailand',
    },
  });

  // Create departments
  const orthopedics = await prisma.department.create({
    data: {
      name: 'Orthopedics',
      code: 'ORTHO',
      description: 'Bone, joint, and muscle care',
      locationId: mainClinic.id,
      defaultAppointmentDuration: 30,
      isActive: true,
    },
  });

  const cardiology = await prisma.department.create({
    data: {
      name: 'Cardiology',
      code: 'CARDIO',
      description: 'Heart and cardiovascular care',
      locationId: eastWing.id,
      defaultAppointmentDuration: 45,
      isActive: true,
    },
  });

  const general = await prisma.department.create({
    data: {
      name: 'General Medicine',
      code: 'GENERAL',
      description: 'General health and wellness',
      locationId: mainClinic.id,
      defaultAppointmentDuration: 20,
      isActive: true,
    },
  });

  // Create users and providers
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.chen@hospital.com',
      password: hashedPassword,
      role: 'provider',
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+66-2-123-4567',
    },
  });

  await prisma.provider.create({
    data: {
      userId: user1.id,
      firstName: 'Sarah',
      lastName: 'Chen',
      title: 'Dr.',
      specialties: JSON.stringify(['Orthopedics', 'Sports Medicine']),
      departments: JSON.stringify([orthopedics.id]),
      licenseNumber: 'MD-12345',
      email: 'sarah.chen@hospital.com',
      phone: '+66-2-123-4567',
      bio: 'Specializing in orthopedic surgery with 15 years of experience',
      isActive: true,
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+66-2-000-0000',
    },
  });

  // Create sample patient
  await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+66-81-234-5678',
      email: 'john.doe@email.com',
      pdpaConsent: true,
      pdpaConsentDate: new Date(),
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:
```bash
npm run prisma:seed
```

---

## Next Steps

Continue to `IMPLEMENTATION_GUIDE_PART2.md` for:
- Express server setup
- Authentication implementation
- API routes
- Unit tests
- Integration tests
