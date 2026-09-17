# DukaanOS — Cost Model

> All estimates are for hackathon/startup scale (~1,000 documents/month, ~5,000 API requests/month).
> Estimates based on AWS US East (N. Virginia) pricing as of September 2026.

## Monthly Cost Breakdown

| AWS Service | Usage | Estimated Monthly Cost | Free Tier? |
|-------------|-------|----------------------|------------|
| **Amplify Hosting** | 1 Next.js app, SSR | $0.00 – $3.00 | Generous free tier |
| **Cognito** | <100 MAUs | **$0.00** | 50,000 MAUs free |
| **API Gateway HTTP API** | ~5,000 requests | **$0.005** | 1M free (first 12 months) |
| **Lambda** | ~10,000 invocations, ARM64 | **$0.00** | 1M requests + 400K GB-s free |
| **DynamoDB On-Demand** | <1 GB, ~50K read/write | **$0.00** | 25 GB + 25 WCU/RCU free |
| **S3 Storage** | ~2 GB documents | **$0.05** | 5 GB free tier |
| **EventBridge** | ~1,000 events | **$0.00** | Free for S3 events |
| **Step Functions** | ~1,000 executions | **$0.10** | 4,000 state transitions free |
| **Textract (AnalyzeExpense)** | ~1,000 pages | **$10.00** | $0.01/page |
| **Bedrock (Claude Haiku)** | ~5,000 triage calls | **$1.25** | $0.25/M input tokens |
| **Bedrock (Claude Sonnet)** | ~1,000 extraction + 500 queries | **$4.50** | $3.00/M input tokens |
| **CloudWatch Logs** | 7-day retention | **$0.50** | Varies |
| **Secrets Manager** | 2–3 secrets | **$1.20** | $0.40/secret/month |
| | | | |
| **TOTAL** | | **~$15 – $21 / month** | |

## Cost Per Operation

| Operation | Estimated Cost | Notes |
|-----------|---------------|-------|
| Document upload + full processing | ~$0.015 | S3 + Textract ($0.01) + Bedrock Sonnet (~$0.005) |
| AI memory query (simple) | ~$0.001 | Haiku triage + DynamoDB query |
| AI memory query (complex) | ~$0.005 | Haiku triage + Sonnet reasoning |
| Entity creation | ~$0.0001 | DynamoDB write |
| Alert generation | ~$0.0001 | DynamoDB write |

## Cost Reduction Strategies

1. **Document SHA-256 deduplication** — Skip Textract for identical documents. Saves $0.01/duplicate.
2. **Model cascading** — Haiku ($0.25/M) for triage, Sonnet ($3.00/M) only for complex reasoning. ~80% of requests use Haiku.
3. **Prompt caching** — Schema and few-shot examples cached in Bedrock. Reduces input token cost by ~90%.
4. **CloudWatch log retention** — Set to 7 days. Prevents unbounded log storage costs.
5. **S3 lifecycle rules** — Glacier Instant Retrieval after 90 days. 68% storage cost reduction.
6. **ARM64 Lambdas** — 20% lower cost per millisecond vs x86.
7. **HTTP API v2** — 70% cheaper than REST API ($1.00/M vs $3.50/M).

## Scaling Estimates

| Scale | Documents/Month | Queries/Month | Estimated Cost |
|-------|----------------|---------------|----------------|
| Hackathon demo | 50 | 200 | ~$2–5 |
| Single business | 200 | 1,000 | ~$8–12 |
| 10 businesses | 2,000 | 10,000 | ~$40–60 |
| 100 businesses | 20,000 | 100,000 | ~$350–500 |

> **Note:** All estimates are approximate. Actual costs depend on document complexity, query patterns, and model token usage. Monitor AWS Cost Explorer for actual spend.

## Zero-Scale Cost

When the application is idle (no requests):
- **Lambda, DynamoDB, API Gateway, EventBridge, Step Functions:** $0.00
- **S3 storage:** ~$0.02/GB/month for stored documents
- **Secrets Manager:** ~$1.20/month (fixed per secret)
- **CloudWatch:** Minimal log storage

**Idle cost: ~$1.50/month**
