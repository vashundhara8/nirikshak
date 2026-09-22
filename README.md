# MoTA Scholarship Intelligence & Lifecycle Platform

## 1. Project Purpose
To provide a secure, policy-aware and explainable intelligent verification and lifecycle layer that complements existing scholarship infrastructure such as NSP, DBT and PFMS, helping officers process applications more consistently, transparently and efficiently while retaining human decision authority.

## 2. Core Principle
**AI ASSISTS • RULES GOVERN • OFFICER DECIDES**

## 3. Repository Structure
- `frontend/`: Next.js web application for Applicant and Officer workspaces.
- `backend/`: FastAPI core logic, REST APIs, and database models.
- `ai/`: Encapsulated AI/LLM integrations for extraction and explainability.
- `policy-engine/`: Deterministic rule evaluation logic.
- `documents/`: Document ingestion, OCR, and validation pipelines.
- `dataset/`: Synthetic scenarios and ground truth for evaluation.
- `database/`: Database schemas, migrations, and seeds.
- `workers/`: Background asynchronous tasks (Celery).
- `tests/`: Comprehensive testing suite.
- `docs/`: Frozen architectural specifications and plans.

## 4. Current Development Stage
**STEP 2 — PROJECT SKELETON**

Application functionality has not yet been implemented. This repository currently contains the project skeleton and frozen architecture documentation.

## 5. Technology Direction
- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL
- **Document Processing:** PaddleOCR, PyMuPDF, OpenCV
- **Background Jobs:** Celery, Redis
- **Storage:** MinIO (S3-compatible)

## 6. Documentation Source of Truth
Please refer to the `docs/` directory for the frozen source of truth, particularly:
- `docs/01-PRD.md`
- `docs/02-ARCHITECTURE.md`
- `docs/IMPLEMENTATION_PLAN.md`

## 7. Upcoming Implementation Phases
Please refer to `docs/IMPLEMENTATION_PLAN.md` for the detailed 18-phase rollout strategy. The MVP strictly prioritizes the Officer Verification Workspace.

## Documentation Consistency Check
- [x] **PRD ↔ Architecture:** Both reflect verification runs, evidence preservation, and human-led decisions.
- [x] **Architecture ↔ Tech Stack:** PostgreSQL required; pgvector optional; AI pipeline matches tech choices.
- [x] **Architecture ↔ API:** APIs exist for versioned verification runs, evidence, and policy versions.
- [x] **Dataset ↔ Domain Model:** Ground truth aligns with the Evidence/Verification Run concepts.
- [x] **Dataset ↔ Verification Engine:** Evaluation metrics strictly measure determinism.
- [x] **Design System ↔ Product Screens:** Officer Workspace is the 3-panel core product demo.
- [x] **Implementation Plan ↔ Architecture:** Evaluation harness is built before the core UI.
