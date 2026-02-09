-- PaintQuest Milestone 2 Migration
-- Run this only if Milestone 1 schema already exists.

-- Add task_id to attempt (nullable)
ALTER TABLE attempt
ADD COLUMN IF NOT EXISTS task_id TEXT;

-- Convert progress_event.payload to jsonb
ALTER TABLE progress_event
ALTER COLUMN payload TYPE JSONB
USING (
  CASE
    WHEN payload IS NULL THEN NULL
    ELSE payload::jsonb
  END
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempt_entry_attempt_id ON attempt_entry(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_user_id ON attempt_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_attempt_entry_created_at ON attempt_entry(created_at DESC);

-- Enable RLS
ALTER TABLE attempt_entry ENABLE ROW LEVEL SECURITY;

-- Policies for attempt_entry (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attempt_entry'
      AND policyname = 'Users can view own attempt entries'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attempt_entry'
      AND policyname = 'Users can insert own attempt entries'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attempt_entry'
      AND policyname = 'Users can update own attempt entries'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'attempt_entry'
      AND policyname = 'Users can delete own attempt entries'
  ) THEN
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
  END IF;
END $$;
