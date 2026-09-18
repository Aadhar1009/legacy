# DukaanOS 2.0 — Current State Audit

## Overview
This document serves as the ground-truth audit of the DukaanOS codebase prior to commencing the DukaanOS 2.0 hardening sprint. It maps exactly what exists, what is stubbed, and what is missing based on the actual repository state.

## 1. What Exists & Actually Works
* **Monorepo Setup:** Turborepo is properly configured with 4 packages (`api`, `infra`, `shared`, `web`).
* **AWS CDK Infrastructure:** `stateful-stack.ts`, `processing-stack.ts`, and `api-stack.ts` exist and correctly provision DynamoDB (Single Table), Cognito, S3, API Gateway, and Step Functions. 
* **Data Model Base:** The `PK/SK`, `GSI1`, and `GSI2` access patterns are physically present in CDK and properly wrapped in the `api` package (`db/operations.ts`).
* **Agent Foundations:** The Bedrock Converse API is successfully wired. A `Router` agent parses intents via Claude Haiku and passes them to the `Memory` and `Supplier` agents (Claude Sonnet). Zod schemas are defined in `shared/types.ts`.
* **Frontend Shell:** The Next.js app has a polished B2B Tailwind/Radix layout (`Sidebar`, `AppShell`, `ConfidenceBadge`, `EvidenceCard`).

## 2. What is Mocked / Stubbed
* **Document Processing:** The `extractAndEnrich` Lambda calls Textract and Bedrock synchronously, but error handling and idempotency are minimal.
* **UI Interactions:** The `/memory` search page uses a hardcoded `setTimeout` and a static mock response rather than actually hitting the `/api/v1/memory` route.
* **Graph Relations:** The adjacency list exists in the backend types, but there is no D3.js visualization or robust frontend graph UI.

## 3. What is Incomplete
* **Memory Evolution Engine:** History is currently implicit. The robust `MemoryEvent` model (old fact + new fact + source) is not actively tracking changes.
* **Change Intelligence:** The `AnomalyAgent` exists but is not wired up to a scheduled `EventBridge` cron job.
* **Action Verification:** The task queue exists in the API, but there is no `ActionVerifier` to prevent the AI from marking its own actions as complete.
* **Entity Resolution:** Currently, any new supplier name creates a completely new entity. No fuzzy matching exists.

## 4. Architectural & Security Risks
* **Security - Document Injection:** Raw document text is extracted and passed to the LLM without strict XML-style boundary guardrails, risking prompt injection.
* **Security - Magic Bytes:** Uploads rely purely on S3/API extensions, lacking binary magic-byte inspection.
* **Architecture - Synchronous Bottlenecks:** The Step Function waits synchronously on Textract/Bedrock. A 15-minute Lambda limit is fine for now, but large PDFs could cause timeouts.
* **Architecture - Agent Routing:** The Router agent currently only routes to `memory` and `supplier`. It is missing the policy-gated routing (DETECTOR, WRITER, REVIEWER).

## 5. Test Gaps
* **Critical Missing Layer:** While `golden_dataset.json` exists, there are **0** actual automated tests (no Vitest, no Playwright, no AI Evaluation framework). This is the biggest gap preventing it from being a "production-shaped" system.

## 6. Opportunities for Improvement (The Path to DukaanOS 2.0)
* **Depth over Breadth:** Instead of building more UI pages, we will wire up the **Evidence Ledger** and **Memory Evolution** pipeline perfectly. 
* **Read-After-Write Verification:** Adding the independent ActionVerifier pattern inspired by LORE and DocSync.
* **Eval Harness:** Building `scripts/evaluate-agents.ts` to actually run the 50 questions against Bedrock and generate a real `EVALUATION.md` report.
