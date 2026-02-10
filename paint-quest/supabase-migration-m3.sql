-- PaintQuest Milestone 3 Migration

-- Tasks table
CREATE TABLE IF NOT EXISTS task (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  game TEXT,
  mfg TEXT,
  estimated_minutes_min INT,
  estimated_minutes_max INT,
  priority INT NOT NULL DEFAULT 3,
  required_tools_tags JSONB,
  skills_tags JSONB,
  status TEXT NOT NULL DEFAULT 'backlog',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON task(status);
CREATE INDEX IF NOT EXISTS idx_task_priority ON task(priority DESC);

ALTER TABLE task ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON task
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON task
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON task
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON task
  FOR DELETE
  USING (auth.uid() = user_id);

-- Recommendation config table
CREATE TABLE IF NOT EXISTS recommendation_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_priority NUMERIC NOT NULL DEFAULT 1.0,
  weight_time_fit NUMERIC NOT NULL DEFAULT 1.0,
  weight_skill_match NUMERIC NOT NULL DEFAULT 1.0,
  weight_stale NUMERIC NOT NULL DEFAULT 1.0,
  weight_recency_penalty NUMERIC NOT NULL DEFAULT 1.0,
  stale_days_threshold INT NOT NULL DEFAULT 14,
  recent_days_threshold INT NOT NULL DEFAULT 3,
  focus_skills JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_config_user_id ON recommendation_config(user_id);

ALTER TABLE recommendation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendation configs"
  ON recommendation_config
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendation configs"
  ON recommendation_config
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendation configs"
  ON recommendation_config
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendation configs"
  ON recommendation_config
  FOR DELETE
  USING (auth.uid() = user_id);
