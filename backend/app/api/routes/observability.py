from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import AgentLogModel

router = APIRouter(prefix="/observability", tags=["Observability & Agent Logs"])

@router.get("/logs")
def get_agent_logs(db: Session = Depends(get_db)):
    logs = db.query(AgentLogModel).order_by(AgentLogModel.timestamp.desc()).limit(100).all()
    res = []
    for l in logs:
        res.append({
            "id": l.id,
            "candidate_id": l.candidate_id,
            "agent_name": l.agent_name,
            "action": l.action,
            "status": l.status,
            "model": l.model,
            "prompt_tokens": l.prompt_tokens,
            "completion_tokens": l.completion_tokens,
            "latency_ms": l.latency_ms,
            "details_json": l.details_json,
            "error_message": l.error_message,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return res
