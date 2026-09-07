import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.candidate import CandidateModel, HumanReviewModel, HRNotificationModel
from app.agents.hr_agent import HRAgent
from app.schemas.scoring import HumanReviewDecision

router = APIRouter(prefix="/hr", tags=["HR Shortlisting & Human In The Loop"])

@router.post("/decision")
def submit_human_decision(
    candidate_id: str = Body(...),
    reviewer_name: str = Body("Hiring Lead"),
    decision: str = Body(...),  # "Approved Shortlist", "Rejected", "Request Re-Evaluation", "Request Human Interview"
    reviewer_notes: str = Body(""),
    db: Session = Depends(get_db)
):
    c = db.query(CandidateModel).filter(CandidateModel.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Update candidate status
    if decision == "Approved Shortlist":
        c.status = "Shortlisted"
        c.approval_status = "Approved"
    elif decision == "Rejected":
        c.status = "Rejected"
        c.approval_status = "Rejected"
    else:
        c.status = "Review Requested"
        c.approval_status = "Review_Requested"

    # Process notification via HRAgent
    notif_obj, meta = HRAgent.process_human_decision(
        candidate_id=candidate_id,
        reviewer_name=reviewer_name,
        decision=decision,
        reviewer_notes=reviewer_notes,
        overall_score=c.overall_merit_score
    )

    # Save Human Review Record
    review_rec = HumanReviewModel(
        id=f"REV-{str(uuid.uuid4())[:8]}",
        candidate_id=candidate_id,
        reviewer_name=reviewer_name,
        decision=decision,
        reviewer_notes=reviewer_notes,
        ai_score_at_time=c.overall_merit_score
    )
    db.add(review_rec)

    # Save Notification Record
    notif_db = HRNotificationModel(
        id=notif_obj.notification_id,
        candidate_id=candidate_id,
        candidate_masked_ref=notif_obj.candidate_masked_ref,
        overall_score=c.overall_merit_score,
        decision=decision,
        message=notif_obj.notification_message,
        status="Delivered"
    )
    db.add(notif_db)
    db.commit()

    return {
        "status": "success",
        "notification": notif_obj.model_dump(),
        "candidate_status": c.status,
        "metadata": meta
    }

@router.get("/notifications")
def list_notifications(db: Session = Depends(get_db)):
    notifs = db.query(HRNotificationModel).order_by(HRNotificationModel.created_at.desc()).all()
    res = []
    for n in notifs:
        res.append({
            "id": n.id,
            "candidate_id": n.candidate_id,
            "candidate_masked_ref": n.candidate_masked_ref,
            "overall_score": n.overall_score,
            "decision": n.decision,
            "message": n.message,
            "status": n.status,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    return res

@router.get("/reviews/{candidate_id}")
def get_candidate_reviews(candidate_id: str, db: Session = Depends(get_db)):
    revs = db.query(HumanReviewModel).filter(HumanReviewModel.candidate_id == candidate_id).all()
    res = []
    for r in revs:
        res.append({
            "id": r.id,
            "reviewer_name": r.reviewer_name,
            "decision": r.decision,
            "reviewer_notes": r.reviewer_notes,
            "ai_score_at_time": r.ai_score_at_time,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return res
