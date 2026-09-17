# Architecture Decision Records

## ADR-001: Why Serverless AWS Architecture

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** The hackathon requires building on AWS. We need an architecture that is cost-effective at zero/low scale, can handle bursty document processing workloads, and demonstrates genuine AWS integration.

**Decision:** Use a fully serverless architecture: Lambda for compute, DynamoDB for storage, S3 for files, EventBridge for events, Step Functions for orchestration.

**Consequences:**
- Near-zero idle cost (~$0/month when not in use)
- Pay-per-request scaling
- No server management
- Cold start latency on Lambda (mitigated by ARM64 + small bundle sizes)
- 15-minute Lambda execution limit (sufficient for our workloads)

---

## ADR-002: Why DynamoDB (Single Table Design)

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** We need a database that supports our knowledge graph (entities + relationships), temporal queries, multi-tenancy, and has zero idle cost.

**Decision:** Use DynamoDB with single-table design and adjacency list pattern for the knowledge graph. PK = `TENANT#<id>` ensures tenant isolation at the partition key level.

**Alternatives Considered:**
- **Neptune (Graph DB):** Purpose-built for graphs, but expensive (~$0.35/hr minimum = ~$250/month idle) and overkill for hackathon scale.
- **PostgreSQL (RDS):** Strong relational model, but requires always-on instances (~$15-50/month minimum).
- **Aurora Serverless v2:** Good compromise but still has minimum capacity charges.

**Consequences:**
- Zero idle cost (on-demand billing)
- Tenant isolation via partition key
- No complex JOINs — we denormalize and use GSIs
- Adjacency list pattern handles graph traversals
- Single-digit millisecond reads

---

## ADR-003: Why Event-Driven Processing

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Document processing involves multiple stages (upload → validate → OCR → extract → enrich → store) that can fail independently and need retry logic.

**Decision:** Use S3 EventBridge notifications → Step Functions for the processing pipeline.

**Consequences:**
- Each stage can be retried independently
- Visible execution history in Step Functions console
- Dead-letter queue for persistent failures
- Idempotent operations prevent duplicate processing
- Asynchronous — user doesn't wait for full pipeline

---

## ADR-004: Why Amazon Bedrock (Claude Models)

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** We need LLM capabilities for intent classification, entity extraction, natural language answers, and reasoning over business data.

**Decision:** Use Amazon Bedrock with Claude 3.5 Haiku for triage/classification (cheap, fast) and Claude 3.5 Sonnet for reasoning/extraction (more capable).

**Alternatives Considered:**
- **OpenAI via API:** Not AWS-native, adds external dependency.
- **SageMaker hosted models:** Expensive, complex to manage.
- **Bedrock with Titan:** Less capable for our structured extraction needs.

**Consequences:**
- Fully AWS-native (good for hackathon judges)
- Model cascading reduces cost (Haiku ~$0.25/M tokens vs Sonnet ~$3/M)
- No infrastructure to manage
- Pay-per-token pricing

---

## ADR-005: Why Structured Agent Contracts

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Multi-agent systems can produce unpredictable outputs if agents communicate via free-form text. Inspired by LORE and DocSync architectures.

**Decision:** Every agent has strict JSON input/output schemas validated with Zod. If validation fails: STOP → LOG → RETRY or FALLBACK. Agents communicate via typed contracts, not arbitrary text.

**Consequences:**
- Predictable agent behavior
- Detectable failures (schema violations are caught)
- Testable contracts (unit tests can verify schemas)
- Slightly more development overhead for schema definitions

---

## ADR-006: Why Human Approval for External Actions

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** AI systems should not autonomously send emails, messages, or perform financial actions on behalf of a business.

**Decision:** Follow the pattern: AI PROPOSES → SYSTEM VALIDATES → POLICY GATE → HUMAN APPROVES → SYSTEM EXECUTES. No autonomous external communications in MVP.

**Consequences:**
- Users trust the system (it never acts without permission)
- Full audit trail of proposed vs. approved actions
- Slower workflow (requires human in the loop)
- Demonstrates responsible AI design to judges

---

## ADR-007: Why Temporal Memory

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Business facts change over time. Supplier prices change. Warranties expire. Customer relationships evolve. The system must not treat knowledge as timeless.

**Decision:** Use append-only event/history modeling. Never overwrite historical records. Every fact has a timestamp and temporal status (CURRENT, HISTORICAL, EXPIRED, SUPERSEDED).

**Consequences:**
- Can answer "What did we know at the time?"
- Can track price changes over time
- Storage grows over time (mitigated by TTL on non-critical old records)
- More complex queries (must filter by temporal status)

---

## ADR-008: Why Multi-Tenancy from Day One

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Even though the hackathon demo uses one business, architecting for multi-tenancy prevents fundamental redesign later and demonstrates architectural maturity.

**Decision:** Every record includes `tenant_id`. Every query is scoped by `TENANT#<id>` partition key. Cognito JWT carries tenant_id. Backend enforces tenant isolation — never relies on frontend filtering.

**Consequences:**
- Any business can sign up without infrastructure changes
- Tenant isolation is testable and verifiable
- Slightly more complex code (tenant context on every operation)

---

## ADR-009: Why We Did Not Build a Full ERP

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Existing software (Tally, Zoho, Vyapar) handles structured business operations. Our product occupies a different layer — the messy, unstructured information that surrounds the business.

**Decision:** DukaanOS is a persistent business memory and intelligence layer, NOT an accounting system, POS, or inventory management tool.

**Consequences:**
- Clear product differentiation
- Focused scope for hackathon
- Potential future integrations with existing tools
- Does not attempt to replace what works

---

## ADR-010: Why OpenSearch Is Deferred

**Status:** Accepted  
**Date:** 2026-09-17

**Context:** Full-text search and semantic vector search could improve retrieval quality, but OpenSearch has significant cost and complexity.

**Decision:** Defer OpenSearch. Use DynamoDB structured queries for entity lookup and Bedrock for semantic reasoning over retrieved context. Re-evaluate if retrieval quality is insufficient.

**Alternatives Considered:**
- **OpenSearch Serverless:** ~$24/month minimum for 2 OCUs — expensive for hackathon.
- **Kendra:** Purpose-built for search but even more expensive.

**Consequences:**
- Zero additional cost for search
- Simpler architecture
- Slightly less flexible full-text search
- Bedrock reasoning compensates for retrieval limitations
