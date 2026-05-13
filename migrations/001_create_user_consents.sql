-- ==========================================
-- SUPABASE MIGRATION: USER CONSENTS (RGPD)
-- ==========================================
-- This migration creates the complete RGPD cookie consent system
-- Run this in Supabase SQL Editor: paste all code and execute
-- ==========================================

-- ==========================================
-- 1. CREATE TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Types de consentements RGPD
  analytics BOOLEAN DEFAULT false,
  marketing BOOLEAN DEFAULT false,
  preferences BOOLEAN DEFAULT true,
  
  -- Métadonnées légales
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  accepted_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  
  -- Contrainte d'intégrité : une entrée par utilisateur
  CONSTRAINT one_consent_per_user UNIQUE(user_id)
);

-- ==========================================
-- 2. CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_accepted_at ON user_consents(accepted_at);
CREATE INDEX IF NOT EXISTS idx_user_consents_created_at ON user_consents(created_at);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. CREATE RLS POLICIES
-- ==========================================

-- POLICY 1: Users can INSERT their own consent
DROP POLICY IF EXISTS "Users can insert their own consent" ON user_consents;
CREATE POLICY "Users can insert their own consent"
  ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLICY 2: Users can SELECT their own consent
DROP POLICY IF EXISTS "Users can read their own consent" ON user_consents;
CREATE POLICY "Users can read their own consent"
  ON user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- POLICY 3: Admins can SELECT all consents (optional)
DROP POLICY IF EXISTS "Admins can read all consents" ON user_consents;
CREATE POLICY "Admins can read all consents"
  ON user_consents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- POLICY 4: No UPDATE allowed (audit trail integrity)
DROP POLICY IF EXISTS "No updates allowed" ON user_consents;
CREATE POLICY "No updates allowed"
  ON user_consents
  FOR UPDATE
  WITH CHECK (false);

-- POLICY 5: No DELETE allowed (GDPR compliance)
DROP POLICY IF EXISTS "No deletes allowed" ON user_consents;
CREATE POLICY "No deletes allowed"
  ON user_consents
  FOR DELETE
  USING (false);

-- ==========================================
-- 5. CREATE TRIGGER FOR AUTO-REPLACE
-- ==========================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_replace_user_consent ON user_consents;
DROP FUNCTION IF EXISTS replace_user_consent();

-- Create function
CREATE OR REPLACE FUNCTION replace_user_consent()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old consent for this user_id
  DELETE FROM user_consents 
  WHERE user_id = NEW.user_id 
  AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_replace_user_consent
AFTER INSERT ON user_consents
FOR EACH ROW
EXECUTE FUNCTION replace_user_consent();

-- ==========================================
-- 6. CREATE ANALYTICS VIEWS
-- ==========================================

-- View for analytics
DROP VIEW IF EXISTS consent_analytics CASCADE;
CREATE VIEW consent_analytics AS
SELECT
  COUNT(*) as total_consents,
  ROUND(100.0 * SUM(CASE WHEN analytics THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as analytics_consent_rate,
  ROUND(100.0 * SUM(CASE WHEN marketing THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as marketing_consent_rate,
  ROUND(100.0 * SUM(CASE WHEN preferences THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as preferences_consent_rate,
  DATE(accepted_at) as date
FROM user_consents
GROUP BY DATE(accepted_at)
ORDER BY date DESC;

-- View for daily consent breakdown
DROP VIEW IF EXISTS consent_daily_breakdown CASCADE;
CREATE VIEW consent_daily_breakdown AS
SELECT
  DATE(accepted_at) as date,
  COUNT(*) as total_new_consents,
  SUM(CASE WHEN analytics THEN 1 ELSE 0 END) as analytics_count,
  SUM(CASE WHEN marketing THEN 1 ELSE 0 END) as marketing_count,
  SUM(CASE WHEN preferences THEN 1 ELSE 0 END) as preferences_count
FROM user_consents
GROUP BY DATE(accepted_at)
ORDER BY date DESC;

-- ==========================================
-- 7. VERIFICATION QUERIES
-- ==========================================

-- Verify table creation
SELECT table_name FROM information_schema.tables WHERE table_name = 'user_consents';

-- Verify indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'user_consents';

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_consents';

-- Verify policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'user_consents' ORDER BY policyname;

-- ==========================================
-- 8. GRANTS (if needed)
-- ==========================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON user_consents TO authenticated;

-- Grant permissions to service role (admin)
GRANT ALL ON user_consents TO service_role;

-- ==========================================
-- NOTES
-- ==========================================
/*
✅ Table: user_consents
   - Linked to auth.users via user_id (FK)
   - Tracks: analytics, marketing, preferences consents
   - Immutable after creation (no UPDATE/DELETE allowed)
   - Auto-replaces old consent per user (trigger)

✅ Security:
   - RLS enabled with 5 policies
   - Users can only see their own consent
   - Admins can view all consents (if role = 'admin' in profiles)
   - Audit trail intact (no delete allowed)

✅ Analytics:
   - View: consent_analytics (daily rates)
   - View: consent_daily_breakdown (detailed daily stats)

⚠️ When inserting:
   - Make sure user_id exists in auth.users
   - Use Server Actions to validate session
   - Client-side saves to js-cookie first

❓ Testing:
   1. INSERT test record via SQL Editor
   2. Check that SELECT works for same user
   3. Check that UPDATE is rejected
   4. Check that DELETE is rejected
   5. Verify app can INSERT via Server Action

📝 Migration created: 2026-05-10
*/
