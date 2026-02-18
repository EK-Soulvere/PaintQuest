-- PaintQuest Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create attempt table
CREATE TABLE IF NOT EXISTS attempt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create progress_event table
CREATE TABLE IF NOT EXISTS progress_event (
  event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempt_id UUID NOT NULL REFERENCES attempt(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB
);

-- Create attempt_entry table
CREATE TABLE IF NOT EXISTS attempt_entry (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempt(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task table
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

-- Create recommendation_config table
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

-- Create profile table
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

-- Create arsenal_item table
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

-- Create quest_attempt_template table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attempt_user_id ON attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_created_at ON attempt(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_event_attempt_id ON progress_event(attempt_id);
CREATE INDEX IF NOT EXISTS idx_progress_event_timestamp ON progress_event(timestamp);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_attempt_id ON attempt_entry(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_user_id ON attempt_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_created_at ON attempt_entry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_user_id ON task(user_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON task(status);
CREATE INDEX IF NOT EXISTS idx_task_priority ON task(priority DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_config_user_id ON recommendation_config(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON profile(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_user_id_unique ON profile(user_id);
CREATE INDEX IF NOT EXISTS idx_arsenal_item_user_id ON arsenal_item(user_id);
CREATE INDEX IF NOT EXISTS idx_arsenal_item_available ON arsenal_item(available);
CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_user_id ON quest_attempt_template(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_task_id ON quest_attempt_template(task_id);
CREATE INDEX IF NOT EXISTS idx_quest_attempt_template_energy ON quest_attempt_template(energy);

-- Enable Row Level Security
ALTER TABLE attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE task ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE arsenal_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_attempt_template ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attempt table
-- Users can only see their own attempts
CREATE POLICY "Users can view own attempts"
  ON attempt
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON attempt
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own attempts
CREATE POLICY "Users can update own attempts"
  ON attempt
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own attempts
CREATE POLICY "Users can delete own attempts"
  ON attempt
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_event table
-- Users can only see events for their own attempts
CREATE POLICY "Users can view own progress events"
  ON progress_event
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = progress_event.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only insert events for their own attempts
CREATE POLICY "Users can insert own progress events"
  ON progress_event
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = progress_event.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only update events for their own attempts
CREATE POLICY "Users can update own progress events"
  ON progress_event
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = progress_event.attempt_id
      AND attempt.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = progress_event.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only delete events for their own attempts
CREATE POLICY "Users can delete own progress events"
  ON progress_event
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = progress_event.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- RLS Policies for attempt_entry table
-- Users can only view entries for their own attempts
CREATE POLICY "Users can view own attempt entries"
  ON attempt_entry
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = attempt_entry.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only insert entries for their own attempts
CREATE POLICY "Users can insert own attempt entries"
  ON attempt_entry
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = attempt_entry.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only update entries for their own attempts
CREATE POLICY "Users can update own attempt entries"
  ON attempt_entry
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = attempt_entry.attempt_id
      AND attempt.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = attempt_entry.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- Users can only delete entries for their own attempts
CREATE POLICY "Users can delete own attempt entries"
  ON attempt_entry
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM attempt
      WHERE attempt.id = attempt_entry.attempt_id
      AND attempt.user_id = auth.uid()
    )
  );

-- RLS Policies for task table
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

-- RLS Policies for recommendation_config table
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

-- RLS Policies for profile table
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

-- RLS Policies for arsenal_item table
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

-- RLS Policies for quest_attempt_template table
CREATE POLICY "Users can view own quest attempt templates"
  ON quest_attempt_template
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest attempt templates"
  ON quest_attempt_template
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest attempt templates"
  ON quest_attempt_template
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quest attempt templates"
  ON quest_attempt_template
  FOR DELETE
  USING (auth.uid() = user_id);
