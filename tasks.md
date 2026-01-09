# BetPro VPS Migration Tasks

## Phase 1: Backend Setup
- [x] Create Express server with basic structure
- [x] Setup PostgreSQL connection (pg driver)
- [x] Implement JWT auth (login, logout, token refresh)
- [x] Password hashing with bcrypt

## Phase 2: API Endpoints
- [x] Auth routes (login, logout, session validation)
- [x] User/profile CRUD
- [x] Bets management (place, history)
- [x] Withdrawals
- [x] RBAC admin operations
- [x] Presence tracking

## Phase 3: Realtime
- [x] Setup ws WebSocket server
- [x] Profile change notifications
- [x] Password change broadcasts
- [x] Presence heartbeat

## Phase 4: Frontend Migration
- [x] Replace supabaseClient.js with API client
- [x] Update AuthContext.jsx for JWT auth
- [x] Update presenceService.js for REST API
- [x] Replace all supabase.from() calls with REST

## Phase 5: Database
- [x] Export Supabase schema
- [x] Create PostgreSQL schema for VPS
- [x] Setup PostgreSQL on VPS
- [x] Run migrations
- [x] Migrate data (Supabase was empty - no data to migrate)

## Phase 6: Deployment
- [x] Nginx reverse proxy config
- [x] PM2 process management
- [x] SSL certificates (Let's Encrypt)
- [x] Environment variables
- [x] Deployment script
