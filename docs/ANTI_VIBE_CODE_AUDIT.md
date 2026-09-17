# Anti-Vibe-Coding Checklist (100 Points)

*DukaanOS enforces strict, intentional engineering. "Vibe coding" (blindly accepting AI-generated code without architectural thought) is not permitted.*

## Architectural Intent (20 pts)
- [x] Are we building a specific product (local business memory) rather than a generic wrapper?
- [x] Is the serverless architecture justified by cost vs scale? (See ADR-001)
- [x] Is the graph modeled correctly in DynamoDB to avoid 20+ sec query times?
- [x] Are the boundaries between API, Auth, and Processing decoupled?

## Multi-Tenancy & Security (20 pts)
- [x] Does EVERY DynamoDB query use a `TENANT#` prefix?
- [x] Is the Tenant ID securely parsed from the JWT in backend middleware?
- [x] Are API Gateway integrations secured with Cognito JWT Authorizers?
- [x] Are AI prompts protected against document-based prompt injection?
- [x] Are S3 upload URLs constrained by size, time, and MIME type?

## AI Integrity (20 pts)
- [x] Does the AI distinguish between FACT, INFERENCE, and MISSING DATA?
- [x] Do all answers require a verifiable `evidence_id`?
- [x] Does the system PROPOSE and wait for HUMAN APPROVAL before taking external action?
- [x] Is token usage optimized via model cascading (Haiku -> Sonnet)?
- [x] Are agent inputs and outputs strictly constrained by Zod schemas?

## Reliability & State (20 pts)
- [x] Is Step Functions used instead of chaining unreliable Lambdas?
- [x] Are operations idempotent (SHA-256 deduplication)?
- [x] Is financial math using integer paise instead of floating-point rupees?
- [x] Are historical facts immutable (append-only)?

## UI / UX (20 pts)
- [x] Are loading states intentional (Skeleton loaders, not flashing blank screens)?
- [x] Are errors actionable? ("Network failed. Retry" instead of "Error 500")
- [x] Are there zero "fake" buttons in the UI?
- [x] Is the contrast ratio compliant with WCAG 2.2 AA?
- [x] Does the app degrade gracefully on mobile viewports?
