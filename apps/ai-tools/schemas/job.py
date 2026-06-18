from pydantic import BaseModel
from typing import Optional

class JobPayloadSchema(BaseModel):
    id: int
    title: str
    description: str
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    industry: Optional[str] = None
    jobType: str
    experienceLevel: Optional[str] = None
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    workAddress: Optional[str] = None
    province: Optional[str] = None
    companyId: int
    employerId: int
    companyName: Optional[str] = None
