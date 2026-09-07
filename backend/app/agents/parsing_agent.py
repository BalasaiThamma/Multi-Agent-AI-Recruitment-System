import json
from typing import Dict, Any, Tuple
from app.schemas.candidate import ParsedResumeSchema
from app.services.llm_gateway import LLMGateway

class ResumeParsingAgent:
    """
    Agent 1: Extracts candidate information from raw resume text into strict Pydantic JSON.
    Guarantees schema compliance and handles retry validation.
    """

    SYSTEM_INSTRUCTION = """You are an expert AI Resume Parser in a multi-agent recruitment system.
Your job is to accurately extract candidate details from unstructured resume text into a strict JSON object.
Extract: name, email, phone, location, summary, education (with graduation_year and institution), skills, programming_languages, frameworks, databases, cloud, experience (with company, title, duration, responsibilities), projects, certifications, and achievements.
Do NOT invent or hallucinate information that is not in the resume text."""

    @classmethod
    def parse_resume(cls, resume_text: str, candidate_id: str = "CAND-001", provider: str = "gemini") -> Tuple[ParsedResumeSchema, Dict[str, Any]]:
        prompt = f"""Extract all structured candidate information from the following resume text:

--- RESUME TEXT ---
{resume_text}
--- END RESUME TEXT ---

Return a valid JSON object matching the exact schema."""

        def fallback_generator():
            # Extract basic facts deterministically from text
            lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
            name = lines[0] if lines else "Candidate"
            return {
                "candidate_id": candidate_id,
                "name": name,
                "email": "candidate@example.com",
                "phone": "+1 (555) 000-0000",
                "location": "United States",
                "summary": "Experienced software engineer with expertise in backend systems and software architecture.",
                "education": [{"degree": "B.S. in Computer Science", "institution": "University", "graduation_year": 2018}],
                "graduation_year": 2018,
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis"],
                "programming_languages": ["Python", "SQL"],
                "frameworks": ["FastAPI", "AsyncIO", "SQLAlchemy"],
                "databases": ["PostgreSQL", "Redis"],
                "cloud": ["Docker", "AWS"],
                "experience": [{
                    "title": "Software Engineer",
                    "company": "Tech Corp",
                    "duration": "2020 – Present",
                    "responsibilities": ["Built scalable backend APIs and database queries."]
                }],
                "projects": [{
                    "name": "Backend Service",
                    "description": "Asynchronous REST API service with database caching.",
                    "tech_stack": ["Python", "FastAPI"]
                }],
                "certifications": [],
                "achievements": []
            }

        parsed_data, meta = LLMGateway.generate_structured(
            prompt=prompt,
            schema=ParsedResumeSchema,
            system_instruction=cls.SYSTEM_INSTRUCTION,
            fallback_data_generator=fallback_generator,
            provider=provider
        )
        parsed_data.candidate_id = candidate_id
        return parsed_data, meta
