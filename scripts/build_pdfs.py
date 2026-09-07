import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Enterprise Multi-Agent AI Recruitment Assessment System")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — SYSTEM ARCHITECTURE DOCUMENTATION")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def create_styles():
    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#1e1b4b")
    secondary_color = colors.HexColor("#4338ca")
    text_color = colors.HexColor("#0f172a")
    body_color = colors.HexColor("#334155")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=8
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=body_color,
        leftIndent=15,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderColor=colors.HexColor("#e2e8f0"),
        borderWidth=0.5,
        borderPadding=5,
        spaceBefore=4,
        spaceAfter=6
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        backColor=colors.HexColor("#e0e7ff"),
        borderColor=colors.HexColor("#c7d2fe"),
        borderWidth=1,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'h1': h1_style,
        'h2': h2_style,
        'body': body_style,
        'bullet': bullet_style,
        'code': code_style,
        'callout': callout_style
    }

def build_pdf_1(filepath):
    """PDF 1: Python Backend Architecture & Code Explanation"""
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    s = create_styles()
    story = []

    # Title Banner
    story.append(Paragraph("Multi-Agent AI Recruitment Assessment System", s['title']))
    story.append(Paragraph("DOCUMENT 1: Complete Python Backend Architecture & Source Code Explanation", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceAfter=12))

    story.append(Paragraph("Executive Overview", s['h1']))
    story.append(Paragraph(
        "This document provides a comprehensive technical walkthrough of every Python file in the backend repository. "
        "The backend is engineered as an asynchronous, modular micro-framework powered by FastAPI, LangGraph multi-agent workflows, "
        "Pydantic data schemas, SQLAlchemy ORM with SQLite, Whisper speech-to-text models, and isolated subprocess code execution sandboxing.",
        s['body']
    ))

    # Architecture Overview Table
    summary_data = [
        [Paragraph("<b>Component Layer</b>", s['body']), Paragraph("<b>Directory / Files</b>", s['body']), Paragraph("<b>Primary Functionality</b>", s['body'])],
        [Paragraph("Core Server", s['body']), Paragraph("<code>main.py, core/config.py</code>", s['body']), Paragraph("FastAPI application setup, CORS middleware, lifespan initialization, route binding.", s['body'])],
        [Paragraph("Data & Persistence", s['body']), Paragraph("<code>models/candidate.py, database/</code>", s['body']), Paragraph("SQLAlchemy relational schemas, DB session lifecycle, and initial mock data seeding.", s['body'])],
        [Paragraph("Validation Schemas", s['body']), Paragraph("<code>schemas/*.py</code>", s['body']), Paragraph("Pydantic v2 strict schema models for resumes, assessments, fair scoring, and HR dossiers.", s['body'])],
        [Paragraph("Specialized AI Agents", s['body']), Paragraph("<code>agents/*.py (6 Agents)</code>", s['body']), Paragraph("Autonomous agents: Parsing, Matching, Tech Execution, Screening, Fairness, HR Approval.", s['body'])],
        [Paragraph("Core Services", s['body']), Paragraph("<code>services/*.py</code>", s['body']), Paragraph("LiteLLM / Gemini gateway, Docker sandbox execution, Vector search embeddings, Whisper STT.", s['body'])],
        [Paragraph("Orchestration Workflows", s['body']), Paragraph("<code>workflows/recruitment_graph.py</code>", s['body']), Paragraph("LangGraph StateGraph workflow engine with conditional branching and state preservation.", s['body'])],
        [Paragraph("REST API Endpoints", s['body']), Paragraph("<code>api/routes/*.py (9 Routes)</code>", s['body']), Paragraph("FastAPI routes for candidates, resumes, coding, screening, scoring, shortlisting, and WebSockets.", s['body'])],
    ]
    t = Table(summary_data, colWidths=[110, 150, 244])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Section 1: Server Core
    story.append(Paragraph("1. Core Server Layer", s['h1']))
    story.append(Paragraph("<b>backend/app/main.py</b>", s['h2']))
    story.append(Paragraph(
        "Initializes the FastAPI application instance. Configures CORS middleware to allow cross-origin requests from the Vite frontend (port 5173). "
        "Manages database startup lifecycle via <code>init_db()</code> and <code>seed_database()</code>. Includes the global API routers and starts WebSocket broadcaster.",
        s['body']
    ))
    story.append(Paragraph("<b>backend/app/core/config.py</b>", s['h2']))
    story.append(Paragraph(
        "Centralizes environment variables and application settings using <code>pydantic_settings.BaseSettings</code>. "
        "Manages API keys for Google Gemini and OpenAI, database connection strings, default LLM model selections, and sandbox execution timeouts.",
        s['body']
    ))

    # Section 2: Database & Models
    story.append(Paragraph("2. Database & Data Models Layer", s['h1']))
    story.append(Paragraph("<b>backend/app/models/candidate.py</b>", s['h2']))
    story.append(Paragraph(
        "Defines SQLAlchemy ORM relational models: "
        "<br/>• <b>CandidateModel</b>: Stores candidate metadata, parsed resume JSON, raw text, stage statuses (Pending, Running, Completed), and individual assessment scores."
        "<br/>• <b>JobDescriptionModel</b>: Stores job listings, company names (Stripe, Anthropic, Scale AI, Snowflake), required skills, preferred skills, and experience levels."
        "<br/>• <b>AssessmentRecordModel</b>: Audit trail recording every agent execution timestamp, model used, latency in ms, and full JSON payload."
        "<br/>• <b>HumanReviewModel</b>: Stores human recruiter shortlisting/rejection decisions, notes, and timestamps.",
        s['body']
    ))
    story.append(Paragraph("<b>backend/app/database/session.py & seed_data.py</b>", s['h2']))
    story.append(Paragraph(
        "Configures SQLite engine with thread-safe session factories. <code>seed_data.py</code> populates 6 enterprise company job listings and 3 diverse benchmark candidates for zero-configuration testing.",
        s['body']
    ))

    # Section 3: Specialized Agents
    story.append(Paragraph("3. Autonomous Specialized AI Agents", s['h1']))
    agents_info = [
        ("Agent 1: Parsing Agent (parsing_agent.py)", "Parses unstructured resume text into a standardized Pydantic schema (skills, experience chronology, education, projects, certifications) while enforcing PII masking rules."),
        ("Agent 2: Matching Agent (matching_agent.py)", "Computes semantic cosine similarity between candidate competencies and job descriptions, identifying Strong Matches, Partial Matches, and Missing Skill Gaps."),
        ("Agent 3: Tech Agent (tech_agent.py)", "Coordinates technical coding evaluation, running candidate solutions against hidden unit tests in an isolated sandbox, calculating runtime latency, cyclomatic complexity, and code quality score."),
        ("Agent 4: Screening Agent (screening_agent.py)", "Deconstructs transcribed interview responses using the STAR methodology (Situation, Task, Action, Result), evaluates communication clarity, filler words, and protocol compliance."),
        ("Agent 5: Fairness Agent (fairness_agent.py)", "Enforces strict demographic-blind scoring. Strips candidate names, gender, race, age, and school prestige to generate an objective weighted Merit Score out of 100."),
        ("Agent 6: HR Shortlisting Agent (hr_agent.py)", "Consolidates all agent evaluation vectors into an executive candidate dossier and drafts automated personalized notification emails upon human approval.")
    ]
    for name, desc in agents_info:
        story.append(Paragraph(f"<b>{name}</b>", s['h2']))
        story.append(Paragraph(desc, s['body']))

    # Section 4: Supporting Services
    story.append(Paragraph("4. Core Backend Services", s['h1']))
    services_info = [
        ("LLM Gateway (llm_gateway.py)", "Unified gateway integrating Google Generative AI (gemini-3.6-flash) and OpenAI with automated JSON schema repair, rate limiting, and demo fallback simulator."),
        ("Code Execution Engine (code_execution.py)", "Subprocess-hardened execution sandbox. Enforces 5-second timeout limits, memory isolation, and captures stdout/stderr against parameterized test cases."),
        ("Vector Search & Embeddings (embeddings.py)", "Dense text embedding generator and cosine similarity calculator for semantic skill and keyword alignment."),
        ("Transcription Service (transcription.py)", "Speech-to-Text engine supporting Whisper acoustic models for converting candidate audio recordings into timestamped text transcripts.")
    ]
    for name, desc in services_info:
        story.append(Paragraph(f"<b>{name}</b>", s['h2']))
        story.append(Paragraph(desc, s['body']))

    # Section 5: Workflows & API Routes
    story.append(Paragraph("5. LangGraph Workflow & API Layer", s['h1']))
    story.append(Paragraph("<b>backend/app/workflows/recruitment_graph.py</b>", s['h2']))
    story.append(Paragraph(
        "Builds the LangGraph <code>StateGraph</code> pipeline. Defines state transitions across <code>ResumeParser -> SkillMatcher -> TechAssessment -> AudioScreening -> FairScoring -> HRApproval</code> with cyclic retry loops and conditional branching.",
        s['body']
    ))
    story.append(Paragraph("<b>backend/app/api/routes/</b>", s['h2']))
    story.append(Paragraph(
        "• <code>candidates.py</code>: CRUD operations, job listings, and <code>/portal/upload-resume-file</code> binary PDF/Word parsing endpoint.<br/>"
        "• <code>resume.py</code>: Resume parsing and Pydantic JSON schema validator.<br/>"
        "• <code>matching.py</code>: Skill match and gap analysis triggers.<br/>"
        "• <code>coding.py</code>: Problem catalog and sandbox code execution.<br/>"
        "• <code>screening.py</code>: Whisper audio transcription and STAR analysis endpoint.<br/>"
        "• <code>scoring.py</code>: Demographic-blind scoring matrix computation.<br/>"
        "• <code>hr.py</code>: Human-in-the-loop shortlist/reject approval and email dispatch.<br/>"
        "• <code>workflow.py & ws.py</code>: Full pipeline execution trigger and real-time WebSocket broadcast.",
        s['body']
    ))

    # Section 6: Automated Test Suite
    story.append(Paragraph("6. Automated Unit & Integration Tests", s['h1']))
    story.append(Paragraph("<b>backend/tests/test_agents.py & root conftest.py</b>", s['h2']))
    story.append(Paragraph(
        "Contains 6 automated integration tests validating 100% of backend agents and the complete LangGraph pipeline. Executable directly with <code>python -m pytest backend/tests/test_agents.py -v</code>.",
        s['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)

def build_pdf_2(filepath):
    """PDF 2: Frontend Complete User Guide & Step-by-Step Walkthrough"""
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    s = create_styles()
    story = []

    story.append(Paragraph("Multi-Agent AI Recruitment Assessment System", s['title']))
    story.append(Paragraph("DOCUMENT 2: Complete Frontend User Guide & Step-by-Step Walkthrough", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceAfter=12))

    story.append(Paragraph("Introduction & Dual-Portal Architecture", s['h1']))
    story.append(Paragraph(
        "The application provides a dual-portal experience tailored for both applicants and recruitment teams. "
        "Users can switch seamlessly at any time using the top navigation role switcher between the <b>👤 Candidate Portal</b> and the <b>👔 Recruiter Panel</b>.",
        s['body']
    ))

    # Part 1: Candidate Portal
    story.append(Paragraph("Part 1: Candidate Portal (5-Step Lifecycle Guide)", s['h1']))
    
    cand_steps = [
        ("Step 1: Upload PDF / Word Resume (Zero Typing)",
         "• Drag and drop your <code>.pdf</code>, <code>.docx</code>, <code>.doc</code>, or <code>.txt</code> resume file into the upload zone.<br/>"
         "• Alternatively, click any of the 1-click sample document buttons (Alex Chen Senior Backend, Jordan Miller FullStack AI, Elena Rostova Cloud Architect).<br/>"
         "• The AI model parses the file, extracts technical competencies, work history, and education, and securely saves the candidate profile."),
        ("Step 2: Select Target Company Role & View Skill Gaps",
         "• The portal displays matched open positions across top companies (Stripe, Anthropic, Scale AI, Snowflake, Databricks, OpenAI).<br/>"
         "• Each company card displays the calculated <b>Role Compatibility %</b> (e.g. 94% Match).<br/>"
         "• Click on a company card to review matching technical strengths (in green) and identified skill gaps (in amber).<br/>"
         "• Click 'Proceed to Step 3: Take Coding Test' to begin the technical round."),
        ("Step 3: Live Technical Coding Assessment",
         "• Read the algorithmic problem description (e.g. Two Sum with Hash Map optimization for O(N) performance).<br/>"
         "• Write your Python solution directly in the embedded code editor.<br/>"
         "• Click <b>'Execute & Submit Code'</b> to run the solution inside the isolated secure sandbox.<br/>"
         "• Instantly review test case pass/fail indicators (5/5 Passed), execution latency (49.8ms), and algorithmic complexity rating."),
        ("Step 4: Virtual Audio Interview (Whisper Speech-to-Text)",
         "• Review the screening prompt regarding technical problem-solving and architectural tradeoffs.<br/>"
         "• Click <b>'Record Voice Answer'</b> to capture spoken response via your microphone, or submit existing audio.<br/>"
         "• OpenAI Whisper converts the speech into structured text with live timestamps.<br/>"
         "• Click <b>'Submit Voice Response & Evaluate'</b> to generate the STAR behavioral framework analysis (Situation, Task, Action, Result)."),
        ("Step 5: Combined Merit Score & HR Shortlist Tracker",
         "• Review the <b>Demographic-Blinded Fair Scoring Shield</b> ensuring all personal identifiers are masked.<br/>"
         "• View the final aggregated <b>Merit-Based Score (97.3 / 100)</b> combining Skills, Code, and Interview performance.<br/>"
         "• Follow the real-time application status timeline as your dossier progresses to the HR review queue.")
    ]

    for title, text in cand_steps:
        story.append(Paragraph(f"<b>{title}</b>", s['h2']))
        story.append(Paragraph(text, s['body']))

    # Part 2: Recruiter Panel
    story.append(Paragraph("Part 2: Recruiter Panel (8 Specialized Tabs Guide)", s['h1']))
    
    recruiter_tabs = [
        ("Tab 1: Executive Dashboard & Talent Funnel",
         "Displays the recruitment pipeline funnel (Registered -> Parsed -> Screened -> Shortlisted), overall average scores, and active candidate roster cards with one-click full pipeline evaluation."),
        ("Tab 2: Candidate Profile & Smart Resume Extraction",
         "Shows parsed candidate summary, PII anonymization status, extracted programming languages, databases, cloud tools, work history timeline, and education."),
        ("Tab 3: Role Competency & Skill Gap Analysis",
         "Performs semantic similarity comparison between candidate skills and job descriptions. Displays compatibility gauges, matching strengths, and missing skill gap recommendations."),
        ("Tab 4: Live Sandboxed Coding Assessment",
         "Allows recruiters to inspect candidate Python code, sandbox execution status, test case pass counts, execution runtime, and cyclomatic complexity ratings."),
        ("Tab 5: Virtual Screening & Speech-to-Text Analysis",
         "Features direct audio file upload (.mp3, .wav, .m4a, .ogg) and mic recording. Displays the full transcribed speech text, timestamped segments, STAR breakdown, and communication clarity metrics."),
        ("Tab 6: Objective Demographic-Blind Scoring Matrix",
         "Demonstrates the bias-prevention engine. Shows masked identity tags (CAND-001), objective weights (Skills 35%, Coding 35%, Interview 20%, Protocol 10%), and zero-bias compliance audit checks."),
        ("Tab 7: Comprehensive Candidate Evaluation Dossier",
         "Consolidates all multi-agent scores into an executive briefing with an interactive competency radar chart and AI recommendation verdict."),
        ("Tab 8: Final Shortlisting & Automated HR Notification",
         "Provides Human-in-the-Loop decision controls. Recruiters can Approve & Shortlist, Request Further Review, or Reject, and preview the automated personalized notification email dispatched to the candidate.")
    ]

    for title, text in recruiter_tabs:
        story.append(Paragraph(f"<b>{title}</b>", s['h2']))
        story.append(Paragraph(text, s['body']))

    doc.build(story, canvasmaker=NumberedCanvas)

def build_pdf_3(filepath):
    """PDF 3: Technology Stack Architecture & Design Decisions"""
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    s = create_styles()
    story = []

    story.append(Paragraph("Multi-Agent AI Recruitment Assessment System", s['title']))
    story.append(Paragraph("DOCUMENT 3: Technology Stack Architecture & Engineering Rationale", s['subtitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4f46e5"), spaceAfter=12))

    story.append(Paragraph("Technology Selection Matrix & Architecture Overview", s['h1']))
    story.append(Paragraph(
        "Every technology chosen in this platform was selected to optimize performance, modularity, reliability, data privacy, and explainability. "
        "The architecture adheres to enterprise SaaS best practices with zero vendor lock-in.",
        s['body']
    ))

    # Tech Stack Table
    tech_data = [
        [Paragraph("<b>Domain</b>", s['body']), Paragraph("<b>Technology Used</b>", s['body']), Paragraph("<b>Engineering Rationale & Advantages</b>", s['body'])],
        [Paragraph("Backend Framework", s['body']), Paragraph("<b>FastAPI (Python 3.11)</b>", s['body']), Paragraph("Asynchronous high throughput, native OpenAPI documentation, automatic Pydantic request validation, and lightweight footprint.", s['body'])],
        [Paragraph("Agent Workflow Engine", s['body']), Paragraph("<b>LangGraph (StateGraph)</b>", s['body']), Paragraph("Enables stateful multi-agent orchestration with conditional branching, cyclic retry loops, and deterministic execution.", s['body'])],
        [Paragraph("LLM Gateway & Inference", s['body']), Paragraph("<b>Google Gemini 3.6 Flash / LiteLLM</b>", s['body']), Paragraph("Sub-second latency, native structured JSON mode, generous token context, and automatic fallback capabilities.", s['body'])],
        [Paragraph("Speech-to-Text (STT)", s['body']), Paragraph("<b>OpenAI Whisper Architecture</b>", s['body']), Paragraph("High-accuracy acoustic transcription, automatic punctuation, timestamped diarization, and zero third-party audio leakage.", s['body'])],
        [Paragraph("Code Execution Sandbox", s['body']), Paragraph("<b>Subprocess Hardened Sandbox</b>", s['body']), Paragraph("Safe evaluation of untrusted candidate code with 5s execution timeouts, memory bounds, and stdout/stderr capture.", s['body'])],
        [Paragraph("Vector Semantic Search", s['body']), Paragraph("<b>Dense Vector Embeddings & Cosine Sim</b>", s['body']), Paragraph("Enables semantic skill matching that understands synonyms (e.g. 'PostgreSQL' matches 'Relational Databases') beyond keyword count.", s['body'])],
        [Paragraph("Relational Database", s['body']), Paragraph("<b>SQLAlchemy ORM + SQLite</b>", s['body']), Paragraph("ACID-compliant storage, relational integrity, zero external DB dependencies for seamless local installation and testing.", s['body'])],
        [Paragraph("Frontend Framework", s['body']), Paragraph("<b>React 18 + TypeScript + Vite</b>", s['body']), Paragraph("Type-safe component architecture, sub-second HMR development, production bundle optimization, and high responsiveness.", s['body'])],
        [Paragraph("UI Styling & Theme", s['body']), Paragraph("<b>Tailwind CSS + Lucide Icons</b>", s['body']), Paragraph("Modern enterprise dark-mode design system, glassmorphic panels, animated status indicators, and clean typography.", s['body'])],
        [Paragraph("Testing & Quality", s['body']), Paragraph("<b>Pytest + Pytest-Asyncio</b>", s['body']), Paragraph("Comprehensive test coverage validating all 6 agents and full multi-agent pipeline in under 6 seconds.", s['body'])],
    ]
    t = Table(tech_data, colWidths=[95, 145, 264])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#e2e8f0")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Deep Dives
    story.append(Paragraph("1. Why LangGraph for Multi-Agent Orchestration?", s['h1']))
    story.append(Paragraph(
        "Traditional sequential LLM chains cannot gracefully handle branching logic (e.g. retrying code execution if a syntax error occurs, or skipping virtual interviews for senior candidates). "
        "LangGraph models the recruitment lifecycle as a state machine (<code>StateGraph</code>). Each agent updates a shared, immutable <code>RecruitmentGraphState</code> dictionary, "
        "allowing deterministic transitions, human-in-the-loop checkpoints, and full observability.",
        s['body']
    ))

    story.append(Paragraph("2. Why OpenAI Whisper for Speech-to-Text?", s['h1']))
    story.append(Paragraph(
        "Recruitment voice screening requires high transcription accuracy across diverse accents, technical jargon (e.g., 'Kubernetes', 'FastAPI', 'Redis Streams'), and ambient noise. "
        "Whisper provides state-of-the-art word error rate (WER) and outputs precise timestamped segments, enabling the STAR Behavioral Agent to map exact candidate speech segments to Situation, Task, Action, and Result.",
        s['body']
    ))

    story.append(Paragraph("3. Why Demographic-Blinded Fair Scoring Architecture?", s['h1']))
    story.append(Paragraph(
        "Unconscious recruiter bias is a major obstacle in modern talent acquisition. By decoupling candidate personal identifiers (Name, Gender, Age, Ethnicity, University Brand) "
        "from the evaluation matrix and assigning a deterministic weight formula (Skills 35%, Coding 35%, Interview 20%, Protocol 10%), the system guarantees that shortlisting decisions are 100% merit-based and legally auditable.",
        s['body']
    ))

    story.append(Paragraph("4. Why React + TypeScript + Vite for Frontend?", s['h1']))
    story.append(Paragraph(
        "Recruiters and candidates need instant feedback. Vite delivers lightning-fast build times (under 3s), TypeScript guarantees 100% type safety across API response structures, "
        "and React's reactive state handles live WebSocket progress streaming seamlessly without full-page reloads.",
        s['body']
    ))

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__)) if not os.path.exists("docs") else "docs"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir, exist_ok=True)

    pdf1 = os.path.join(out_dir, "1_Backend_Python_Architecture_and_Code_Explanation.pdf")
    pdf2 = os.path.join(out_dir, "2_Frontend_Complete_User_Guide_and_Step_by_Step_Walkthrough.pdf")
    pdf3 = os.path.join(out_dir, "3_Technology_Stack_Architecture_and_Design_Decisions.pdf")

    print(f"Generating PDF 1 -> {pdf1}")
    build_pdf_1(pdf1)

    print(f"Generating PDF 2 -> {pdf2}")
    build_pdf_2(pdf2)

    print(f"Generating PDF 3 -> {pdf3}")
    build_pdf_3(pdf3)

    print("All 3 documentation PDFs generated successfully!")
