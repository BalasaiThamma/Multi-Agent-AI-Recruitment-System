# Enterprise Multi-Agent AI Recruitment Assessment System

An enterprise-grade talent evaluation platform powered by specialized AI agents for resume extraction, skill-competency matching, live sandboxed code assessment, virtual audio screening, demographic-blind fair scoring, and human-in-the-loop shortlisting.

---

## 🚀 Key Features

### 1. Dual-Portal Experience
- **👔 Recruiter Panel**: Comprehensive talent pipeline oversight, real-time agent activity streaming, candidate dossier breakdown, radar competency charts, and human-in-the-loop shortlisting controls.
- **👤 Candidate Portal**: Interactive applicant journey allowing candidates to submit resumes, solve live coding challenges in an isolated sandbox, record virtual interview responses, and track real-time application status.

### 2. Specialized Multi-Agent Pipeline
1. **Resume Extraction Agent**: Parses unstructured resumes into structured competencies with automated PII guardrails.
2. **Role Competency Match Agent**: Semantic embedding similarity search against job requirements with gap analysis.
3. **Live Coding Sandbox Agent**: Executes Python solutions in an isolated secure sandbox with unit test verification and algorithmic complexity analysis.
4. **Virtual Screening Agent**: Deconstructs candidate audio responses into structured STAR framework metrics (Situation, Task, Action, Result).
5. **Fair Scoring & Bias Audit Agent**: Demographic-blind scoring matrix enforcing objective weightings.
6. **HR Decision & Notification Agent**: Aggregates candidate dossiers and dispatches personalized updates upon recruiter review.

---

## 🛠️ Quick Start

### 1. Run Automated Unit & Integration Tests
```bash
python -m pytest backend/tests/test_agents.py -v
```

### 2. Start the Backend API (Port 8000)
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser to explore both the **Recruiter Panel** and the **Candidate Portal**.

---

## 🌟 Key Architecture & Highlights

```
                                  Candidate Resume
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  Resume Parsing Agent │
                             └───────────┬───────────┘
                                         │ Structured JSON
                                         ▼
                             ┌───────────────────────┐
                             │  Skill Gap & RAG Agent│
                             └───────────┬───────────┘
                                         │ Evidence Citations
                                         ▼
                             ┌───────────────────────┐
                             │ Live Coding Sandbox   │ (Docker / E2B)
                             └───────────┬───────────┘
                                         │ Unit Tests & AST Complexity
                                         ▼
                             ┌───────────────────────┐
                             │ Audio Screening Agent │ (Whisper STAR Analysis)
                             └───────────┬───────────┘
                                         │ Communication Metrics
                                         ▼
                             ┌───────────────────────┐
                             │   Fair Scoring Agent  │ (PII & Demographic Masked)
                             └───────────┬───────────┘
                                         │ 100% Merit Formula
                                         ▼
                             ┌───────────────────────┐
                             │ Human Approval Center │ (Human-in-the-Loop)
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │ Automated HR Shortlist│
                             └───────────────────────┘
```

1. **LiteLLM-Inspired Unified Gateway**:
   - **Google Gemini 3.6 Flash** (`gemini-3.6-flash`) active & verified live.
   - **OpenAI Dual Support** (`gpt-4o-mini`, `gpt-4o`).
   - **High-Fidelity Structured Simulation Mode** when offline or when quotas expire.
2. **LangGraph StateGraph Orchestration**:
   - Central typed `RecruitmentState` passing data across 6 specialized agents.
   - Conditional branching (low match routing, schema validation recovery).
   - Cyclic workflow transitions (human reviewer requesting re-evaluations).
3. **Hardware-Friendly Isolated Code Execution**:
   - **Docker Sandbox Provider** as the free/local default.
   - **E2B Sandbox Provider** as optional cloud integration.
   - AST-based **Cyclomatic Complexity**, **Time Complexity** ($O(n)$), and **Space Complexity** evaluation.
4. **Behavioral STAR Interview Deconstruction**:
   - `faster-whisper` / Whisper transcription with timestamped segments.
   - Automatic decomposition into **Situation, Task, Action, and Result** cards.
   - 4-question mandatory assessment protocol adherence audit.
5. **Fair Scoring with Demographic Blinding**:
   - Quarantines candidate identity (Name, Gender, Location, Graduation Year, Photo) in an isolated vault.
   - Evaluates merit solely on objective job-relevant evidence:
     $$\text{Merit Score} = (\text{Skill Match} \times 30\%) + (\text{Coding} \times 35\%) + (\text{Communication} \times 20\%) + (\text{Protocol} \times 15\%)$$
   - Automated 7-point fairness audit compliance checklist.
6. **Human-in-the-Loop Governance**:
   - No autonomous hiring decisions.
   - Interactive shortlisting dashboard with decision logs, audit trails, and automated HR notification queue.

---

## 🗂️ Application Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point, CORS, WebSockets
│   │   ├── core/config.py           # Pydantic Settings
│   │   ├── models/candidate.py      # SQLAlchemy Models (Candidates, Jobs, Reviews, Logs)
│   │   ├── schemas/                 # Strict Pydantic v2 schemas
│   │   │   ├── candidate.py         # ParsedResumeSchema
│   │   │   ├── assessment.py        # SkillGap, Coding, Screening schemas
│   │   │   └── scoring.py           # FairScoreResult, IdentityData, EvaluationData
│   │   ├── services/
│   │   │   ├── llm_gateway.py       # Central LLM Gateway (Gemini 3.6 Flash + OpenAI + Fallbacks)
│   │   │   ├── code_execution.py    # DockerSandbox & Subprocess AST Complexity Engine
│   │   │   ├── embeddings.py        # Cosine Similarity Vector Search for RAG
│   │   │   └── transcription.py     # Whisper / faster-whisper speech engine
│   │   ├── agents/
│   │   │   ├── parsing_agent.py     # Agent 1: Resume Parser
│   │   │   ├── matching_agent.py    # Agent 2: Skill Match & RAG
│   │   │   ├── tech_agent.py        # Agent 3: Live Coding Sandbox
│   │   │   ├── screening_agent.py   # Agent 4: Audio Screening & STAR
│   │   │   ├── fairness_agent.py    # Agent 5: Fair Scoring (PII Masked)
│   │   │   └── hr_agent.py          # Agent 6: Automated HR Shortlisting
│   │   ├── workflows/
│   │   │   └── recruitment_graph.py # LangGraph StateGraph Pipeline
│   │   └── api/routes/              # REST & WebSocket endpoints
│   ├── tests/
│   │   └── test_agents.py           # Pytest test suite (100% passing)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── tabs/
│   │   │   ├── DashboardTab.tsx     # Tab 1: Executive Dashboard
│   │   │   ├── ResumeParserTab.tsx  # Tab 2: Resume Parser Agent
│   │   │   ├── SkillMatchingTab.tsx # Tab 3: Skill Gap & RAG Match
│   │   │   ├── CodingAssessmentTab.tsx # Tab 4: Coding Sandbox
│   │   │   ├── ScreeningTab.tsx     # Tab 5: Audio Screening & STAR
│   │   │   ├── FairScoringTab.tsx   # Tab 6: Fair Scoring & PII Masking
│   │   │   ├── CandidateReportTab.tsx # Tab 7: Consolidated Dossier
│   │   │   └── HRShortlistingTab.tsx # Tab 8: HR Shortlisting Decision Center
│   │   ├── components/              # Sidebar, Header, AgentActivityPanel, ApiKeyModal
│   │   ├── services/api.ts          # REST & WebSocket client
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
└── docker-compose.yml
```

---

## ⚡ Quick Start: Running Locally

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* Backend API will be available at `http://localhost:8000`
* Interactive OpenAPI Docs at `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* Open your browser at `http://localhost:5173`

---

## 🐳 Running with Docker Compose

To run the complete stack with PostgreSQL (pgvector), Redis, FastAPI backend, and Nginx frontend:

```bash
docker-compose up --build
```

---

## 🧪 Running Automated Tests

Run the full agent test suite with pytest:

```bash
cd backend
python -m pytest tests/test_agents.py -v
```

All 6 tests verify:
- ✅ Resume Parsing into Pydantic schema
- ✅ RAG Vector Search skill evidence retrieval
- ✅ Code Execution Sandbox with unit tests, timing, and AST complexity
- ✅ Audio Screening STAR decomposition
- ✅ PII Masking and 7-Point Fairness Audit
- ✅ LangGraph StateGraph candidate pipeline end-to-end

---

## 🔑 Environment Variables Configuration (`.env`)

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | Pre-configured verified key |
| `DEFAULT_MODEL` | Default Gemini Model | `gemini-3.6-flash` |
| `OPENAI_API_KEY` | OpenAI API Key (Optional) | `.....` |
| `DEFAULT_LLM_PROVIDER` | Active LLM Provider (`gemini` / `openai` / `demo`) | `gemini` |
| `EXECUTION_PROVIDER` | Sandbox Runner (`docker` / `e2b` / `subprocess`) | `docker` |
| `DATABASE_URL` | Database Connection String | `sqlite:///./recruitment_system.db` or PostgreSQL |
| `REDIS_URL` | Redis Cache / Task Queue | `redis://localhost:6379/0` |

---

## 🎯 8-Stage Assessment Walkthrough

1. **Dashboard**: High-level funnel metrics, candidate roster, and instant pipeline triggers.
2. **Resume Parser**: Upload or select sample resumes, live LLM extraction into strict Pydantic JSON, and schema validation.
3. **Skill Gap & RAG**: Select target Job Description, calculate cosine vector similarity, categorize skills (*Strong Match*, *Partial Match*, *Skill Gap*), and view cited resume evidence.
4. **Coding Sandbox**: Select programming language, write solution in code editor, select execution provider (*Docker Free/Local* vs *E2B*), view live test matrix, and inspect Cyclomatic Complexity.
5. **Audio Screening**: Play interview audio sample, inspect timestamped Whisper transcript with confidence score, review 4-card STAR breakdown, and audit 4-question protocol compliance.
6. **Fair Scoring**: Inspect side-by-side **Identity Vault (Masked)** vs **Evaluation Data**, review 4-part weighted merit formula, and verify 7-point fairness audit compliance.
7. **Candidate Report**: Consolidated printable assessment dossier summarizing all agent findings.
8. **HR Shortlisting**: Human reviewer decision center (*Approve Shortlist*, *Reject*, *Request Re-Eval*), reviewer notes logging, and automated HR notification dispatch queue.

