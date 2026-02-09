# Paint Quest — Product Contract

## Purpose
A lightweight, session-friendly workflow tool for painters.
The product exists to reduce friction between intent and action during a painting session.

## Primary user
A painter at a desk who wants fast logging, structured progression, and minimal UI overhead.

## Core loop (v1)
1) Start session
2) Capture entries quickly (notes/checks/timers)
3) End session
4) Review session summary

## Non-goals (v1)
- No app stores, no offline-first, no complex collaboration
- No heavy media pipeline
- No “perfect taxonomy” of painting concepts

## Success criteria (v1)
- From cold load to “first entry captured” in under 30 seconds
- Sessions feel effortless: low clicks, low typing
- Data integrity: user only sees their own data

## Key constraints
- Supabase is the source of truth (auth + db)
- Webapp only (desktop-first)
- UI uses palette variables + chosen Google font
