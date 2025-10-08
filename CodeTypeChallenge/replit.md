# Replit.md

## Overview

CodeType Pro is a full-stack typing speed training application specifically designed for programmers. Users practice typing with real code snippets from popular programming languages, track their progress through detailed statistics, compete on leaderboards, and unlock achievements. The application features Replit's OAuth authentication system and provides a gamified learning experience with a modern gaming-inspired UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming-themed color variables
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Component Structure**: Modular component architecture with reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Error Handling**: Centralized error handling middleware

### Database Architecture
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with Zod schema validation
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- **Provider**: Replit OAuth integration using OpenID Connect
- **Strategy**: Passport.js with custom OpenID strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/updates on authentication

### Typing Test Engine
- **Code Snippets**: Multi-language code samples with difficulty levels
- **Real-time Tracking**: WPM, accuracy, and error tracking during typing
- **Performance Metrics**: Comprehensive statistics including time spent and character-level accuracy
- **Test Results**: Persistent storage of all test attempts with historical data

### Gamification Features
- **Achievements System**: Unlockable achievements based on performance milestones
- **Leaderboards**: Global rankings by WPM and accuracy
- **Language Proficiency**: Per-language skill tracking and progression
- **User Statistics**: Comprehensive analytics including averages and progress trends

### UI/UX Design
- **Theme**: Gaming-inspired dark theme with neon accents (cyan, pink, blue)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animations**: Smooth transitions and hover effects for enhanced UX
- **Component Library**: Consistent design system using Shadcn/ui components

## Data Flow

### Authentication Flow
1. User clicks login → redirects to Replit OAuth
2. Successful authentication → creates/updates user in database
3. Session established with PostgreSQL storage
4. Frontend receives user data via `/api/auth/user` endpoint

### Typing Test Flow
1. User selects language → fetches random code snippet
2. Typing interface tracks keystrokes in real-time
3. Calculates WPM, accuracy, and errors dynamically
4. On completion → saves test results to database
5. Updates user statistics and checks for new achievements
6. Displays results modal with performance breakdown

### Data Synchronization
- **Client State**: TanStack Query manages server state caching
- **Real-time Updates**: Query invalidation for fresh data after actions
- **Optimistic Updates**: Immediate UI feedback with server synchronization

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **Authentication**: openid-client and passport for OAuth
- **UI Components**: @radix-ui component primitives
- **State Management**: @tanstack/react-query
- **Styling**: tailwindcss with class-variance-authority

### Development Tools
- **Build Tool**: Vite with React plugin
- **TypeScript**: Full type safety across frontend and backend
- **Code Quality**: ESLint and TypeScript compiler checks
- **Development**: Hot reload with Vite dev server

### Replit Integration
- **Runtime Error Modal**: @replit/vite-plugin-runtime-error-modal
- **Cartographer**: @replit/vite-plugin-cartographer for development
- **Environment**: REPL_ID detection for development features

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Type Checking**: TypeScript compilation verification
- **Database**: Drizzle Kit pushes schema changes

### Production Setup
- **Server**: Express serves both API and static files
- **Database**: PostgreSQL with connection pooling for scalability
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, OAuth configuration
- **Static Assets**: Vite build output served by Express in production

### Development Environment
- **Hot Reload**: Vite dev server with Express proxy
- **Database**: Local or cloud PostgreSQL instance
- **Authentication**: Replit OAuth with localhost callback
- **Debugging**: Source maps and error overlays enabled