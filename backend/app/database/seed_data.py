import json
from datetime import datetime
from app.database.session import SessionLocal, init_db
from app.models.candidate import CandidateModel, JobDescriptionModel, AssessmentRecordModel, HumanReviewModel

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(CandidateModel).count() > 0:
        db.close()
        return

    # 1. Job Descriptions with Company Names
    jd_stripe = JobDescriptionModel(
        id="JD-STRIPE-001",
        company="Stripe",
        title="Senior Backend Engineer (Payments & Infrastructure)",
        department="Core Infrastructure",
        location="San Francisco, CA / Remote",
        experience_level="Senior (5+ Years)",
        description="""Architect, build, and scale resilient high-throughput payment microservices. Key focus on sub-50ms latency, distributed idempotency, PostgreSQL indexing, and Redis caching.""",
        required_skills_json=json.dumps([
            "Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis", "Distributed Systems"
        ]),
        preferred_skills_json=json.dumps([
            "Kubernetes", "Celery", "Kafka", "AWS", "CI/CD"
        ])
    )

    jd_anthropic = JobDescriptionModel(
        id="JD-ANTHROPIC-002",
        company="Anthropic",
        title="AI Systems & Infrastructure Engineer",
        department="AI Reliability",
        location="San Francisco, CA / Hybrid",
        experience_level="Senior (4+ Years)",
        description="""Build high-performance distributed serving pipelines, async LLM evaluation gateways, and scalable backend infrastructure for Frontier AI safety and intelligence.""",
        required_skills_json=json.dumps([
            "Python", "AsyncIO", "FastAPI", "Docker", "Distributed Systems", "PyTorch"
        ]),
        preferred_skills_json=json.dumps([
            "Kubernetes", "Redis", "Vector Databases", "Triton"
        ])
    )

    jd_scale = JobDescriptionModel(
        id="JD-SCALE-003",
        company="Scale AI",
        title="Full Stack AI Application Engineer",
        department="AI Applications",
        location="New York, NY / Hybrid",
        experience_level="Mid-Senior (3+ Years)",
        description="""Design responsive customer-facing AI agent dashboards and data synthesis platforms using modern React, TypeScript, Python, and vector retrieval pipelines.""",
        required_skills_json=json.dumps([
            "Python", "React", "TypeScript", "FastAPI", "Vector Search", "Tailwind CSS"
        ]),
        preferred_skills_json=json.dumps([
            "Docker", "PostgreSQL", "Redis", "Next.js"
        ])
    )

    jd_snowflake = JobDescriptionModel(
        id="JD-SNOWFLAKE-004",
        company="Snowflake",
        title="Cloud Data Platform Architect",
        department="Data Cloud Infrastructure",
        location="San Mateo, CA / Remote",
        experience_level="Senior (6+ Years)",
        description="""Design cloud-native distributed data storage and query optimization engines. Work with high-concurrency ingestion and distributed SQL pipelines.""",
        required_skills_json=json.dumps([
            "Python", "PostgreSQL", "Distributed Systems", "Docker", "Cloud Architecture"
        ]),
        preferred_skills_json=json.dumps([
            "Go", "Kubernetes", "AWS", "Snowpark"
        ])
    )

    jd_databricks = JobDescriptionModel(
        id="JD-DATABRICKS-005",
        company="Databricks",
        title="Distributed Microservices & Scale Engineer",
        department="Lakehouse Platform",
        location="Mountain View, CA / Remote",
        experience_level="Senior (5+ Years)",
        description="""Scale large-scale compute workloads, containerized execution engines, and microservices orchestration across multi-cloud infrastructure.""",
        required_skills_json=json.dumps([
            "Python", "Docker", "FastAPI", "Distributed Systems", "PostgreSQL"
        ]),
        preferred_skills_json=json.dumps([
            "Kubernetes", "Kafka", "Redis", "gRPC"
        ])
    )

    jd_openai = JobDescriptionModel(
        id="JD-OPENAI-006",
        company="OpenAI",
        title="Backend Scale & Inference Serving Engineer",
        department="Inference Operations",
        location="San Francisco, CA",
        experience_level="Senior (5+ Years)",
        description="""Optimize high-throughput API endpoints, model caching layers, streaming webhooks, and rate-limiting gateways handling millions of global inference requests.""",
        required_skills_json=json.dumps([
            "Python", "FastAPI", "Redis", "AsyncIO", "Docker", "Distributed Systems"
        ]),
        preferred_skills_json=json.dumps([
            "Kubernetes", "Celery", "Kafka", "Rust"
        ])
    )

    jd_google = JobDescriptionModel(
        id="JD-GOOGLE-007",
        company="Google Cloud",
        title="Distributed Systems & SRE Architect",
        department="Cloud Core",
        location="Sunnyvale, CA / Remote",
        experience_level="Staff / Senior (6+ Years)",
        description="""Architect resilient multi-region cloud services, automate chaos engineering protocols, and guarantee five-nines availability across containerized clusters.""",
        required_skills_json=json.dumps([
            "Python", "Go", "Kubernetes", "Docker", "Distributed Systems", "PostgreSQL"
        ]),
        preferred_skills_json=json.dumps([
            "GCP", "Terraform", "gRPC", "Prometheus"
        ])
    )

    jd_figma = JobDescriptionModel(
        id="JD-FIGMA-008",
        company="Figma",
        title="Frontend Web Platform & Canvas Engineer",
        department="Web Engine",
        location="San Francisco, CA / Hybrid",
        experience_level="Senior (4+ Years)",
        description="""Build high-performance real-time collaborative canvas rendering, WebAssembly modules, and reactive UI component architectures in React and TypeScript.""",
        required_skills_json=json.dumps([
            "TypeScript", "React", "JavaScript", "WebSockets", "Tailwind CSS"
        ]),
        preferred_skills_json=json.dumps([
            "WebAssembly", "WebGL", "Rust", "Vite"
        ])
    )

    jd_netflix = JobDescriptionModel(
        id="JD-NETFLIX-009",
        company="Netflix",
        title="High-Throughput Streaming Backend Engineer",
        department="Playback & Encoding",
        location="Los Gatos, CA / Remote",
        experience_level="Senior (5+ Years)",
        description="""Engineer low-latency media delivery microservices, distributed cache coordination, and adaptive bitrate orchestration handling millions of concurrent streams.""",
        required_skills_json=json.dumps([
            "Python", "FastAPI", "Redis", "Distributed Systems", "Docker"
        ]),
        preferred_skills_json=json.dumps([
            "Kafka", "AWS", "gRPC", "Cassandra"
        ])
    )

    jd_aws = JobDescriptionModel(
        id="JD-AWS-010",
        company="Amazon Web Services (AWS)",
        title="Cloud Security & Platform Reliability Engineer",
        department="Identity & Access",
        location="Seattle, WA / Hybrid",
        experience_level="Senior (5+ Years)",
        description="""Implement automated zero-trust security policies, cryptographic secret rotation, and resilient identity authorization microservices.""",
        required_skills_json=json.dumps([
            "Python", "AWS", "Docker", "PostgreSQL", "Security Architecture"
        ]),
        preferred_skills_json=json.dumps([
            "Terraform", "Kubernetes", "IAM", "CI/CD"
        ])
    )

    jd_meta = JobDescriptionModel(
        id="JD-META-011",
        company="Meta",
        title="ML Infrastructure & Feature Pipeline Engineer",
        department="AI Systems",
        location="Menlo Park, CA / Remote",
        experience_level="Senior (4+ Years)",
        description="""Develop large-scale feature stores, real-time embeddings indexing pipelines, and high-throughput training data ingestion services.""",
        required_skills_json=json.dumps([
            "Python", "PyTorch", "Distributed Systems", "PostgreSQL", "Docker"
        ]),
        preferred_skills_json=json.dumps([
            "Vector Databases", "Redis", "Kafka", "Kubernetes"
        ])
    )

    jd_spotify = JobDescriptionModel(
        id="JD-SPOTIFY-012",
        company="Spotify",
        title="Audio Search & Recommendation Engineer",
        department="Personalization Platform",
        location="New York, NY / Remote",
        experience_level="Mid-Senior (3+ Years)",
        description="""Scale personalized recommendation models, real-time playlist generation, and semantic audio feature matching APIs serving 500M+ active users.""",
        required_skills_json=json.dumps([
            "Python", "FastAPI", "Vector Search", "Docker", "PostgreSQL"
        ]),
        preferred_skills_json=json.dumps([
            "GCP", "Redis", "Kafka", "Elasticsearch"
        ])
    )

    jd_apple = JobDescriptionModel(
        id="JD-APPLE-013",
        company="Apple",
        title="Core OS & Systems Software Engineer",
        department="Core Operating Systems",
        location="Cupertino, CA / Hybrid",
        experience_level="Senior (5+ Years)",
        description="""Design low-level system daemons, memory-efficient IPC protocols, and hardware acceleration drivers for Apple Silicon platform integration.""",
        required_skills_json=json.dumps([
            "C++", "Python", "Distributed Systems", "POSIX", "Operating Systems", "Memory Management"
        ]),
        preferred_skills_json=json.dumps([
            "Swift", "Rust", "Kernel Development", "ARM Architecture"
        ])
    )

    jd_uber = JobDescriptionModel(
        id="JD-UBER-014",
        company="Uber",
        title="Real-Time Geospatial & Marketplace Routing Engineer",
        department="Marketplace Dynamics",
        location="San Francisco, CA / Remote",
        experience_level="Senior (4+ Years)",
        description="""Build hyper-scalable real-time dispatch matching engines, geospatial H3 indexing algorithms, and high-throughput Kafka streaming pipelines.""",
        required_skills_json=json.dumps([
            "Go", "Python", "Kafka", "Distributed Systems", "Redis", "PostgreSQL"
        ]),
        preferred_skills_json=json.dumps([
            "gRPC", "Docker", "Kubernetes", "Geospatial Indexing"
        ])
    )

    jd_airbnb = JobDescriptionModel(
        id="JD-AIRBNB-015",
        company="Airbnb",
        title="Full Stack Design System & Experience Engineer",
        department="Guest Experience",
        location="San Francisco, CA / Remote",
        experience_level="Senior (4+ Years)",
        description="""Architect reusable accessible design system components, micro-frontend orchestration, and responsive fluid booking interfaces in TypeScript and React.""",
        required_skills_json=json.dumps([
            "TypeScript", "React", "GraphQL", "Tailwind CSS", "JavaScript"
        ]),
        preferred_skills_json=json.dumps([
            "Next.js", "Jest", "Web Accessibility (a11y)", "Design Systems"
        ])
    )

    jd_coinbase = JobDescriptionModel(
        id="JD-COINBASE-016",
        company="Coinbase",
        title="Institutional Settlement & Security Infrastructure Engineer",
        department="Core Trading Engine",
        location="New York, NY / Remote",
        experience_level="Senior (5+ Years)",
        description="""Build cryptographic key management vaults, ultra-reliable double-entry ledger backends, and sub-millisecond order matching engines in Go and Python.""",
        required_skills_json=json.dumps([
            "Go", "Python", "PostgreSQL", "Docker", "Security Architecture", "Distributed Systems"
        ]),
        preferred_skills_json=json.dumps([
            "Redis", "Kafka", "Cryptography", "AWS"
        ])
    )

    jd_tesla = JobDescriptionModel(
        id="JD-TESLA-017",
        company="Tesla",
        title="Fleet Telemetry & High-Concurrency Cloud Engineer",
        department="Vehicle Software",
        location="Palo Alto, CA / Hybrid",
        experience_level="Senior (4+ Years)",
        description="""Scale real-time ingestion pipelines processing petabytes of vehicle sensor telemetry, MQTT streaming brokers, and distributed timeseries storage.""",
        required_skills_json=json.dumps([
            "Python", "FastAPI", "Distributed Systems", "Kafka", "Docker", "PostgreSQL"
        ]),
        preferred_skills_json=json.dumps([
            "Kubernetes", "Rust", "TimescaleDB", "gRPC"
        ])
    )

    jd_cloudflare = JobDescriptionModel(
        id="JD-CLOUDFLARE-018",
        company="Cloudflare",
        title="Edge Compute & Serverless Runtime Architect",
        department="Workers Platform",
        location="Austin, TX / Remote",
        experience_level="Staff / Senior (6+ Years)",
        description="""Design ultra-low-latency edge runtime execution environments, V8 isolate sandboxes, and distributed global cache consistency protocols.""",
        required_skills_json=json.dumps([
            "Rust", "TypeScript", "Distributed Systems", "Docker", "Linux Networking"
        ]),
        preferred_skills_json=json.dumps([
            "WebAssembly", "C++", "eBPF", "Kubernetes"
        ])
    )

    db.add(jd_stripe)
    db.add(jd_anthropic)
    db.add(jd_scale)
    db.add(jd_snowflake)
    db.add(jd_databricks)
    db.add(jd_openai)
    db.add(jd_google)
    db.add(jd_figma)
    db.add(jd_netflix)
    db.add(jd_aws)
    db.add(jd_meta)
    db.add(jd_spotify)
    db.add(jd_apple)
    db.add(jd_uber)
    db.add(jd_airbnb)
    db.add(jd_coinbase)
    db.add(jd_tesla)
    db.add(jd_cloudflare)

    # 2. Candidate 1: Alex Chen (Senior Backend Engineer - Strong Match)
    cand_alex = CandidateModel(
        id="CAND-001",
        name="Alex Chen",
        email="alex.chen@example.com",
        phone="+1 (555) 234-5678",
        location="San Francisco, CA",
        role_applied="Senior Backend Engineer",
        status="Shortlisted",
        raw_resume="""ALEX CHEN
San Francisco, CA | alex.chen@example.com | +1 (555) 234-5678 | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Results-driven Senior Backend Engineer with 6+ years of experience designing resilient distributed systems, high-throughput RESTful APIs, and cloud microservices in Python and FastAPI. Proven track record of scaling backend services to 50k+ QPS with sub-50ms latency using Redis caching, PostgreSQL indexing, and asynchronous pipelines.

TECHNICAL SKILLS
• Languages: Python (Expert), Go, SQL, TypeScript, Bash
• Frameworks: FastAPI, AsyncIO, SQLAlchemy, Celery, Pydantic, Django
• Databases & Storage: PostgreSQL, Redis, pgvector, DynamoDB
• DevOps & Cloud: Docker, Kubernetes, AWS (ECS, S3, RDS, Lambda), GitHub Actions, Terraform
• Architecture: Distributed Systems, Event-Driven Architecture, Microservices, REST APIs, RAG

PROFESSIONAL EXPERIENCE
Senior Backend Engineer | CloudScale Tech | San Francisco, CA | 2021 – Present
• Architected a high-concurrency event ingestion service in Python and FastAPI, handling 40M+ daily events with 99.99% uptime.
• Reduced database query latency by 45% by restructuring PostgreSQL indexing and implementing distributed Redis caching layers.
• Led the containerization and CI/CD migration of 12 microservices using Docker and Kubernetes.
• Mentored 4 junior/mid engineers and established strict code quality, typing, and testing standards.

Backend Software Engineer | DataStream Labs | Austin, TX | 2018 – 2021
• Built asynchronous data processing pipelines using Python, Celery, and Redis for real-time analytics.
• Designed and maintained relational database schemas in PostgreSQL, ensuring ACID compliance and high query throughput.
• Integrated Docker container sandboxes for isolated customer script execution.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2014 – 2018

PROJECTS
• Distributed Task Orchestrator: Built an open-source task queue with asyncio, Redis, and heartbeat monitoring.
• Vector Search Pipeline: Implemented semantic search using pgvector and FastAPI for document retrieval.""",
        parsed_data_json=json.dumps({
            "candidate_id": "CAND-001",
            "name": "Alex Chen",
            "email": "alex.chen@example.com",
            "phone": "+1 (555) 234-5678",
            "location": "San Francisco, CA",
            "summary": "Results-driven Senior Backend Engineer with 6+ years of experience designing resilient distributed systems, high-throughput RESTful APIs, and cloud microservices in Python and FastAPI.",
            "education": [{
                "degree": "B.S. in Computer Science",
                "institution": "University of California, Berkeley",
                "graduation_year": 2018,
                "gpa_or_grade": "3.8/4.0"
            }],
            "graduation_year": 2018,
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AsyncIO", "Redis", "Distributed Systems", "Kubernetes", "Celery", "AWS"],
            "programming_languages": ["Python", "Go", "SQL", "TypeScript", "Bash"],
            "frameworks": ["FastAPI", "AsyncIO", "SQLAlchemy", "Celery", "Pydantic", "Django"],
            "databases": ["PostgreSQL", "Redis", "pgvector", "DynamoDB"],
            "cloud": ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Terraform"],
            "experience": [
                {
                    "title": "Senior Backend Engineer",
                    "company": "CloudScale Tech",
                    "duration": "2021 – Present",
                    "responsibilities": [
                        "Architected a high-concurrency event ingestion service in Python and FastAPI handling 40M+ daily events.",
                        "Reduced DB query latency by 45% via PostgreSQL indexing and Redis caching.",
                        "Containerized 12 microservices with Docker & Kubernetes."
                    ]
                },
                {
                    "title": "Backend Software Engineer",
                    "company": "DataStream Labs",
                    "duration": "2018 – 2021",
                    "responsibilities": [
                        "Built async pipelines with Python, Celery, and Redis for real-time analytics.",
                        "Integrated Docker container sandboxes for isolated code execution."
                    ]
                }
            ],
            "projects": [
                {
                    "name": "Distributed Task Orchestrator",
                    "description": "Open-source async task queue with heartbeat monitoring and Redis state backend.",
                    "tech_stack": ["Python", "AsyncIO", "Redis"],
                    "link": "https://github.com/alexchen-dev/task-orchestrator"
                }
            ],
            "certifications": ["AWS Certified Solutions Architect – Associate"],
            "achievements": ["Speaker at PyBay 2023 on High-Performance AsyncIO Backend Architecture"]
        }),
        resume_status="Completed",
        matching_status="Completed",
        coding_status="Completed",
        screening_status="Completed",
        fairness_status="Completed",
        approval_status="Approved",
        skill_match_score=94.0,
        coding_score=96.0,
        communication_score=91.0,
        protocol_score=100.0,
        overall_merit_score=95.0
    )

    # 3. Candidate 2: Jordan Miller (Mid Fullstack Engineer - Partial Match)
    cand_jordan = CandidateModel(
        id="CAND-002",
        name="Jordan Miller",
        email="jordan.miller@example.com",
        phone="+1 (555) 789-0123",
        location="Seattle, WA",
        role_applied="Senior Backend Engineer",
        status="Awaiting Approval",
        raw_resume="""JORDAN MILLER
Seattle, WA | jordan.miller@example.com | +1 (555) 789-0123

SUMMARY
Versatile Fullstack Software Engineer with 3.5 years of experience building modern web interfaces in React and backend services in Node.js and Python. Passionate about API development, UI/UX aesthetics, and collaborative agile environments.

SKILLS
• Languages: JavaScript, TypeScript, Python (Intermediate), HTML/CSS, SQL
• Frontend: React, Redux, Tailwind CSS, Next.js, Vite
• Backend: Node.js, Express, Python (Flask, basic FastAPI), REST APIs
• Databases: MongoDB, PostgreSQL, SQLite
• Tools: Git, Docker, Jest, Postman

EXPERIENCE
Fullstack Developer | Nexus Interactive | Seattle, WA | 2022 – Present
• Developed interactive dashboard interfaces in React and Tailwind CSS for 100k+ active users.
• Built REST API endpoints using Node.js and Flask to support authentication and user preference services.
• Optimized front-end bundle load times by 35% through code-splitting and asset optimization.

Junior Web Developer | Agile Web Solutions | Portland, OR | 2020 – 2022
• Implemented responsive UI components in React and wrote integration tests with Jest.
• Collaborated with backend teams to integrate JSON REST endpoints with PostgreSQL databases.

EDUCATION
B.S. in Information Systems | University of Washington | 2016 – 2020""",
        parsed_data_json=json.dumps({
            "candidate_id": "CAND-002",
            "name": "Jordan Miller",
            "email": "jordan.miller@example.com",
            "phone": "+1 (555) 789-0123",
            "location": "Seattle, WA",
            "summary": "Versatile Fullstack Software Engineer with 3.5 years of experience building modern web interfaces in React and backend services in Node.js and Python.",
            "education": [{
                "degree": "B.S. in Information Systems",
                "institution": "University of Washington",
                "graduation_year": 2020,
                "gpa_or_grade": "3.5/4.0"
            }],
            "graduation_year": 2020,
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "Docker", "Tailwind CSS"],
            "programming_languages": ["JavaScript", "TypeScript", "Python", "SQL"],
            "frameworks": ["React", "Redux", "Tailwind CSS", "Next.js", "Express", "Flask", "FastAPI"],
            "databases": ["MongoDB", "PostgreSQL", "SQLite"],
            "cloud": ["Docker", "Git"],
            "experience": [
                {
                    "title": "Fullstack Developer",
                    "company": "Nexus Interactive",
                    "duration": "2022 – Present",
                    "responsibilities": [
                        "Developed interactive dashboards in React and Tailwind CSS.",
                        "Built REST endpoints using Node.js and Flask.",
                        "Optimized frontend load times by 35%."
                    ]
                }
            ],
            "projects": [
                {
                    "name": "Realtime Kanban Board",
                    "description": "Collaborative drag-and-drop task board with WebSocket sync.",
                    "tech_stack": ["React", "Node.js", "WebSockets"],
                    "link": "https://github.com/jordanm-dev/kanban-live"
                }
            ],
            "certifications": [],
            "achievements": []
        }),
        resume_status="Completed",
        matching_status="Completed",
        coding_status="Completed",
        screening_status="Completed",
        fairness_status="Completed",
        approval_status="Pending",
        skill_match_score=72.0,
        coding_score=78.0,
        communication_score=85.0,
        protocol_score=75.0,
        overall_merit_score=77.1
    )

    # 4. Candidate 3: Taylor Reed (Data / Systems Engineer - Review Case)
    cand_taylor = CandidateModel(
        id="CAND-003",
        name="Taylor Reed",
        email="taylor.reed@example.com",
        phone="+1 (555) 456-7890",
        location="Chicago, IL",
        role_applied="Senior Backend Engineer",
        status="Registered",
        raw_resume="""TAYLOR REED
Chicago, IL | taylor.reed@example.com | +1 (555) 456-7890

SUMMARY
Senior Data and Systems Engineer with 5+ years of experience specializing in Python, data pipelines, database query optimization, and low-latency algorithmic solutions. Extensive background in data structures and backend processing.

SKILLS
• Languages: Python (Advanced), C++, SQL, Bash
• Data & Backend: FastAPI, Pandas, PySpark, PostgreSQL, ClickHouse, Docker
• Cloud: AWS (S3, EMR, Athena), Docker, Linux administration

EXPERIENCE
Senior Data Platform Engineer | QuantAnalytics Corp | Chicago, IL | 2020 – Present
• Designed low-latency data processing engines in Python and C++ capable of streaming 20GB/min.
• Optimized PostgreSQL and ClickHouse queries, reducing execution time on analytical queries by 60%.
• Built internal API microservices with FastAPI and Docker.

Software Engineer | Apex FinTech | Chicago, IL | 2018 – 2020
• Developed automated ingestion jobs and database maintenance scripts in Python and SQL.

EDUCATION
B.S. in Applied Mathematics & Computer Science | Northwestern University | 2014 – 2018""",
        parsed_data_json=None,
        resume_status="Pending",
        matching_status="Pending",
        coding_status="Pending",
        screening_status="Pending",
        fairness_status="Pending",
        approval_status="Pending",
        skill_match_score=0.0,
        coding_score=0.0,
        communication_score=0.0,
        protocol_score=0.0,
        overall_merit_score=0.0
    )

    # 5. Seed Coding & Assessment Records for Seeded Candidates
    alex_code = """def two_sum(nums: list[int], target: int) -> list[int]:
    # Optimized Hash Table lookup - O(n) Time, O(n) Space
    lookup = {}
    for idx, val in enumerate(nums):
        diff = target - val
        if diff in lookup:
            return [lookup[diff], idx]
        lookup[val] = idx
    return []
"""

    assess_alex = AssessmentRecordModel(
        id="ASSESS-CODE-ALEX-01",
        candidate_id="CAND-001",
        stage_name="CodingAssessment",
        status="Completed",
        score=96.0,
        details_json=json.dumps({
            "candidate_id": "CAND-001",
            "problem_id": "PROB-TWO-SUM",
            "language": "python",
            "submitted_code": alex_code,
            "all_passed": True,
            "passed_count": 5,
            "total_count": 5,
            "total_execution_time_ms": 12.4,
            "peak_memory_mb": 14.8,
            "time_complexity_estimated": "O(N)",
            "space_complexity_estimated": "O(N)",
            "cyclomatic_complexity": 3,
            "cyclomatic_complexity_rating": "Clean / Highly Maintainable",
            "edge_cases_handled": {
                "Negative Integers": True,
                "Duplicates": True,
                "Empty Array / No Target Pair": True,
                "Large Boundary Values": True
            },
            "overall_coding_score": 96.0,
            "test_case_results": [
                {"test_id": "TC-1", "name": "Basic Positive Integers", "passed": True, "execution_time_ms": 2.1, "input_data": "[[2, 7, 11, 15], 9]", "expected_output": "[0, 1]", "actual_output": "[0, 1]"},
                {"test_id": "TC-2", "name": "Non-consecutive Indices", "passed": True, "execution_time_ms": 1.9, "input_data": "[[3, 2, 4], 6]", "expected_output": "[1, 2]", "actual_output": "[1, 2]"},
                {"test_id": "TC-3", "name": "Duplicate Target Values", "passed": True, "execution_time_ms": 2.2, "input_data": "[[3, 3], 6]", "expected_output": "[0, 1]", "actual_output": "[0, 1]"},
                {"test_id": "TC-4", "name": "Negative Integers", "passed": True, "execution_time_ms": 2.8, "input_data": "[[-1, -2, -3, -4, -5], -8]", "expected_output": "[2, 4]", "actual_output": "[2, 4]"},
                {"test_id": "TC-5", "name": "Large Array Edge Case", "passed": True, "execution_time_ms": 3.4, "input_data": "[[1, 5, 10, 20, 40, 80, 160], 100]", "expected_output": "[3, 5]", "actual_output": "[3, 5]"}
            ]
        }),
        execution_time_ms=12.4,
        model_used="Sandbox-docker"
    )

    db.add(cand_alex)
    db.add(cand_jordan)
    db.add(cand_taylor)
    db.add(assess_alex)
    db.commit()
    db.close()
    print("Database seeded with sample candidates, JDs, and assessments successfully.")

if __name__ == "__main__":
    seed_database()
