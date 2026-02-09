# Capabilities

## Identity & Access
- Sign in / sign up
- Sign out
- User can only access own data

## Core Loop
Capability: Create attempts
Description: System can create a new attempt as a commitment to action
Depends on: Attempt
Notes: An attempt must not exist without an initiating event or explicit intent

Capability: Record progress events
Description: System can append progress events to an attempt
Depends on: Attempt, ProgressEvents
Notes: Events are append-only; no mutation or deletion

Capability: Derive current state
Description: System can derive current state
Depends on: Attempt, ProgressEvents, FSM
Notes: Derivation is purely mechanical; explanation is a separate capability

Capability: Prevent invalid actions
Description: System can prevent invalid actions
Depends on: Attempt, ProgressEvents, FSM
Notes: Invalid actions must be rejected, not ignored. Invalid actions must fail loudly and explain why.

Capability: Recommend a next action
Description: System can recommend a next action
Depends on: Attempt, ProgressEvents, FSM
Notes: In v1–v3, recommendation is the next valid FSM transition; later versions may rank or filter valid transitions.

## v1 — Truth & Trust
“The system never lies, and it can explain itself.”
Capabilities:
Create attempts
Record progress events
Validate progress sequences
Prevent invalid actions
Explain attempt state
This gives you:
A working product loop
High trust
Low surface area

## v2 — Understanding Over Time
“The system helps users understand what happened.”
Capabilities:
Derive current state
Explain state transitions
Surface history meaningfully
This is where PaintQuest becomes valuable, not just correct.

## v3 — Guidance & Growth
“The system helps users decide what to do next.”
Capabilities:
Recommend a next action
Compare attempts over time
This is where AI naturally plugs in later.
