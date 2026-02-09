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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attempt_user_id ON attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_created_at ON attempt(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_event_attempt_id ON progress_event(attempt_id);
CREATE INDEX IF NOT EXISTS idx_progress_event_timestamp ON progress_event(timestamp);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_attempt_id ON attempt_entry(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_user_id ON attempt_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_created_at ON attempt_entry(created_at DESC);

-- Enable Row Level Security
ALTER TABLE attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_entry ENABLE ROW LEVEL SECURITY;

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
