-- ==================================================
-- GAMIFICATION DATABASE SCHEMA EXTENSIONS
-- Extends the main database with gamification features
-- ==================================================

-- User Achievements Tracking
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'milestone', 'streak', 'learning', 'premium'
  achievement_id TEXT NOT NULL,   -- 'first_steps', 'consistent_tracker', etc.
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- User Statistics & Streaks
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL, -- 'transaction_streak', 'budget_streak', 'goal_streak', 'login_streak'
  stat_value DECIMAL(12,2) DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  best_streak INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, stat_type)
);

-- Gamification Events Log
CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'transaction_logged', 'budget_created', 'goal_achieved', etc.
  trigger_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenges (for future phases)
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'weekly', 'monthly', 'seasonal'
  status TEXT CHECK (status IN ('active', 'completed', 'failed', 'paused')) DEFAULT 'active',
  progress DECIMAL(5,2) DEFAULT 0, -- percentage 0-100
  target_value DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_type ON user_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_gamification_events_user_id ON gamification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_type ON gamification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own gamification data
CREATE POLICY "Users can manage own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own stats" ON user_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own gamification events" ON gamification_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenges" ON user_challenges
  FOR ALL USING (auth.uid() = user_id);

-- ==================================================
-- FUNCTIONS & TRIGGERS
-- ==================================================

-- Function to update streak statistics
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_stat_type TEXT,
  p_increment_by INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_streak INTEGER;
  best_streak INTEGER;
BEGIN
  -- Insert or update the streak
  INSERT INTO user_stats (user_id, stat_type, streak_count, last_updated)
  VALUES (p_user_id, p_stat_type, p_increment_by, NOW())
  ON CONFLICT (user_id, stat_type)
  DO UPDATE SET
    streak_count = CASE 
      WHEN user_stats.last_updated::DATE = CURRENT_DATE - INTERVAL '1 day' OR 
           user_stats.last_updated::DATE = CURRENT_DATE THEN 
        user_stats.streak_count + p_increment_by
      ELSE 
        p_increment_by -- Reset if more than 1 day gap
    END,
    last_updated = NOW(),
    best_streak = GREATEST(
      user_stats.best_streak,
      CASE 
        WHEN user_stats.last_updated::DATE = CURRENT_DATE - INTERVAL '1 day' OR 
             user_stats.last_updated::DATE = CURRENT_DATE THEN 
          user_stats.streak_count + p_increment_by
        ELSE 
          p_increment_by
      END
    );
END;
$$;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievement(
  p_user_id UUID,
  p_achievement_id TEXT,
  p_achievement_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_exists BOOLEAN;
BEGIN
  -- Check if achievement already exists
  SELECT EXISTS(
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO achievement_exists;
  
  -- If doesn't exist, award it
  IF NOT achievement_exists THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_id, metadata)
    VALUES (p_user_id, p_achievement_type, p_achievement_id, p_metadata);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to log gamification events
CREATE OR REPLACE FUNCTION log_gamification_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_trigger_data JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO gamification_events (user_id, event_type, trigger_data)
  VALUES (p_user_id, p_event_type, p_trigger_data);
END;
$$;