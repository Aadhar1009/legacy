# DukaanOS

**Your business finally remembers.**

DukaanOS is an AI-powered persistent business-memory and operations layer for local Indian businesses. It turns fragmented business knowledge — scattered across invoices, WhatsApp messages, receipts, spreadsheets, and the owner's memory — into searchable, evidence-backed business intelligence.

## 🎯 What DukaanOS Does

- **Document → Business Memory**: Upload invoices, receipts, warranties. AI extracts entities, relationships, and stores them with full provenance.
- **Natural Language Queries**: Ask "What price did Sharma Electronics give us for Samsung TVs last time?" and get evidence-backed answers.
- **Supplier Intelligence**: Compare suppliers across price, reliability, delivery — distinguishing FACT from INFERENCE from MISSING DATA.
- **Proactive Alerts**: "Supplier price increased 8.7% vs your last 3 purchases" — with evidence, severity, and recommended actions.
- **Human-Approved Actions**: AI drafts supplier inquiries, but humans approve before anything is sent.

## 🏗️ Architecture

```
User → Amplify (Next.js) → API Gateway → Lambda (Hono)
                                             ↓
                                         DynamoDB ← S3 → EventBridge → Step Functions
                                                                            ↓
                                                                    Textract + Bedrock
                                                                            ↓
                                                                    Knowledge Graph
```

**Built on AWS**: Cognito, API Gateway, Lambda, DynamoDB, S3, EventBridge, Step Functions, Textract, Bedrock.

## 📦 Project Structure

```
dukaanos/
├── packages/
│   ├── web/          # Next.js 14 frontend
│   ├── api/          # Hono API on Lambda
│   ├── processing/   # Step Functions Lambda handlers
│   ├── infra/        # AWS CDK infrastructure
│   └── shared/       # Shared TypeScript types
├── tests/            # Test suites
├── docs/             # Documentation
└── scripts/          # Deployment & utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (`npm install -g aws-cdk`)

### Install

```bash
npm install
```

### Run Locally

```bash
# Start the frontend dev server
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

### Seed Demo Data

```bash
npm run seed
```

### Deploy

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run smoke-test

# Deploy to production
npm run deploy:production

# Teardown all infrastructure
npm run teardown
```

### Run Full Test Suite

```bash
# All tests
npm run test:all

# Individual test suites
npm run test           # Unit + integration
npm run test:e2e       # End-to-end (Playwright)
npm run test:security  # Security tests
npm run test:eval      # AI evaluation suite
npm run test:a11y      # Accessibility tests
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design |
| [DATA_MODEL.md](docs/DATA_MODEL.md) | DynamoDB single-table design |
| [AGENTS.md](docs/AGENTS.md) | AI agent architecture and contracts |
| [API.md](docs/API.md) | REST API documentation |
| [SECURITY.md](docs/SECURITY.md) | Security model and practices |
| [THREAT_MODEL.md](docs/THREAT_MODEL.md) | Threat model |
| [COST_MODEL.md](docs/COST_MODEL.md) | AWS cost analysis |
| [TESTING.md](docs/TESTING.md) | Testing strategy |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide |
| [DEMO.md](docs/DEMO.md) | Demo script |
| [ADR.md](docs/ADR.md) | Architecture decision records |
| [OPEN_SOURCE.md](docs/OPEN_SOURCE.md) | Open-source attribution |

## 🎬 Demo

See [DEMO.md](docs/DEMO.md) for the complete 3-minute demo script.

**Demo Business**: Sharma Digital House (fictional Indian electronics store)
- 15 customers, 8 suppliers, 30 products, 40 invoices, 12 warranties

## ⚖️ License

MIT

## 🔒 Security

- No secrets committed to repository
- Tenant isolation enforced at database layer
- Prompt injection defenses on all AI operations
- Human approval required for all external actions
- Full audit logging

---

*DukaanOS doesn't replace the owner's experience. It makes that experience searchable, explainable, and persistent.*
