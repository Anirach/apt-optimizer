# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Patient Appointment Access System (PAAS Platform) - a healthcare appointment scheduling application built with React, TypeScript, Vite, and shadcn-ui. The platform aims to reduce no-shows, optimize provider schedules, and improve patient access through intelligent scheduling features.

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS with CSS variables
- **Forms**: react-hook-form + zod
- **Date Handling**: date-fns
- **Charts**: recharts
- **Icons**: lucide-react

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── pages/              # Route pages (one per route)
│   ├── Index.tsx       # Landing page
│   ├── Dashboard.tsx   # Staff dashboard with KPIs
│   ├── Booking.tsx     # Patient appointment booking
│   ├── Calendar.tsx    # Full calendar view
│   ├── AppointmentDetails.tsx
│   ├── WaitlistDetails.tsx
│   └── AnalyticsDetails.tsx
├── components/
│   └── ui/            # shadcn-ui components (DO NOT manually edit)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── App.tsx            # Root component with routing and providers
├── main.tsx           # Application entry point
└── index.css          # Global styles and design system
```

## Architecture

### Routing
All routes are defined in `src/App.tsx` using React Router v6. The routing structure is:
- `/` - Landing page
- `/dashboard` - Staff dashboard
- `/booking` - Patient booking interface
- `/calendar` - Full calendar view
- `/appointment/:id` - Appointment details
- `/waitlist/:id` - Waitlist entry details
- `/analytics` - Analytics dashboard

### State Management
- **TanStack Query**: Configured in App.tsx with a QueryClient. Currently pages use mock data, but the infrastructure is ready for API integration.
- **Local State**: useState for component-level state

### Path Aliases
The project uses path aliases configured in `vite.config.ts` and `components.json`:
- `@/` resolves to `./src/`
- Example: `import { Button } from "@/components/ui/button"`

### Design System
The design system is defined in `src/index.css` using HSL color values with CSS variables:
- Color palette includes: primary (teal), secondary (green), accent (coral), destructive (red)
- Supports dark mode via `.dark` class
- Custom shadow utilities: `shadow-soft`, `shadow-medium`, `shadow-strong`
- Custom animations: `animate-fade-in`, `animate-slide-in`
- Border radius controlled by `--radius` variable (default 0.75rem)

### UI Components
- All UI components are from shadcn-ui and located in `src/components/ui/`
- Components are built on top of Radix UI primitives
- To add new shadcn-ui components, use the shadcn-ui CLI (not included in this repo)
- DO NOT manually edit files in `src/components/ui/` - they are managed by shadcn-ui

## Data Architecture

Currently, all data is **mock data** stored directly in page components. The application is structured to easily integrate with a backend API:
- Dashboard KPIs, appointments, and waitlist entries are hardcoded arrays
- When implementing API integration, replace mock data with TanStack Query hooks
- Example pattern: `const { data } = useQuery({ queryKey: ['appointments'], queryFn: fetchAppointments })`

## Key Features to Understand

### Dashboard (src/pages/Dashboard.tsx)
- Three tabs: Today's Appointments, Waitlist, Analytics
- Displays KPIs: no-show rate, wait time, provider utilization, active patients
- Risk indicators for appointments (low/medium/high)
- Priority indicators for waitlist entries

### Booking Flow (src/pages/Booking.tsx)
- Multi-step form for patient appointment booking
- Department, provider, and time slot selection
- Currently uses mock data for available slots

### Calendar View (src/pages/Calendar.tsx)
- Full calendar interface for staff
- Day/week/month views expected

## Lovable Integration

This project is managed by Lovable (lovable.dev). The `lovable-tagger` plugin is enabled in development mode to support the Lovable editor integration. Commits from Lovable are automatically pushed to this repository.

## Important Patterns

### Page Components
- Each page is a default export from its file
- Pages handle their own layout (including headers/navigation)
- Pages manage their own data fetching (currently mock data)

### Styling
- Use Tailwind utility classes
- Reference design system colors via CSS variables: `bg-primary`, `text-muted-foreground`, etc.
- Use existing shadow utilities instead of arbitrary values
- Use existing animation classes for consistency

### Navigation
- Use `useNavigate()` from react-router-dom for programmatic navigation
- Use `<Link>` component from react-router-dom for declarative navigation
- Pass query parameters when navigating to detail pages
