# DukaanOS 2.0 

**The AI-Powered Persistent Business Memory Engine for Local Indian Retail.**

![DukaanOS Architecture](docs/architecture.png) *(Placeholder for diagram)*

DukaanOS is not just another wrapper around a Vector Database. It is a **Living Organizational Record Engine (LORE)** designed specifically to tackle the messy, fragmented realities of the Indian B2B Retail supply chain (Khata credit systems, Bilty/Transport logistics, and ghost inventory).

## 🌟 Why DukaanOS?
Most AI tools "forget" context or hallucinate facts because they overwrite state. DukaanOS features **Memory Evolution**: 
When a supplier changes a price, or a local transport tempo delays a delivery, DukaanOS doesn't just overwrite the database. It spawns **Memory Events** and **Memory Gaps**, building a continuous, verifiable Knowledge Graph of your business operations.

## 🚀 Key Features

*   **🧠 Anti-Forgetting Architecture:** Tracks price fluctuations over time automatically via background EventBridge processing.
*   **🚚 Indian Logistics Hardened:** Detects missing E-Way Bills and "Bilty" (LR) numbers to immediately flag **Ghost Inventory** risks before you lose money.
*   **📖 "Khata" (Credit) Intelligence:** Extracts informal credit days from documents and monitors outstanding ledgers.
*   **🛡️ Evidence-Gated AI Agents:** The multi-agent swarm operates behind a strict `ActionVerifier`. The AI **cannot** declare its own success. Every citation it makes is deterministically verified against the DynamoDB graph.
*   **⚡ 100% Serverless AWS Backend:** Built on AWS CDK using API Gateway, Hono, Step Functions, DynamoDB Single-Table Design, and Amazon Bedrock (Claude 3.5 Sonnet).

## 🏗️ Architecture

DukaanOS runs on a multi-agent routing system:
1.  **Router Agent (Claude Haiku):** Intercepts queries, enforces policy gates (`READ_ONLY`, `DESTRUCTIVE`), and routes to specialists.
2.  **Memory Agent (Claude Sonnet):** Traverses the DynamoDB Graph to reconstruct history using `EVT#` (Events) and `GAP#` records.
3.  **Action Verifier (Deterministic):** A strict backend check ensuring AI actions (like approving a task) actually mutated the database correctly.

> **Read the deep dive here:** [Architecture & LORE Memory Engine](docs/ARCHITECTURE_AND_MEMORY.md)

## 💻 Getting Started (Offline Usability)

We have built a robust **Offline Mock Mode** so you can test the UX without needing live AWS IAM credentials!

```bash
# 1. Clone the repository
git clone https://github.com/Aadhar1009/legacy.git
cd legacy

# 2. Install Dependencies
npm install

# 3. Run the Frontend (with Offline Mode enabled)
cd packages/web
npm run dev
```
Open `http://localhost:3000/memory`. Search for "What did Samsung charge us last time?". The mock API will intercept the request and demonstrate the exact AI Memory Evolution response.

## ☁️ Deployment (AWS CDK)

To deploy the production-ready infrastructure to your AWS account:

```bash
cd packages/infra
npm install
npx cdk bootstrap
npx cdk deploy --all
```

## 🧪 Testing & Evaluation

We maintain a 1000x robust continuous evaluation pipeline:
*   **Unit Tests:** `cd packages/api && npx vitest run`
*   **AI Eval Harness:** Automatically tests the hallucination and retrieval rates of the live Claude models against our `golden_dataset.json`. `npx tsx scripts/evaluate-agents.ts`
