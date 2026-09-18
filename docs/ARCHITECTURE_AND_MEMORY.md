# DukaanOS Architecture & LORE Memory Engine

## 1. The Core LORE Philosophy
DukaanOS is built on the **Living Organizational Record Engine (LORE)** concept. Traditional AI wrappers take a prompt, search a vector database, and return a result. 

**This is fundamentally broken for B2B Retail** because retail operations are fluid:
- A supplier's price changes daily.
- Goods are delayed in transit (Ghost Inventory).
- A 30-day "Khata" (Credit) term expires.

If you just dump invoices into a Vector DB, the AI cannot answer "What was the price change?" because it just pulls random chunks. 

**LORE Architecture** changes this. The AI does not just "read" data. Background Agent Lambdas actively *evolve* a persistent Memory Graph.

## 2. Component Architecture

### Infrastructure (AWS CDK)
- **Data Layer:** Single-Table DynamoDB (PAY_PER_REQUEST) tracking `TENANT#` boundaries.
- **Processing Layer:** S3 Bucket (EventBridge Enabled) -> Step Functions -> Textract + Bedrock Claude 3.5 Sonnet.
- **API Layer:** API Gateway -> AWS Lambda (Hono framework).
- **Auth Layer:** Cognito (Multi-tenant via Custom Attributes).

### The AI Swarm
The system uses a **Router Agent** (Claude Haiku) which intercepts queries and applies strict Zod-validated Policy Gates:
- `READ_ONLY`: For pure BI queries.
- `DESTRUCTIVE`: For deleting records.
- `FINANCIAL`: For credit/khata queries.

If a query requires deep historical context, the Router delegates to the **Memory Agent** (Claude Sonnet).

---

## 3. How Agents Communicate & Save History

### Step 1: Ingestion & Extraction (The Birth of a Memory)
When an invoice is uploaded, `extractAndEnrich.ts` executes. Instead of just grabbing text, it executes a strict Bedrock JSON extraction.

**Local Indian Market Localization:** 
The extraction schema specifically hunts for:
- `bilty_number`: Transport receipt (LR) crucial for avoiding "Ghost Inventory" (where items are invoiced but lost in local transport).
- `credit_days`: The informal "Khata" terms agreed upon.
- `eway_bill`: Government compliance tracking.

### Step 2: Gap Detection (Proactive Questioning)
If the Bedrock Agent realizes the `bilty_number` is missing, it doesn't just return a 200 OK. It executes an atomic DynamoDB transaction to write a `MemoryGap`.
```json
{
  "SK": "GAP#123",
  "gap_type": "LOGISTICS_RISK",
  "description": "Potential Ghost Inventory: Missing Bilty/LR Transport Number"
}
```
This enables the AI to proactively warn the user on the dashboard.

### Step 3: Memory Evolution (Anti-Forgetting)
If the extracted price for a "Samsung 55 inch TV" is ₹37,000, but the Knowledge Graph shows the last price was ₹36,000, the Agent does **not** overwrite the old price. 
It creates a `MemoryEvent`:
```json
{
  "SK": "EVT#456",
  "change_type": "UPDATED",
  "old_value": "360000",
  "new_value": "370000",
  "attribute": "latest_price_paise"
}
```
When the user asks, "What did Samsung charge us last time?", the **Memory Agent** reads these exact `EVT#` edges, allowing it to temporally reconstruct the supplier's pricing history with 100% deterministic accuracy.

### Step 4: The Evidence Gate (Anti-Hallucination)
When an agent proposes an answer, it must cite `evidence_ids`.
The `ActionVerifier` (a deterministic backend system, NOT an AI) reads those IDs. If they don't exist in DynamoDB, the AI's action is marked `VERIFICATION_FAILED` and rejected. **The AI cannot declare its own success.**
