-- PaintQuest Milestone 4 Migration

-- Profile table
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media JSONB,
  focus_skills_top3 JSONB,
  focus_skills_bottom3 JSONB,
  default_time_bucket INT,
  constraints JSONB,
  energy_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_user_id ON profile(user_id);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profile
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON profile
  FOR DELETE
  USING (auth.uid() = user_id);

-- Arsenal items table
CREATE TABLE IF NOT EXISTS arsenal_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  tags JSONB,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arsenal_item_user_id ON arsenal_item(user_id);
CREATE INDEX IF NOT EXISTS idx_arsenal_item_available ON arsenal_item(available);

ALTER TABLE arsenal_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own arsenal items"
  ON arsenal_item
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own arsenal items"
  ON arsenal_item
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own arsenal items"
  ON arsenal_item
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own arsenal items"
  ON arsenal_item
  FOR DELETE
  USING (auth.uid() = user_id);
