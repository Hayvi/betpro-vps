# Database Refactor Coverage Analysis

## Overview
Analysis of database schema migration from original Supabase-based betpro to standalone betpro-vps PostgreSQL implementation.

## Coverage Status: **INCOMPLETE (~70%)**

### ✅ COVERED TABLES

#### 1. **profiles**
- **Status**: ✅ Fully covered with minor differences
- **Original**: References `auth.users(id)` (Supabase Auth)
- **Refactor**: Uses UUID primary keys with `password_hash` field
- **Differences**: Authentication method changed from Supabase Auth to JWT

#### 2. **transactions** 
- **Status**: ✅ Covered but simplified
- **Original**: Immutable with triggers preventing UPDATE/DELETE
- **Refactor**: Mutable, no immutability constraints
- **Differences**: Simplified type constraints, removed immutability

#### 3. **presence_sessions**
- **Status**: ✅ Fully covered
- **Original**: GPS/GeoIP tracking with Supabase integration
- **Refactor**: Same structure, different backend integration

#### 4. **presence_history**
- **Status**: ✅ Fully covered
- **Original**: Archived presence sessions
- **Refactor**: Same functionality maintained

### ❌ MISSING TABLES

#### 1. **withdrawal_requests**
- **Status**: ❌ **MISSING from original**
- **Issue**: Original uses transaction status field, refactor uses separate table
- **Impact**: Different withdrawal approval workflow

### 🆕 NEW TABLES (Not in Original)

#### 1. **bet_slips**
- **Status**: 🆕 Added in refactor
- **Purpose**: Betting functionality (not present in original)
- **Fields**: user_id, total_stake, accumulator_odds, potential_win, status

#### 2. **bets**
- **Status**: 🆕 Added in refactor  
- **Purpose**: Individual bet tracking (not present in original)
- **Fields**: user_id, match_id, bet_type, odds, stake, status

## Key Architectural Differences

### Authentication System
- **Original**: Supabase Auth with `auth.users` references
- **Refactor**: Custom JWT with `password_hash` in profiles table

### Security Model
- **Original**: Database-level Row Level Security (RLS) policies
- **Refactor**: Application-level security (no RLS)

### Withdrawal System
- **Original**: Uses transaction table with status field
- **Refactor**: Separate `withdrawal_requests` table

### Betting System
- **Original**: No betting tables (removed in migration 20260102000000)
- **Refactor**: Full betting system with `bet_slips` and `bets` tables

## Missing Backend Infrastructure

### Supabase Edge Functions (Not Ported)
1. **geoip** - Location services functionality
2. **create-managed-user** - User creation functionality

### Database Migrations (Not Ported)
1. RBAC system setup with RLS policies
2. Withdrawal approval system via transaction status
3. Performance indexes for 5k+ users
4. User password change functionality
5. Presence tracking retention policies

## Critical Issues

1. **Withdrawal Workflow Mismatch**: Different implementation approaches
2. **Security Model Change**: RLS → Application security
3. **Authentication Integration**: Supabase Auth → Custom JWT
4. **Betting System Addition**: New functionality not in original

## Recommendations

1. **Align withdrawal system** with original transaction-based approach
2. **Review security implications** of removing RLS policies
3. **Document betting system** as new feature addition
4. **Consider porting** critical RPC functions to application layer

---
*Generated: 2026-01-11*
