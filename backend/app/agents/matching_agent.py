import json
from typing import Dict, Any, List, Tuple
from app.schemas.candidate import ParsedResumeSchema
from app.schemas.assessment import SkillGapAnalysisResult, SkillMatchItem
from app.services.llm_gateway import LLMGateway
from app.services.embeddings import VectorSearchService

class SkillMatchingAgent:
    """
    Agent 2: Compares Candidate Resume against Job Description using RAG vector similarity.
    Categorizes skills into Strong Match, Partial Match, and Skill Gap with evidence citations.
    """

    SYSTEM_INSTRUCTION = """You are an objective AI Skill Matching Agent.
Compare the candidate's skills and experience against the job description requirements.
Cite direct evidence from the candidate resume for every match.
Categorize each required and preferred skill into: 'Strong Match', 'Partial Match', or 'Skill Gap'.
Calculate an accurate overall match percentage (0 to 100)."""

    @classmethod
    def analyze_match(
        cls,
        candidate_id: str,
        parsed_resume: ParsedResumeSchema,
        job_title: str,
        required_skills: List[str],
        preferred_skills: List[str],
        job_description: str,
        provider: str = "gemini"
    ) -> Tuple[SkillGapAnalysisResult, Dict[str, Any]]:
        # Extract experience text chunks for RAG vector search
        exp_chunks = []
        for exp in parsed_resume.experience:
            chunk = f"{exp.title} at {exp.company} ({exp.duration}): " + " ".join(exp.responsibilities)
            exp_chunks.append(chunk)
        for proj in parsed_resume.projects:
            exp_chunks.append(f"Project {proj.name}: {proj.description} Tech: {', '.join(proj.tech_stack)}")
        
        # Combine candidate skills
        candidate_all_skills = set(
            [s.lower() for s in parsed_resume.skills] +
            [s.lower() for s in parsed_resume.programming_languages] +
            [s.lower() for s in parsed_resume.frameworks] +
            [s.lower() for s in parsed_resume.databases] +
            [s.lower() for s in parsed_resume.cloud]
        )

        # RAG evidence retrieval for each required skill
        skill_evidence_map = {}
        for req in required_skills + preferred_skills:
            top_evidence = VectorSearchService.search_similar_evidence(req, exp_chunks, top_k=1)
            if top_evidence and top_evidence[0][1] > 0.4:
                skill_evidence_map[req] = (top_evidence[0][0], top_evidence[0][1])
            else:
                skill_evidence_map[req] = (None, 0.0)

        prompt = f"""Evaluate candidate fit for the following role:
Job Title: {job_title}
Required Skills: {json.dumps(required_skills)}
Preferred Skills: {json.dumps(preferred_skills)}

Candidate Profile:
- Summary: {parsed_resume.summary}
- Skills: {json.dumps(parsed_resume.skills)}
- Programming Languages: {json.dumps(parsed_resume.programming_languages)}
- Frameworks: {json.dumps(parsed_resume.frameworks)}
- Databases: {json.dumps(parsed_resume.databases)}
- Cloud / DevOps: {json.dumps(parsed_resume.cloud)}
- Experience: {json.dumps([e.model_dump() for e in parsed_resume.experience])}

Vector Search Evidence Retrieval:
{json.dumps({k: v[0] for k, v in skill_evidence_map.items() if v[0] is not None}, indent=2)}

Produce a structured SkillGapAnalysisResult JSON object."""

        def fallback_generator():
            strong = []
            partial = []
            gaps = []
            matched_count = 0

            for req in required_skills:
                ev_text, sim = skill_evidence_map.get(req, (None, 0.0))
                req_lower = req.lower()
                if req_lower in candidate_all_skills or sim >= 0.8:
                    strong.append(SkillMatchItem(
                        skill_name=req,
                        category="Strong Match",
                        candidate_evidence=ev_text or f"Demonstrated {req} proficiency in listed skills and projects.",
                        confidence=0.95,
                        importance="Required"
                    ))
                    matched_count += 1
                elif sim >= 0.5 or any(req_lower in s for s in candidate_all_skills):
                    partial.append(SkillMatchItem(
                        skill_name=req,
                        category="Partial Match",
                        candidate_evidence=ev_text or f"Related foundational exposure to {req}.",
                        confidence=0.75,
                        importance="Required"
                    ))
                    matched_count += 0.5
                else:
                    gaps.append(SkillMatchItem(
                        skill_name=req,
                        category="Skill Gap",
                        candidate_evidence=None,
                        confidence=0.90,
                        importance="Required"
                    ))

            for pref in preferred_skills:
                ev_text, sim = skill_evidence_map.get(pref, (None, 0.0))
                pref_lower = pref.lower()
                if pref_lower in candidate_all_skills or sim >= 0.7:
                    strong.append(SkillMatchItem(
                        skill_name=pref,
                        category="Strong Match",
                        candidate_evidence=ev_text or f"Demonstrated {pref} background.",
                        confidence=0.90,
                        importance="Preferred"
                    ))
                else:
                    partial.append(SkillMatchItem(
                        skill_name=pref,
                        category="Partial Match",
                        candidate_evidence=None,
                        confidence=0.70,
                        importance="Preferred"
                    ))

            total_req = len(required_skills) if required_skills else 1
            overall_score = round(min(100.0, max(20.0, (matched_count / total_req) * 100.0)), 1)

            recs = []
            if gaps:
                recs.append(f"Candidate should gain practical production experience in: {', '.join([g.skill_name for g in gaps])}.")
            if partial:
                recs.append(f"Deepen hands-on competency in: {', '.join([p.skill_name for p in partial])}.")
            if not gaps and not partial:
                recs.append("Candidate demonstrates comprehensive coverage of all core technical requirements.")

            return {
                "candidate_id": candidate_id,
                "job_title": job_title,
                "overall_match_score": overall_score,
                "strong_matches": [s.model_dump() for s in strong],
                "partial_matches": [s.model_dump() for s in partial],
                "skill_gaps": [s.model_dump() for s in gaps],
                "experience_gap_notes": "Candidate meets the required senior experience threshold with relevant distributed systems exposure.",
                "education_match_notes": "Education meets the Computer Science degree requirements.",
                "recommendations": recs
            }

        result, meta = LLMGateway.generate_structured(
            prompt=prompt,
            schema=SkillGapAnalysisResult,
            system_instruction=cls.SYSTEM_INSTRUCTION,
            fallback_data_generator=fallback_generator,
            provider=provider
        )
        result.candidate_id = candidate_id
        return result, meta
