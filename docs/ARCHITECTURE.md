# VidRen AI — System Architecture & Engineering Handbook

## 1. Overview
**VidRen AI** is an Interactive Knowledge Operating System designed to turn complex raw inputs into interactive, hand-drawn vector whiteboards, live math formulas (KaTeX), dynamic state charts, code playgrounds, mind maps, and physics simulations.

---

## 2. Monorepo Organization
- `apps/web`: Next.js 15 App Router Front-End Studio UI.
- `apps/api`: Fastify High-Throughput Server-Sent Events (SSE) Streaming API Server.
- `packages/vidren-dsl`: VidRenDSL 2.0 AST TypeScript types, Zod schemas, and streaming incremental AST parser.
- `packages/vidren-runtime`: React 19 Interactive Whiteboard Canvas and Widget Registry.
- `packages/agent-core`: Multi-Agent Swarm Orchestrator (Planner, DSL Generator, Reflection Agents).
- `packages/rag-engine`: Hybrid BM25 + Dense vector search with Reciprocal Rank Fusion (RRF), Knowledge Graph engine, and Citation engine.
- `packages/database`: PostgreSQL Prisma ORM database models.
- `services/worker-ingestion`: Background document processing service for PDF, Markdown, and Code sources.
- `infra/docker`: Multi-stage Dockerfiles and `docker-compose.yml` local cluster deployment.

---

## 3. Streaming Engine Architecture
VidRen AI utilizes Server-Sent Events (SSE) token streaming via `AgentSwarmOrchestrator` to progressively emit AST nodes to the client runtime before the full LLM completion finishes, guaranteeing immediate time-to-first-frame rendering.

---

## 4. Local Deployment
To run VidRen AI locally via Docker Compose:
```bash
docker-compose up --build
```
Access points:
- Next.js Web Studio: `http://localhost:3000`
- Fastify API Server: `http://localhost:4000`
- PostgreSQL Database: `localhost:5432`
- Redis Cache: `localhost:6379`
