Milestone Plan
Milestone 3 — Planning Spine (Tasks + Recommendations v1)

Outcome: You can build a backlog and get 5 deterministic recommendations for “what to work on next,” filtered by time + skills + stale boost + recency.

Scope

Create Tasks (Backlog items)

User can create/edit/archive tasks

Task fields (v1 minimal but sufficient for scoring):

title

game (optional text)

mfg (optional text)

estimated_minutes (or min/max)

priority (1–5 or 1–100)

required_tools_tags (jsonb/text[])

skills_tags (jsonb/text[])

status (backlog|active|done|someday|archived)

Task → Quest

If user starts, it creates a Quest (attempt) with task_id

Opens quest detail; user confirms “Start”

Deterministic recommender (no LLM required)

Input: available_minutes (bucketed)

Score using:

priority

time fit (“close enough”)

skill match (based on profile focus skills)

stale backlog boost (not attempted recently)

recency penalty (avoid repeating very recent quests)

Output: top 5 with reason breakdown

Deliverables

/tasks page: list + create + edit

/plan or home “Quick Start” panel: choose time bucket → show 5 recs

Task detail page: show metadata + “Start quest”

SQL migrations + RLS for tasks

Unit-tested scoring function (pure deterministic)

Learning / discipline

Treat “recommended” as a function: recommend(user, availableMinutes) -> ranked tasks with reasons

Log the scoring breakdown (even to console) so you can debug “why did it recommend this?”

Milestone 4 — Profile + Arsenal v1 (Constraints & Materials)

Outcome: Recommendations become personal and reliable; profile and arsenal are shallow but useful.

Scope

Profile

media (set of tags)

focus_skills_top3

focus_skills_bottom3

default_time_bucket

constraints (jsonb)

energy_preference (low/med/high)

Arsenal v1 (shallow, tag-based)

User can define available tools/paints/brush types as tags

Keep it intentionally light:

category: paint/tool/brush/other

name

tags (jsonb/text[])

available boolean

Recommendation incorporates arsenal + constraints

If task requires “drybrush” and arsenal doesn’t have it → penalty or hide

Constraints can exclude (e.g., “no airbrush at desk”)

Deliverables

/profile page

/arsenal page

Update recommender to use:

profile skill preference weighting

arsenal tag availability matching

energy preference weighting (optional v1: low energy prefers shorter, simpler tasks)

Learning / discipline

Constraints are truth. Don’t let LLM invent them.

Use tags to avoid “inventory spreadsheet hell.”

Milestone 5 — Workflow Tool Mode (Session UX + Progress Clarity)

Outcome: The app feels like a “tool during painting,” not a planner dashboard.

Scope

Home routing behavior

If there is an “active quest” (non-terminal) → land on it

Else show quick start recommender (default time bucket + 5 recs)

Quest page becomes a session cockpit

Minimal actions:

Start (if not started)

Add progress entry (note + structured fields)

Complete

Abandon

Recommended next action is derived from FSM

Progress review

Review view shows:

Completed quests this week

List of completed quests

Keep it minimal: your progress metric is “completed quests”

Deliverables

Home flow

Quest “cockpit” UI improvements (still light)

Review page with “this week completed count” (derived)

Learning / discipline

Resist adding more states. You already chose “completed/abandoned.” Great.

Progress clarity beats feature breadth.

Event taxonomy updates (aligned to your answers)

Keep it tight:

QUEST_CREATED (optional; you currently auto-start on create)

QUEST_STARTED

QUEST_PROGRESS_RECORDED (this is your “entry” as truth)

QUEST_COMPLETED

QUEST_ABANDONED

Payload contract suggestion for QUEST_PROGRESS_RECORDED:

{
  "entry_type": "note|check|metric|step",
  "fields": { "..." : "..." },
  "note": "free text",
  "energy": "low|med|high"   // optional capture
}


This keeps “entries as truth” without making your FSM weird.

How this maps to your current DB (minimal disruption)

Current tables:

attempt (Quest)

progress_event (events)

attempt_entry (entries)

Recommended near-term approach (least refactor):

Keep attempt_entry for UI storage and filtering

Add trigger: on insert into attempt_entry, also insert progress_event with event_type = QUEST_PROGRESS_RECORDED and payload containing the entry.

FSM derivation uses progress_event only.

Later, you can delete attempt_entry and make entries purely events.

That preserves your existing UI while enforcing “one canonical timeline.”

Milestone specs you can paste into docs (copy/paste)
Milestone 3 Definition of Done

User can CRUD Tasks (backlog)

User can view 5 recommended tasks for a chosen time bucket

Recommendations are deterministic and show reasons

User can start a quest from a task (creates attempt with task_id)

RLS: tasks isolated by user_id

Milestone 4 Definition of Done

User can edit Profile (media, skills, default bucket, constraints, energy pref)

User can manage Arsenal tags/items

Recommendation scoring uses profile + arsenal

Milestone 5 Definition of Done

Home routes to active quest else quick start

Quest detail supports quick progress capture + complete/abandon

Review page shows completed quests this week + list