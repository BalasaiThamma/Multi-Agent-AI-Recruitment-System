import math
import re
from typing import List, Dict, Any, Tuple

class EmbeddingService:
    """
    Lightweight, hardware-friendly semantic embedding service.
    Generates normalized semantic dense vectors for skills, JD chunks, and candidate experience.
    """
    
    _vocab_cache = {}

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        """Generate a normalized dense vector embedding."""
        words = re.findall(r"\w+", text.lower())
        if not words:
            return [0.0] * 64

        # 64-dimensional semantic projection using feature hashing and sub-word n-grams
        vector = [0.0] * 64
        for w in words:
            h = hash(w) % 64
            vector[h] += 1.0
            # Add character bigrams for morphological similarity
            for i in range(len(w) - 1):
                bg_hash = hash(w[i:i+2]) % 64
                vector[bg_hash] += 0.5

        # Normalize vector to unit length
        norm = math.sqrt(sum(x * x for x in vector))
        if norm > 0:
            vector = [round(x / norm, 5) for x in vector]
        return vector

    @classmethod
    def cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        """Compute cosine similarity between two unit vectors."""
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        return max(0.0, min(1.0, dot_product))


class VectorSearchService:
    """
    Vector search service implementing top-k similarity retrieval for RAG Skill Gap analysis.
    """
    
    @classmethod
    def search_similar_evidence(cls, query_skill: str, candidate_experience_chunks: List[str], top_k: int = 2) -> List[Tuple[str, float]]:
        """
        Search candidate resume chunks for evidence supporting a required skill.
        Returns: List of (chunk_text, similarity_score)
        """
        query_vec = EmbeddingService.get_embedding(query_skill)
        scored = []
        for chunk in candidate_experience_chunks:
            chunk_vec = EmbeddingService.get_embedding(chunk)
            sim = EmbeddingService.cosine_similarity(query_vec, chunk_vec)
            
            # Boost exact keyword match
            if query_skill.lower() in chunk.lower():
                sim = max(sim, 0.92)
            scored.append((chunk, sim))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
