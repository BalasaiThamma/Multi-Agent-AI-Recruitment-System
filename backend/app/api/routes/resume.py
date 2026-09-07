import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, AssessmentRecordModel
from app.agents.parsing_agent import ResumeParsingAgent
from app.schemas.candidate import ParsedResumeSchema

router = APIRouter(prefix="/resume", tags=["Resume Parser"])

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
    
    return file_bytes.decode("utf-8", errors="ignore").strip()

@router.post("/upload-file")
async def upload_resume_file(
    candidate_id: str = Form(...),
    file: UploadFile = File(...),
    provider: str = Form("gemini"),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    resume_text = extract_text_from_file(file.filename, file_bytes)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from uploaded document. Please upload a valid PDF, Word docx, or TXT file.")

    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        c = CandidateModel(id=candidate_id, name="Candidate", raw_resume=resume_text)
        db.add(c)

    parsed_obj, meta = ResumeParsingAgent.parse_resume(
        resume_text=resume_text,
        candidate_id=candidate_id,
        provider=provider
    )

    c.name = parsed_obj.name or c.name
    c.email = parsed_obj.email or c.email
    c.phone = parsed_obj.phone or c.phone
    c.location = parsed_obj.location or c.location
    c.raw_resume = resume_text
    c.parsed_data_json = json.dumps(parsed_obj.model_dump())
    c.resume_status = "Completed"

    rec = AssessmentRecordModel(
        id=f"ASSESS-PARSE-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="ResumeParsing",
        status="Completed",
        score=100.0,
        details_json=json.dumps(parsed_obj.model_dump()),
        execution_time_ms=meta.get("latency_ms", 120.0),
        model_used=meta.get("model", "gemini-3.6-flash")
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "filename": file.filename,
        "raw_text": resume_text,
        "data": parsed_obj.model_dump(),
        "metadata": meta
    }

@router.post("/parse")
def parse_resume_text(
    candidate_id: str = Form(...),
    resume_text: str = Form(...),
    provider: str = Form("gemini"),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        # Create candidate if not exists
        c = CandidateModel(id=candidate_id, name="Candidate", raw_resume=resume_text)
        db.add(c)
    
    parsed_obj, meta = ResumeParsingAgent.parse_resume(
        resume_text=resume_text,
        candidate_id=candidate_id,
        provider=provider
    )
    
    c.name = parsed_obj.name or c.name
    c.email = parsed_obj.email or c.email
    c.phone = parsed_obj.phone or c.phone
    c.location = parsed_obj.location or c.location
    c.raw_resume = resume_text
    c.parsed_data_json = json.dumps(parsed_obj.model_dump())
    c.resume_status = "Completed"
    
    # Save assessment record
    rec = AssessmentRecordModel(
        id=f"ASSESS-PARSE-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        stage_name="ResumeParsing",
        status="Completed",
        score=100.0,
        details_json=json.dumps(parsed_obj.model_dump()),
        execution_time_ms=meta.get("latency_ms", 120.0),
        model_used=meta.get("model", "gemini-3.6-flash")
    )
    db.add(rec)
    db.commit()

    return {
        "status": "success",
        "data": parsed_obj.model_dump(),
        "metadata": meta
    }

@router.post("/validate-json")
def validate_parsed_json(payload: dict):
    try:
        validated = ParsedResumeSchema.model_validate(payload)
        return {
            "valid": True,
            "message": "JSON strictly complies with Pydantic Candidate Schema.",
            "data": validated.model_dump()
        }
    except Exception as e:
        return {
            "valid": False,
            "message": f"Validation Error: {str(e)}",
            "errors": str(e)
        }
