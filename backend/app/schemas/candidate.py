from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class EducationItem(BaseModel):
    degree: str = Field(..., description="Degree obtained or pursued")
    institution: str = Field(..., description="College/University name")
    graduation_year: Optional[int] = Field(None, description="Graduation year")
    gpa_or_grade: Optional[str] = Field(None, description="GPA or grade if mentioned")

class ExperienceItem(BaseModel):
    title: str = Field(..., description="Job role title")
    company: str = Field(..., description="Company or organization name")
    duration: str = Field(..., description="Duration/Dates of employment")
    responsibilities: List[str] = Field(default_factory=list, description="Key responsibilities and bullet points")

class ProjectItem(BaseModel):
    name: str = Field(..., description="Project name")
    description: str = Field(..., description="Project summary and impact")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies and libraries used")
    link: Optional[str] = Field(None, description="Repository or live URL")

class ParsedResumeSchema(BaseModel):
    candidate_id: Optional[str] = Field(None, description="Unique candidate identifier")
    name: str = Field(..., description="Candidate full name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, State/Country")
    summary: str = Field(..., description="Professional profile summary")
    education: List[EducationItem] = Field(default_factory=list)
    graduation_year: Optional[int] = Field(None, description="Primary graduation year")
    skills: List[str] = Field(default_factory=list, description="General key skills")
    programming_languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    cloud: List[str] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)

class CandidateCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    raw_resume_text: str
    role_applied: str = "Senior Backend Engineer"

class CandidateResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    role_applied: str
    status: str
    parsed_data: Optional[Dict[str, Any]] = None
    created_at: str
