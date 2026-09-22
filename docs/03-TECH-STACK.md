# Technology Stack

## FRONTEND
- **Next.js:** React framework for production-grade web applications. Used for SSR/SSG and routing. Local: `npm run dev`.
- **React:** UI library for building components.
- **TypeScript:** Ensures type safety across the frontend domain.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **shadcn/ui:** Reusable, accessible component system based on Radix UI and Tailwind.
- **PDF.js:** In-browser PDF rendering for the Officer Verification Workspace.
- **Recharts or ECharts:** For Lifecycle and Analytics dashboards.

## BACKEND
- **Python:** Industry standard for AI/ML pipelines and rapid backend development.
- **FastAPI:** High-performance async API framework. Used for all REST endpoints.
- **Pydantic:** Data validation and schema definition, heavily used in API and AI extraction boundaries.
- **SQLAlchemy:** Robust ORM for database interactions.

## DATABASE
- **PostgreSQL:** Primary relational store for applications, audit trails, and policies. **PostgreSQL is the required MVP database.**
- **pgvector (OPTIONAL/FUTURE):** pgvector is not required for the initial MVP. It may be introduced later for semantic retrieval, similarity matching or other validated use cases.

## DOCUMENT PROCESSING
- **PyMuPDF:** Fast PDF parsing, text extraction, and operations.
- **pdfplumber:** Detailed layout analysis and bounding box operations.
- **OpenCV:** Image preprocessing for scanned documents to improve OCR quality.
- **PaddleOCR:** High-quality optical character recognition for complex layouts.

## AI
- **LLM/VLM Abstraction Layer:** Business logic must not be tightly coupled to a specific LLM.
- **Ollama/Local Models:** Ollama and local models are development options.
- **Purpose:** Used strictly for OCR post-processing, unstructured text extraction, natural-language explanation generation. AI is NOT invoked automatically for every document, but only where it adds value.

## BACKGROUND
- **Redis:** Message broker and caching layer. Local: Redis docker container.
- **Celery:** Distributed task queue for running OCR, heavy extraction, and cross-document validation asynchronously.

## STORAGE
- **S3-compatible storage:** For storing raw documents and OCR artifacts.
- **MinIO:** For local development object storage. Future production: AWS S3 or equivalent.

## AUTH
- **JWT:** Stateless JSON Web Tokens for authentication.
- **RBAC:** Role-Based Access Control to manage different user permissions.

## ROLES
- APPLICANT
- INSTITUTE_OFFICER
- DISTRICT_OFFICER
- STATE_OFFICER
- MINISTRY_ADMIN
- AUDITOR

## JUSTIFICATION
Technologies were selected to ensure the system is maintainable, scalable, and clearly separates the determinism of policy from the probabilistic nature of AI. No unnecessary technologies are introduced.
