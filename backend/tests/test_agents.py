import pytest
from app.schemas.candidate import ParsedResumeSchema
from app.agents.parsing_agent import ResumeParsingAgent
from app.agents.matching_agent import SkillMatchingAgent
from app.agents.tech_agent import TechCodingAgent
from app.agents.screening_agent import ScreeningAgent
from app.agents.fairness_agent import FairnessAgent
from app.agents.hr_agent import HRAgent
from app.services.code_execution import CodeExecutionService
from app.services.embeddings import EmbeddingService, VectorSearchService
from app.workflows.recruitment_graph import recruitment_app, RecruitmentState

def test_resume_parsing_schema():
    raw_sample = """ALEX CHEN
San Francisco, CA | alex.chen@example.com
Senior Backend Engineer with 6 years experience in Python, FastAPI, Docker, and PostgreSQL.
Education: B.S. in CS from UC Berkeley (2018).
Experience:
Senior Backend Engineer at CloudScale Tech (2021-Present): Built async FastAPI pipelines with Redis."""
    
    parsed, meta = ResumeParsingAgent.parse_resume(raw_sample, candidate_id="CAND-TEST-001")
    assert parsed.name is not None
    assert len(parsed.skills) > 0 or len(parsed.programming_languages) > 0
    assert meta["success"] is True

def test_vector_search_rag():
    chunks = [
        "Built async REST APIs using FastAPI and Python for analytics platform.",
        "Created React and Tailwind CSS user interfaces.",
        "Managed PostgreSQL indexing and Redis caching."
    ]
    results = VectorSearchService.search_similar_evidence("FastAPI", chunks, top_k=1)
    assert len(results) == 1
    assert "FastAPI" in results[0][0]
    assert results[0][1] >= 0.8

def test_code_execution_sandbox():
    code = """def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in seen:
            return [seen[comp], i]
        seen[num] = i
    return []
"""
    test_cases = [
        {"name": "Test 1", "input": "[[2, 7, 11, 15], 9]", "expected": "[0, 1]"},
        {"name": "Test 2", "input": "[[3, 2, 4], 6]", "expected": "[1, 2]"}
    ]
    res = CodeExecutionService.evaluate_solution(
        candidate_id="CAND-TEST-001",
        problem_id="PROB-TWO-SUM",
        language="python",
        code=code,
        test_cases=test_cases
    )
    assert res.all_passed is True
    assert res.passed_count == 2
    assert res.correctness_score == 100.0
    assert res.cyclomatic_complexity >= 1

def test_screening_star_analysis():
    res, meta = ScreeningAgent.analyze_screening("CAND-001")
    assert res.overall_screening_score > 0
    assert len(res.star_analysis) > 0
    assert res.communication_metrics.clarity_score > 0

def test_fairness_pii_masking():
    parsed_sample = ParsedResumeSchema(
        candidate_id="CAND-001",
        name="Alex Chen",
        email="alex@example.com",
        phone="555-0199",
        location="San Francisco, CA",
        summary="Senior Backend Engineer",
        education=[],
        graduation_year=2018,
        skills=["Python", "FastAPI", "Docker"],
        experience=[]
    )
    # Run skill, coding, screening
    skill_res, _ = SkillMatchingAgent.analyze_match(
        candidate_id="CAND-001",
        parsed_resume=parsed_sample,
        job_title="Senior Backend Engineer",
        required_skills=["Python", "FastAPI", "Docker"],
        preferred_skills=[],
        job_description=""
    )
    coding_res, _ = TechCodingAgent.evaluate_candidate_code(
        candidate_id="CAND-001",
        problem_id="PROB-TWO-SUM",
        language="python",
        code=TechCodingAgent.PREDEFINED_PROBLEMS["PROB-TWO-SUM"]["starter_code"]["python"]
    )
    screen_res, _ = ScreeningAgent.analyze_screening("CAND-001")

    fair_res, identity, evaluation = FairnessAgent.calculate_fair_score(
        candidate_id="CAND-001",
        parsed_resume=parsed_sample,
        skill_res=skill_res,
        coding_res=coding_res,
        screening_res=screen_res
    )

    # Verify PII is excluded from EvaluationData
    assert "Alex Chen" not in evaluation.candidate_id
    assert evaluation.role_applied == "Senior Backend Engineer"
    assert fair_res.overall_merit_score > 0
    assert fair_res.fairness_passed is True
    assert len(fair_res.audit_checks) >= 5

def test_langgraph_full_pipeline():
    state: RecruitmentState = {
        "candidate_id": "CAND-001",
        "raw_resume": "Alex Chen, Senior Backend Engineer with Python and FastAPI experience.",
        "job_id": "JD-BACKEND-001",
        "job_title": "Senior Backend Engineer",
        "job_description": "Build high throughput backend services in Python.",
        "required_skills": ["Python", "FastAPI"],
        "preferred_skills": ["Docker"],
        "coding_code": None,
        "coding_language": "python",
        "audio_file_path": None,
        "parsed_resume": None,
        "skill_analysis": None,
        "coding_result": None,
        "screening_result": None,
        "fairness_result": None,
        "human_decision": None,
        "hr_notification": None,
        "current_stage": "Init",
        "logs": [],
        "error": None
    }
    final_state = recruitment_app.invoke(state)
    assert final_state["current_stage"] == "PipelineCompleted"
    assert final_state["parsed_resume"] is not None
    assert final_state["skill_analysis"] is not None
    assert final_state["coding_result"] is not None
    assert final_state["screening_result"] is not None
    assert final_state["fairness_result"] is not None
    assert final_state["hr_notification"] is not None
