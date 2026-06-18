from pydantic import BaseModel, Field
from typing import List, Optional

class ExtractedSalarySchema(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    negotiable: bool = False
    raw_salary: Optional[str] = None

class ExtractedOthersSchema(BaseModel):
    location: Optional[str] = None
    experience: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    job_type: Optional[str] = None
    industry: Optional[str] = None
    raw_text: Optional[str] = None

class ExtractedJobQuerySchema(BaseModel):
    jobs: List[str] = Field(default_factory=list)
    salary: ExtractedSalarySchema = Field(default_factory=ExtractedSalarySchema)
    others: ExtractedOthersSchema = Field(default_factory=ExtractedOthersSchema)
