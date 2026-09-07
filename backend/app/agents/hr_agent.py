import uuid
from datetime import datetime
from typing import Dict, Any, Tuple
from app.schemas.scoring import HRNotification, HumanReviewDecision

class HRAgent:
    """
    Agent 6: Automated HR Notification and Shortlisting Agent.
    - Records human reviewer decisions.
    - Generates structured HR notification events.
    - Preserves fairness by using anonymized candidate references in notification logs.
    """

    @classmethod
    def process_human_decision(
        cls,
        candidate_id: str,
        reviewer_name: str,
        decision: str,
        reviewer_notes: str,
        overall_score: float
    ) -> Tuple[HRNotification, Dict[str, Any]]:
        notification_id = f"NOTIF-{str(uuid.uuid4())[:8].upper()}"
        masked_ref = f"CAND-REF-{candidate_id[-3:]}"
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        if decision == "Approved Shortlist":
            msg = (
                f"Candidate {masked_ref} (Merit Score: {overall_score}/100) has completed all assessment stages "
                f"and was APPROVED FOR SHORTLIST by {reviewer_name}. Notes: '{reviewer_notes}'."
            )
        elif decision == "Rejected":
            msg = (
                f"Candidate {masked_ref} (Merit Score: {overall_score}/100) was marked REJECTED by {reviewer_name}. "
                f"Notes: '{reviewer_notes}'."
            )
        elif decision == "Request Re-Evaluation":
            msg = (
                f"Re-evaluation requested for Candidate {masked_ref} by {reviewer_name}. "
                f"Target stage will be re-queued for agent execution."
            )
        else:
            msg = (
                f"Candidate {masked_ref} flagged for Senior Human Panel Review by {reviewer_name}. "
                f"Notes: '{reviewer_notes}'."
            )

        notif = HRNotification(
            notification_id=notification_id,
            candidate_id=candidate_id,
            candidate_masked_ref=masked_ref,
            overall_score=overall_score,
            decision=decision,
            timestamp=now_str,
            notification_message=msg,
            status="Delivered"
        )

        meta = {
            "action": "HR_NOTIFICATION_DISPATCHED",
            "decision": decision,
            "reviewer": reviewer_name,
            "timestamp": now_str
        }

        return notif, meta
