# IMPLEMENTATION_PLAN

## Objective
Build a habit-forming drawing fundamentals app that delivers short lessons, collects sketch submissions,
and provides structured AI feedback to accelerate beginner progress.

## Key Design Decisions
- **Router**: Next.js App Router only (TanStack Router removed)
- **AI Feedback**: AI Gateway + AI SDK v6 with structured output (vision model)
- **Payments**: Stripe via Vercel Marketplace ($5/mo, $50/yr)
- **Sketch Input**: In-browser canvas + photo upload
- **Lesson Data**: Convex database with seed migration
- **Retention Milestone**: Week-1 lesson-3 completion unlocks congratulations + streak badge
- **CI/CD**: Semantic release with conventional commits from Phase 0
- **Auth**: Clerk with Convex user sync via webhook

## Phase 0 - CI/CD and Semantic Release
- Configure `.releaserc.json` with conventional commits and auto-versioning.
- Set up GitHub Actions CI pipeline (lint, typecheck, test, build on PR).
- Set up release workflow (semantic-release on push to main).
- Enable branch protection rules for main (required checks + approval).
- Remove TanStack Router dependency (cleanup).

## Phase 1 - Foundation and App Shell
- Integrate Clerk auth with sign-in/sign-up flows.
- Add route guards and Clerk middleware for protected routes.
- Sync Clerk user to Convex on sign-up via webhook.
- Define Convex schema for users, lessons, submissions, and feedback.
- Create lesson seed data migration script.
- Set up Convex client provider and TanStack Query integration.
- Build app shell layout with navigation and responsive sidebar.

## Phase 2 - Lesson Engine
- Build lesson list page with unlock status indicators.
- Implement lesson unlock rules engine (sequential + premium gating).
- Build lesson detail page with instructions and submission CTA.
- Track lesson start/completion analytics events.

## Phase 3 - Sketch Submission + AI Feedback
- Build in-browser canvas drawing component (pen, eraser, undo, touch).
- Implement photo upload path for sketch submission.
- Store sketch images in Vercel Blob and save submission record to Convex.
- Integrate AI Gateway with AI SDK v6 for structured sketch analysis.
- Build feedback display UI with scores, hints, and strengths.

## Phase 4 - Habit and Retention Loop
- Implement streak tracking and daily practice calculation.
- Build progress dashboard with lesson count and feedback trends.
- Implement week-1 lesson-3 milestone with congratulations badge.

## Phase 5 - Monetization
- Integrate Stripe via Vercel Marketplace for subscription billing.
- Implement premium content gating and entitlement checks.
- Build pricing page and billing management UI.

## Phase 6 - Hardening and Launch
- Add Jest unit tests for lesson rules, streak logic, and entitlements.
- Add Jest component tests for key UI components.
- Add Playwright e2e tests for critical user flows.
- Implement global error handling, loading states, and retry UX.
- Production readiness checklist and Vercel deployment configuration.
