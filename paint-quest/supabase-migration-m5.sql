-- PaintQuest Milestone 5+ Migration: quest attempt templates

CREATE TABLE IF NOT EXISTS quest_attempt_template (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES task(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes_min INT NOT NULL,
  estimated_minutes_max INT NOT NULL,
  energy TEXT NOT NULL CHECK (energy IN ('low', 'med', 'high')),
  required_tools_tags JSONB,
  focus_skills_tags JSONB,
  progress_value TEXT,
  is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_user_id ON quest_attempt_template(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_task_id ON quest_attempt_template(task_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_energy ON quest_attempt_template(energy);

ALTER TABLE quest_attempt_template ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quest_attempt_template'
      AND policyname = 'Users can view own quest attempt templates'
  ) THEN
    CREATE POLICY "Users can view own quest attempt templates"
      ON quest_attempt_template
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quest_attempt_template'
      AND policyname = 'Users can insert own quest attempt templates'
  ) THEN
    CREATE POLICY "Users can insert own quest attempt templates"
      ON quest_attempt_template
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quest_attempt_template'
      AND policyname = 'Users can update own quest attempt templates'
  ) THEN
    CREATE POLICY "Users can update own quest attempt templates"
      ON quest_attempt_template
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quest_attempt_template'
      AND policyname = 'Users can delete own quest attempt templates'
  ) THEN
    CREATE POLICY "Users can delete own quest attempt templates"
      ON quest_attempt_template
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
