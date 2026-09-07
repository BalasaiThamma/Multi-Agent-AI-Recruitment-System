from typing import Dict, Any, List, Tuple
from app.schemas.assessment import CodingEvaluationResult
from app.services.code_execution import CodeExecutionService

class TechCodingAgent:
    """
    Agent 3: Evaluates candidate code in isolated sandbox.
    Runs test cases, measures execution time, peak memory, edge cases, and cyclomatic complexity.
    """

    PREDEFINED_PROBLEMS = {
        "PROB-TWO-SUM": {
            "id": "PROB-TWO-SUM",
            "title": "Two Sum (Target Pair Indices)",
            "difficulty": "Easy / Medium",
            "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "starter_code": {
                "python": """def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
""",
                "javascript": """function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(nums[i], i);
    }
    return [];
}"""
            },
            "test_cases": [
                {"name": "Basic Case", "input": "[[2, 7, 11, 15], 9]", "expected": "[0, 1]"},
                {"name": "Non-consecutive Indices", "input": "[[3, 2, 4], 6]", "expected": "[1, 2]"},
                {"name": "Duplicate Target Values", "input": "[[3, 3], 6]", "expected": "[0, 1]"},
                {"name": "Negative Integers", "input": "[[-1, -2, -3, -4, -5], -8]", "expected": "[2, 4]"},
                {"name": "Large Array Edge Case", "input": "[[1, 5, 10, 20, 40, 80, 160], 100]", "expected": "[3, 5]"}
            ]
        },
        "PROB-LRU-CACHE": {
            "id": "PROB-LRU-CACHE",
            "title": "LRU Cache Design",
            "difficulty": "Medium / Hard",
            "description": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
            "starter_code": {
                "python": """class LRUCache:
    def __init__(self, capacity: int):
        from collections import OrderedDict
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
"""
            },
            "test_cases": [
                {"name": "Basic Cache Operations", "input": "[[2], ['put', 1, 1], ['put', 2, 2], ['get', 1]]", "expected": "1"},
                {"name": "Capacity Eviction", "input": "[[2], ['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 1]]", "expected": "-1"}
            ]
        }
    }

    @classmethod
    def evaluate_candidate_code(
        cls,
        candidate_id: str,
        problem_id: str,
        language: str,
        code: str,
        provider: str = "docker"
    ) -> Tuple[CodingEvaluationResult, Dict[str, Any]]:
        prob = cls.PREDEFINED_PROBLEMS.get(problem_id, cls.PREDEFINED_PROBLEMS["PROB-TWO-SUM"])
        test_cases = prob.get("test_cases", [])

        result = CodeExecutionService.evaluate_solution(
            candidate_id=candidate_id,
            problem_id=problem_id,
            language=language,
            code=code,
            test_cases=test_cases,
            provider=provider
        )

        meta = {
            "provider": provider,
            "passed_test_cases": f"{result.passed_count}/{result.total_count}",
            "time_ms": result.total_execution_time_ms,
            "peak_memory_mb": result.peak_memory_mb,
            "mode": "SANDBOX_EXECUTED"
        }
        return result, meta
