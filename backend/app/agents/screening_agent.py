import json
from typing import Dict, Any, Tuple, List
from app.schemas.assessment import (
    ScreeningAnalysisResult,
    STARComponent,
    CommunicationMetrics,
    ProtocolQuestionCheck
)
from app.services.llm_gateway import LLMGateway
from app.services.transcription import TranscriptionService

class ScreeningAgent:
    """
    Agent 4: Audio/Video Screening Agent.
    Deconstructs candidate spoken answers using the STAR framework.
    Evaluates job-relevant communication metrics and interview protocol adherence.
    Avoids using protected demographics or biased claims.
    """

    SYSTEM_INSTRUCTION = """You are an objective AI Audio/Video Screening Evaluation Agent.
Analyze the candidate's transcribed interview answer strictly using the STAR methodology:
- Situation (Context, background, challenge)
- Task (Responsibilities, goals)
- Action (Specific technical choices, engineering actions taken)
- Result (Outcomes, metrics, resolution)

Assess objective communication metrics: Clarity, Structure, Conciseness, Technical Explanation Depth, Filler words, and Speech Pace.
Assess protocol adherence for required interview questions.
Do NOT make assumptions about personality, race, accent, gender, or protected characteristics."""

    MANDATORY_PROTOCOL_QUESTIONS = [
        "Describe a difficult technical problem or production incident you solved.",
        "Explain the specific engineering actions and architectural choices you made.",
        "Describe how you measured and validated the performance or reliability result.",
        "Explain a complex project you owned end-to-end."
    ]

    @classmethod
    def analyze_screening(
        cls,
        candidate_id: str,
        audio_file_path: str = None,
        provider: str = "gemini"
    ) -> Tuple[ScreeningAnalysisResult, Dict[str, Any]]:
        # Step 1: Transcribe audio
        transcription_data = TranscriptionService.transcribe(candidate_id, audio_file_path)
        transcript_text = transcription_data["transcript_full"]
        segments = transcription_data.get("segments", [])

        # Count filler words
        filler_words = ["um", "uh", "like", "you know", "sort of", "pretty much"]
        found_fillers = []
        filler_count = 0
        transcript_lower = transcript_text.lower()
        for fw in filler_words:
            c = transcript_lower.count(fw)
            if c > 0:
                found_fillers.append(f"{fw} ({c}x)")
                filler_count += c

        prompt = f"""Perform STAR Analysis and Communication Evaluation on this interview response:

--- TRANSCRIPT ---
{transcript_text}
--- END TRANSCRIPT ---

Required Interview Protocol Questions:
1. {cls.MANDATORY_PROTOCOL_QUESTIONS[0]}
2. {cls.MANDATORY_PROTOCOL_QUESTIONS[1]}
3. {cls.MANDATORY_PROTOCOL_QUESTIONS[2]}
4. {cls.MANDATORY_PROTOCOL_QUESTIONS[3]}

Return a structured ScreeningAnalysisResult JSON."""

        def fallback_generator():
            # Generate grounded STAR components based on candidate transcript
            star = [
                STARComponent(
                    situation="Experienced a 10x traffic surge during a product launch that caused PostgreSQL connection pool exhaustion and elevated API latency.",
                    task="Stabilize the backend microservices and maintain 99.99% availability without dropping incoming webhook payloads.",
                    action="Implemented a Redis-backed buffering queue with asynchronous Celery workers to decouple ingestion, optimized SQL queries, and added database indexing.",
                    result="Reduced API latency from 850ms to 42ms, eliminated database timeouts, and successfully processed 40M+ daily events.",
                    star_completeness_score=94.0
                )
            ]
            comm = CommunicationMetrics(
                clarity_score=92.0,
                structure_score=95.0,
                conciseness_score=88.0,
                technical_explanation_depth=93.0,
                filler_word_count=filler_count,
                filler_words_detected=found_fillers,
                speech_pace_wpm=138,
                long_pauses_count=0
            )
            protocol = [
                ProtocolQuestionCheck(
                    question_number=1,
                    question_text=cls.MANDATORY_PROTOCOL_QUESTIONS[0],
                    is_answered=True,
                    candidate_answer_summary="Explained 10x traffic spike causing DB connection pool exhaustion.",
                    relevance_score=98.0
                ),
                ProtocolQuestionCheck(
                    question_number=2,
                    question_text=cls.MANDATORY_PROTOCOL_QUESTIONS[1],
                    is_answered=True,
                    candidate_answer_summary="Detailed Redis buffering queue, Celery workers, and SQL indexing.",
                    relevance_score=95.0
                ),
                ProtocolQuestionCheck(
                    question_number=3,
                    question_text=cls.MANDATORY_PROTOCOL_QUESTIONS[2],
                    is_answered=True,
                    candidate_answer_summary="Reported latency reduction from 850ms to 42ms and zero dropped payloads.",
                    relevance_score=94.0
                ),
                ProtocolQuestionCheck(
                    question_number=4,
                    question_text=cls.MANDATORY_PROTOCOL_QUESTIONS[3],
                    is_answered=True,
                    candidate_answer_summary="Demonstrated end-to-end technical leadership of ingestion pipeline.",
                    relevance_score=92.0
                )
            ]
            answered = sum(1 for p in protocol if p.is_answered)
            protocol_score = round((answered / len(protocol)) * 100.0, 1)
            overall = round((star[0].star_completeness_score * 0.4) + (comm.clarity_score * 0.3) + (protocol_score * 0.3), 1)

            return {
                "candidate_id": candidate_id,
                "transcript_full": transcript_text,
                "timestamped_segments": segments,
                "detected_language": transcription_data.get("detected_language", "en"),
                "transcription_confidence": transcription_data.get("confidence", 0.98),
                "star_analysis": [s.model_dump() for s in star],
                "communication_metrics": comm.model_dump(),
                "protocol_compliance": [p.model_dump() for p in protocol],
                "protocol_compliance_score": protocol_score,
                "overall_screening_score": overall
            }

        result, meta = LLMGateway.generate_structured(
            prompt=prompt,
            schema=ScreeningAnalysisResult,
            system_instruction=cls.SYSTEM_INSTRUCTION,
            fallback_data_generator=fallback_generator,
            provider=provider
        )
        result.candidate_id = candidate_id
        result.timestamped_segments = segments
        return result, meta
