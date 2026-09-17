# DukaanOS — Open-Source Attribution

> This document records all third-party open-source software, patterns, and architectural inspirations used in DukaanOS.

## Architectural Inspirations

These projects inspired architectural patterns in DukaanOS. **No code was copied from any of these projects.**

| Project | Competition | License | What We Borrowed |
|---------|------------|---------|-----------------|
| LORE (Living Organizational Record Engine) | GitLab AI Hackathon 2026 Grand Prize | Not publicly licensed | Concepts: multi-agent router, persistent memory, knowledge graph, memory evolution, temporal tracking, testing culture (43-test standard) |
| RepoWarden | GitLab AI Hackathon 2026 | MIT (README repo) | Concepts: Intent/Contract/Decision/Danger layer architecture |
| Ripple | GitLab AI Hackathon 2026 | MIT | Concepts: Event-triggered multi-agent pipeline, impact analysis, dependency graph traversal |
| ContextCat | GitLab AI Hackathon 2026 | MIT | Concepts: Persistent memory layer, multi-agent orchestration, stage-gated execution |
| DocSync | GitLab AI Hackathon 2026 | Not publicly licensed | Concepts: Detector → Writer → Reviewer pattern, dual-path confidence routing |

## Runtime Dependencies

| Package | License | Purpose |
|---------|---------|---------|
| next | MIT | React framework for frontend |
| react / react-dom | MIT | UI library |
| hono | MIT | Lightweight web framework for Lambda |
| zod | MIT | Schema validation |
| tailwindcss | MIT | Utility-first CSS |
| @radix-ui/* | MIT | Accessible UI primitives |
| lucide-react | ISC | Icon library |
| aws-amplify | Apache-2.0 | AWS Amplify SDK |
| @aws-sdk/* | Apache-2.0 | AWS SDK v3 |
| aws-cdk-lib | Apache-2.0 | AWS CDK v2 |
| ulid | MIT | Unique lexicographic IDs |
| date-fns | MIT | Date utility library |
| clsx | MIT | Class name utility |
| tailwind-merge | MIT | Tailwind class merging |

## Development Dependencies

| Package | License | Purpose |
|---------|---------|---------|
| typescript | Apache-2.0 | Type system |
| vitest | MIT | Test runner |
| playwright | Apache-2.0 | E2E testing |
| esbuild | MIT | JavaScript bundler |
| turbo | MIT | Monorepo build system |
| prettier | MIT | Code formatter |
| axe-core | MPL-2.0 | Accessibility testing |

## Fonts

| Font | License | Usage |
|------|---------|-------|
| Inter | SIL Open Font License 1.1 | Body text (loaded via next/font) |

## Legal Notes

- All dependencies are compatible with MIT licensing.
- No proprietary code or assets are included.
- No real customer data or PII is used anywhere.
- Demo data uses fictional business names and contacts.
- AWS service usage is governed by the AWS Customer Agreement.
