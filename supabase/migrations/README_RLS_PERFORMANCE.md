# RLS Performance Optimization Migration

## Issue
Supabase detected that the Row Level Security (RLS) policies for the `poles` table (and other tables) were using `auth.uid()` directly, which causes the function to be re-evaluated for each row. This creates suboptimal query performance at scale.

## Solution
Migration `008_fix_rls_performance.sql` fixes this by wrapping all `auth.uid()` calls in a subquery: `(SELECT auth.uid())`. This ensures the function is evaluated only once per query instead of once per row.

## Tables Affected
- `poles`
- `user_profiles`
- `pole_requests`
- `saved_searches`

## How to Apply

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `008_fix_rls_performance.sql`
4. Run the migration

### Option 2: Via Supabase CLI
```bash
supabase migration up
```

## Performance Impact
This optimization will significantly improve query performance, especially for:
- Large datasets
- Queries that scan many rows
- Users with many poles in the system

## Verification
After applying the migration, you can verify the policies are optimized by checking that all RLS policies use `(SELECT auth.uid())` instead of `auth.uid()` directly.

## Rollback
If needed, the previous policies can be restored by running the SQL from `006_restore_correct_policies.sql`, though this will reintroduce the performance issue.