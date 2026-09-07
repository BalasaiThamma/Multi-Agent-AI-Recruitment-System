import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, JobDescriptionModel
from app.database.seed_data import seed_database
from app.agents.parsing_agent import ResumeParsingAgent
from app.agents.matching_agent import SkillMatchingAgent

router = APIRouter(prefix="/candidates", tags=["Candidates"])

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        try:
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            extracted = "\n".join([page.extract_text() or "" for page in reader.pages]).strip()
            if extracted:
                return extracted
        except Exception as e:
            print(f"PDF extraction warning: {e}")
    elif ext in ["docx", "doc"]:
        try:
            import io
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            extracted = "\n".join([p.text for p in doc.paragraphs if p.text]).strip()
            if extracted:
                return extracted
        except Exception as e:
            print(f"DOCX extraction warning: {e}")
    
    # Fallback to UTF-8 decoding
    return file_bytes.decode("utf-8", errors="ignore").strip()

@router.get("/")
def list_candidates(db: Session = Depends(get_db)):
    cands = db.query(CandidateModel).all()
    results = []
    for c in cands:
        parsed = json.loads(c.parsed_data_json) if c.parsed_data_json else None
        results.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_applied": c.role_applied,
            "status": c.status,
            "resume_status": c.resume_status,
            "matching_status": c.matching_status,
            "coding_status": c.coding_status,
            "screening_status": c.screening_status,
            "fairness_status": c.fairness_status,
            "approval_status": c.approval_status,
            "skill_match_score": c.skill_match_score,
            "coding_score": c.coding_score,
            "communication_score": c.communication_score,
            "protocol_score": c.protocol_score,
            "overall_merit_score": c.overall_merit_score,
            "parsed_data": parsed,
            "raw_resume": c.raw_resume
        })
    return results

@router.get("/jobs/all")
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobDescriptionModel).all()
    res = []
    for j in jobs:
        res.append({
            "id": j.id,
            "company": getattr(j, "company", "TechCorp Inc.") or "TechCorp Inc.",
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "experience_level": j.experience_level,
            "description": j.description,
            "required_skills": json.loads(j.required_skills_json) if j.required_skills_json else [],
            "preferred_skills": json.loads(j.preferred_skills_json) if j.preferred_skills_json else []
        })
    return res

@router.get("/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    parsed = json.loads(c.parsed_data_json) if c.parsed_data_json else None
    return {
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "role_applied": c.role_applied,
        "status": c.status,
        "resume_status": c.resume_status,
        "matching_status": c.matching_status,
        "coding_status": c.coding_status,
        "screening_status": c.screening_status,
        "fairness_status": c.fairness_status,
        "approval_status": c.approval_status,
        "skill_match_score": c.skill_match_score,
        "coding_score": c.coding_score,
        "communication_score": c.communication_score,
        "protocol_score": c.protocol_score,
        "overall_merit_score": c.overall_merit_score,
        "parsed_data": parsed,
        "raw_resume": c.raw_resume
    }

@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)):
    db.query(CandidateModel).delete()
    db.query(JobDescriptionModel).delete()
    db.commit()
    seed_database()
    return {"message": "Demo data reset successfully with candidates and job descriptions."}

@router.post("/portal/upload-resume-file")
async def portal_upload_resume_file(
    file: UploadFile = File(...),
    candidate_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    resume_text = extract_text_from_file(file.filename, file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded document. Please upload a valid PDF, Word docx, or TXT file.")

    target_candidate_id = candidate_id or f"CAND-{str(uuid.uuid4())[:6].upper()}"

    # 1. AI model extracts profile from document text
    parsed_obj, meta = ResumeParsingAgent.parse_resume(
        resume_text=resume_text,
        candidate_id=target_candidate_id,
        provider="gemini"
    )

    # 2. Determine inferred role
    inferred_role = "Senior Backend Engineer"
    skills_str = " ".join(parsed_obj.skills or []).lower()
    if "react" in skills_str or "fullstack" in skills_str or "typescript" in skills_str:
        inferred_role = "Full Stack AI Application Engineer"
    elif "snowflake" in skills_str or "data platform" in skills_str:
        inferred_role = "Cloud Data Platform Architect"

    # 3. Store in DB
    c = db.query(CandidateModel).filter(CandidateModel.id == target_candidate_id).first()
    if not c:
        c = CandidateModel(
            id=target_candidate_id,
            name=parsed_obj.name or "Applicant",
            email=parsed_obj.email or "",
            phone=parsed_obj.phone or "",
            location=parsed_obj.location or "",
            role_applied=inferred_role,
            status="Registered",
            raw_resume=resume_text,
            parsed_data_json=json.dumps(parsed_obj.model_dump()),
            resume_status="Completed"
        )
        db.add(c)
    else:
        c.name = parsed_obj.name or c.name
        c.email = parsed_obj.email or c.email
        c.phone = parsed_obj.phone or c.phone
        c.location = parsed_obj.location or c.location
        c.raw_resume = resume_text
        c.parsed_data_json = json.dumps(parsed_obj.model_dump())
        c.resume_status = "Completed"
        c.role_applied = inferred_role

    db.commit()

    # 4. Compare with all company jobs in database
    jobs = db.query(JobDescriptionModel).all()
    job_matches = []
    for j in jobs:
        req_skills = json.loads(j.required_skills_json) if j.required_skills_json else []
        pref_skills = json.loads(j.preferred_skills_json) if j.preferred_skills_json else []
        
        match_result, _ = SkillMatchingAgent.analyze_skill_match(
            candidate_skills=parsed_obj.skills or [],
            candidate_experience_years=5,
            job_required_skills=req_skills,
            job_preferred_skills=pref_skills,
            job_title=j.title,
            job_description=j.description
        )

        job_matches.append({
            "id": j.id,
            "company": getattr(j, "company", "TechCorp Inc.") or "TechCorp Inc.",
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "experience_level": j.experience_level,
            "description": j.description,
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "compatibility_score": round(match_result.overall_match_score, 1),
            "matching_skills": [m.skill_name for m in match_result.strong_matches],
            "skill_gaps": [g.skill_name for g in match_result.skill_gaps],
            "recommendations": match_result.recommendations
        })

    job_matches.sort(key=lambda x: x["compatibility_score"], reverse=True)

    return {
        "filename": file.filename,
        "candidate_id": c.id,
        "candidate": {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_applied": c.role_applied,
            "status": c.status,
            "resume_status": c.resume_status,
            "skill_match_score": c.skill_match_score,
            "coding_score": c.coding_score,
            "communication_score": c.communication_score,
            "overall_merit_score": c.overall_merit_score,
            "parsed_data": parsed_obj.model_dump(),
            "raw_resume": c.raw_resume
        },
        "parsed_resume": parsed_obj.model_dump(),
        "matched_jobs": job_matches
    }

@router.post("/portal/register-resume")
def portal_register_resume(payload: dict, db: Session = Depends(get_db)):
    resume_text = payload.get("resume_text", "")
    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required")
    
    candidate_id = payload.get("candidate_id") or f"CAND-{str(uuid.uuid4())[:6].upper()}"
    preferred_role = payload.get("preferred_role", "Senior Backend Engineer")
    
    # 1. AI understands and parses resume
    parsed_obj, meta = ResumeParsingAgent.parse_resume(
        resume_text=resume_text,
        candidate_id=candidate_id,
        provider="gemini"
    )

    # 2. Save or update candidate in DB
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        c = CandidateModel(
            id=candidate_id,
            name=parsed_obj.name or payload.get("name", "Applicant"),
            email=parsed_obj.email or payload.get("email", ""),
            role_applied=preferred_role,
            status="Registered",
            raw_resume=resume_text,
            parsed_data_json=json.dumps(parsed_obj.model_dump()),
            resume_status="Completed"
        )
        db.add(c)
    else:
        c.name = parsed_obj.name or c.name
        c.email = parsed_obj.email or c.email
        c.raw_resume = resume_text
        c.parsed_data_json = json.dumps(parsed_obj.model_dump())
        c.resume_status = "Completed"
        c.role_applied = preferred_role

    db.commit()

    # 3. Query all jobs and calculate role compatibility
    jobs = db.query(JobDescriptionModel).all()
    job_matches = []
    for j in jobs:
        req_skills = json.loads(j.required_skills_json) if j.required_skills_json else []
        pref_skills = json.loads(j.preferred_skills_json) if j.preferred_skills_json else []
        
        match_result, _ = SkillMatchingAgent.analyze_skill_match(
            candidate_skills=parsed_obj.skills or [],
            candidate_experience_years=5,
            job_required_skills=req_skills,
            job_preferred_skills=pref_skills,
            job_title=j.title,
            job_description=j.description
        )

        job_matches.append({
            "id": j.id,
            "company": getattr(j, "company", "TechCorp Inc.") or "TechCorp Inc.",
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "experience_level": j.experience_level,
            "description": j.description,
            "required_skills": req_skills,
            "preferred_skills": pref_skills,
            "compatibility_score": round(match_result.overall_match_score, 1),
            "matching_skills": [m.skill_name for m in match_result.strong_matches],
            "skill_gaps": [g.skill_name for g in match_result.skill_gaps],
            "recommendations": match_result.recommendations
        })

    job_matches.sort(key=lambda x: x["compatibility_score"], reverse=True)

    return {
        "candidate_id": c.id,
        "candidate": {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "role_applied": c.role_applied,
            "status": c.status,
            "resume_status": c.resume_status,
            "skill_match_score": c.skill_match_score,
            "coding_score": c.coding_score,
            "communication_score": c.communication_score,
            "overall_merit_score": c.overall_merit_score,
            "parsed_data": parsed_obj.model_dump(),
            "raw_resume": c.raw_resume
        },
        "parsed_resume": parsed_obj.model_dump(),
        "matched_jobs": job_matches
    }
