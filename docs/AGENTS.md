# DukaanOS Multi-Agent Architecture

DukaanOS implements a heterogeneous multi-agent architecture inspired by modern agent orchestrators. It separates cognitive load across specialized agents rather than relying on one monolithic LLM prompt.

## 1. Central Router Agent
**Model:** Claude 3.5 Haiku
**Purpose:** Triage and intent classification. Fast, cheap, and strictly parses the user query to decide which downstream specialist should handle the task.
**Contract:** Outputs strict JSON identifying intent, confidence, and target agent.

## 2. Memory Agent
**Model:** Claude 3.5 Sonnet
**Purpose:** General business memory retrieval. Scans invoices, documents, and historical events.
**Rules:** 
- MUST ONLY use provided context.
- MUST cite evidence via ID.
- Differentiates `FACT`, `INFERENCE`, and `MISSING_DATA`.

## 3. Supplier Agent
**Model:** Claude 3.5 Sonnet
**Purpose:** Analyzes supplier data, specifically pricing trends and supply chain edge cases.
**Rules:**
- Handles mathematical delta calculation for price changes.
- Can propose `SUPPLIER_FOLLOWUP` actions (e.g., draft email for a price inquiry).

## 4. Warranty Agent (Phase 3 Extension)
**Model:** Claude 3.5 Haiku / Sonnet
**Purpose:** Tracks product serials, warranty durations, and expiry dates.
**Rules:**
- Automatically links to `SERVICE_CASE` entities.
- Generates proactive `WARRANTY_EXPIRY` alerts.

## 5. Anomaly Agent (Phase 4 Extension)
**Model:** Claude 3.5 Sonnet
**Purpose:** Operates in the background (asynchronous) scanning newly processed documents for conflicts (e.g., duplicate invoices, massive price shifts, data corruption).

## Agent Communication (Contracts)
Agents communicate via Zod-validated JSON contracts to prevent hallucinated structures from breaking the app. See `packages/shared/src/types.ts` for `AgentResponse`.
