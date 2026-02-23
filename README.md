
<!-- agent-update:start:docs-index -->
# Documentation Index

Welcome to the repository knowledge base. Start with the project overview, then dive into specific guides as needed.

## Core Guides
- [Project Overview](./project-overview.md)
- [Architecture Notes](./architecture.md)
- [AI Governance](./AI-GOVERNANCE.md)
- [Repository Map](./REPOMAP.md)


## Repository Snapshot
- `AGENTS.md` — Agent definitions and playbook entry points.
- `AI-GOVERNANCE.md` — Governance policies for AI usage.
- `apps/` — Application entry points (e.g., web, api).
- `biome.json` — Linter and formatter configuration.
- `package.json` — Root manifest and script definitions.
- `packages/` — Shared workspace packages or modules.
- `pnpm-workspace.yaml` — Monorepo workspace configuration.
- `prisma/` — Database schema and migrations.
- `README.md` — Project root documentation.
- `scripts/` — Automation and utility scripts.
- `tsconfig.base.json` — Base TypeScript configuration.
- `turbo.json` — Turborepo build pipeline configuration.

## Document Map
| Guide | File | AI Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | `project-overview.md` | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | `architecture.md` | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Repormap | `REPOMAP.md` | agent-update:repomap | Repository structure
| AI Governance | `AI-GOVERNANCE.md` | agent-update:ai-governance | Governance policies, compliance requirements |

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Gather context with `git status -sb` plus the latest commits touching `docs/`
2. Compare the current directory tree against the table above; add or retire rows accordingly.
3. Update cross-links if guides moved or were renamed; keep anchor text concise.
4. Record sources consulted inside the commit or PR description for traceability.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Repository tree and `package.json` scripts for canonical command names.
- Maintainer-approved issues, RFCs, or product briefs referenced in the repo.
- Release notes or changelog entries that announce documentation changes.

<!-- agent-update:end -->
